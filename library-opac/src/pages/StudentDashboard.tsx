import { useEffect, useState } from "react";

import {
  BookOpen,
  Bookmark,
  Clock,
  LogOut,
  User,
  ArrowRight,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

interface Borrowing {
  id: number;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;

  bookCopy: {
    accessionNumber: string;

    book: {
      id: number;
      title: string;

      author: {
        name: string;
      };
    };
  };
}

interface Reservation {
  id: number;
  reservedAt: string;
  status: string;

  book: {
    id: number;
    title: string;

    author: {
      name: string;
    };
  };
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [borrowings, setBorrowings] =
    useState<Borrowing[]>([]);

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [cancelingId, setCancelingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          borrowingsResponse,
          reservationsResponse,
        ] = await Promise.all([
          api.get("/borrowings/my"),
          api.get("/reservations/my"),
        ]);

        setBorrowings(
          borrowingsResponse.data
        );

        setReservations(
          reservationsResponse.data
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );

        setError(
          "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================
     CANCEL RESERVATION
  ========================= */

  const handleCancelReservation = async (
    reservationId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelingId(reservationId);
      setError("");

      await api.put(
        `/reservations/${reservationId}/cancel`
      );

      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === reservationId
            ? {
                ...reservation,
                status: "CANCELLED",
              }
            : reservation
        )
      );
    } catch (error: any) {
      console.error(
        "Cancel reservation error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to cancel reservation."
      );
    } finally {
      setCancelingId(null);
    }
  };

  /* =========================
     ACTIVE DATA
  ========================= */

  const activeBorrowings =
    borrowings.filter(
      (borrowing) =>
        !borrowing.returnedAt
    );

  const pendingReservations =
    reservations.filter(
      (reservation) =>
        reservation.status === "PENDING"
    );

  /* =========================
     DAYS REMAINING
  ========================= */

  const getDaysRemaining = (
    dueDate: string
  ) => {
    const today = new Date();

    const due = new Date(dueDate);

    const difference =
      due.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="dashboard-navbar">

        <div className="dashboard-navbar-inner">

          <Link
            to="/"
            className="dashboard-logo"
          >
            <div className="dashboard-logo-icon">
              <BookOpen size={21} />
            </div>

            Library OPAC
          </Link>

          <div className="dashboard-nav-right">

            <Link to="/">
              Browse Books
            </Link>

            <div className="user-menu">

              <User size={18} />

              <span>
                {user.name || "Student"}
              </span>

            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={17} />

              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              STUDENT PORTAL
            </span>

            <h1>
              Welcome,{" "}
              {user.name || "Student"}!
            </h1>

            <p>
              Manage your borrowed books
              and reservations.
            </p>

          </div>

          <Link
            to="/"
            className="browse-button"
          >
            <BookOpen size={17} />

            Browse Books
          </Link>

        </div>

        {/* ERROR */}

        {error && (
          <div className="reservation-error">
            {error}
          </div>
        )}

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="dashboard-stats">

          {/* BORROWED */}

          <div className="stat-card">

            <div className="stat-icon blue">
              <BookOpen size={21} />
            </div>

            <div>

              <span>
                Borrowed Books
              </span>

              <strong>
                {activeBorrowings.length}
              </strong>

            </div>

          </div>

          {/* RESERVATIONS */}

          <div className="stat-card">

            <div className="stat-icon orange">
              <Bookmark size={21} />
            </div>

            <div>

              <span>
                Reservations
              </span>

              <strong>
                {pendingReservations.length}
              </strong>

            </div>

          </div>

          {/* ACTIVE LOANS */}

          <div className="stat-card">

            <div className="stat-icon green">
              <Clock size={21} />
            </div>

            <div>

              <span>
                Active Loans
              </span>

              <strong>
                {activeBorrowings.length}
              </strong>

            </div>

          </div>

        </div>

        {/* =========================
            BORROWED BOOKS
        ========================= */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <h2>
                My Borrowed Books
              </h2>

              <p>
                Books currently borrowed
                from the library.
              </p>

            </div>

          </div>

          {activeBorrowings.length ===
          0 ? (

            <div className="dashboard-empty">

              <BookOpen size={35} />

              <h3>
                No borrowed books
              </h3>

              <p>
                You currently don't have
                any borrowed books.
              </p>

              <Link to="/">

                Browse Books

                <ArrowRight size={15} />

              </Link>

            </div>

          ) : (

            <div className="borrowed-list">

              {activeBorrowings.map(
                (borrowing) => {

                  const daysRemaining =
                    getDaysRemaining(
                      borrowing.dueDate
                    );

                  const overdue =
                    daysRemaining < 0;

                  return (
                    <div
                      className="borrowed-card"
                      key={borrowing.id}
                    >

                      {/* BOOK ICON */}

                      <div className="borrowed-icon">

                        <BookOpen size={25} />

                      </div>

                      {/* BOOK INFO */}

                      <div className="borrowed-info">

                        <h3>
                          {
                            borrowing
                              .bookCopy
                              .book
                              .title
                          }
                        </h3>

                        <p>
                          by{" "}
                          {
                            borrowing
                              .bookCopy
                              .book
                              .author
                              .name
                          }
                        </p>

                        <span>
                          Accession:{" "}
                          {
                            borrowing
                              .bookCopy
                              .accessionNumber
                          }
                        </span>

                      </div>

                      {/* DUE INFO */}

                      <div
                        className={`due-info ${
                          overdue
                            ? "overdue"
                            : ""
                        }`}
                      >

                        <small>
                          Due Date
                        </small>

                        <strong>
                          {new Date(
                            borrowing.dueDate
                          ).toLocaleDateString()}
                        </strong>

                        <span>

                          {overdue
                            ? "Overdue"
                            : `${daysRemaining} ${
                                daysRemaining ===
                                1
                                  ? "day"
                                  : "days"
                              } remaining`}

                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =========================
            RESERVATIONS
        ========================= */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <h2>
                My Reservations
              </h2>

              <p>
                Books you have reserved.
              </p>

            </div>

          </div>

          {pendingReservations.length ===
          0 ? (

            <div className="dashboard-empty">

              <Bookmark size={35} />

              <h3>
                No active reservations
              </h3>

              <p>
                You don't have any pending
                reservations.
              </p>

            </div>

          ) : (

            <div className="reservation-list">

              {pendingReservations.map(
                (reservation) => (

                  <div
                    className="reservation-card"
                    key={reservation.id}
                  >

                    {/* ICON */}

                    <div className="reservation-icon">

                      <Bookmark size={22} />

                    </div>

                    {/* BOOK INFO */}

                    <div className="reservation-info">

                      <h3>
                        {reservation.book.title}
                      </h3>

                      <p>
                        by{" "}
                        {
                          reservation
                            .book
                            .author
                            .name
                        }
                      </p>

                      <span>
                        Reserved on{" "}
                        {new Date(
                          reservation.reservedAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                    {/* ACTIONS */}

                    <div className="reservation-actions">

                      <span className="reservation-status">
                        {reservation.status}
                      </span>

                      <button
                        type="button"
                        className="cancel-reservation-button"
                        disabled={
                          cancelingId ===
                          reservation.id
                        }
                        onClick={() =>
                          handleCancelReservation(
                            reservation.id
                          )
                        }
                      >

                        <XCircle size={15} />

                        {cancelingId ===
                        reservation.id
                          ? "Canceling..."
                          : "Cancel"}

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">
        © 2026 Library OPAC. All rights reserved.
      </footer>

    </div>
  );
}