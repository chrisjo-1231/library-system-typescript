import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  Search,
  User,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getReservations,
  fulfillReservation,
  type Reservation,
} from "../services/reservationApi";

export default function ManageReservations() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [fulfillingId, setFulfillingId] =
    useState<number | null>(null);

  /* =========================
     LOAD RESERVATIONS
  ========================= */

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getReservations();

      setReservations(data || []);
    } catch (error: any) {
      console.error(
        "LOAD RESERVATIONS ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load reservations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  /* =========================
     FILTER
  ========================= */

  const filteredReservations =
    reservations.filter(
      (reservation) => {
        const keyword =
          search
            .toLowerCase()
            .trim();

        return (
          reservation.user.name
            .toLowerCase()
            .includes(keyword) ||

          reservation.user.email
            .toLowerCase()
            .includes(keyword) ||

          reservation.book.title
            .toLowerCase()
            .includes(keyword) ||

          reservation.book.author.name
            .toLowerCase()
            .includes(keyword) ||

          reservation.status
            .toLowerCase()
            .includes(keyword)
        );
      }
    );

  /* =========================
     STATISTICS
  ========================= */

  const pending =
    reservations.filter(
      (reservation) =>
        reservation.status === "PENDING"
    ).length;

  const fulfilled =
    reservations.filter(
      (reservation) =>
        reservation.status === "FULFILLED"
    ).length;

  const cancelled =
    reservations.filter(
      (reservation) =>
        reservation.status === "CANCELLED"
    ).length;

  /* =========================
     DATE
  ========================= */

  const formatDate = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /* =========================
     FULFILL
  ========================= */

  const handleFulfill = async (
    reservation: Reservation
  ) => {
    const confirmed =
      window.confirm(
        `Fulfill reservation for "${reservation.user.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setFulfillingId(
        reservation.id
      );

      setError("");

      await fulfillReservation(
        reservation.id
      );

      await loadReservations();
    } catch (error: any) {
      console.error(
        "FULFILL RESERVATION ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to fulfill reservation."
      );
    } finally {
      setFulfillingId(null);
    }
  };

  return (
    <div className="manage-books-page">

      {/* =========================
          NAVBAR
      ========================== */}

      <nav className="librarian-navbar">

        <div className="librarian-navbar-inner">

          <Link
            to="/librarian"
            className="librarian-logo"
          >
            <div className="librarian-logo-icon">
              <BookOpen size={21} />
            </div>

            Library OPAC
          </Link>

          <Link
            to="/librarian"
            className="back-dashboard-link"
          >
            <ArrowLeft size={16} />

            Dashboard
          </Link>

        </div>

      </nav>

      {/* =========================
          MAIN
      ========================== */}

      <main className="manage-books-main">

        {/* HEADER */}

        <div className="manage-books-header">

          <div>

            <span className="librarian-eyebrow">
              LIBRARY CIRCULATION
            </span>

            <h1>
              Manage Reservations
            </h1>

            <p>
              Review student reservations
              and fulfill requests.
            </p>

          </div>

        </div>

        {/* =========================
            STATS
        ========================= */}

        <div className="copy-stats">

          {/* TOTAL */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <ClipboardList size={20} />
            </div>

            <div>

              <span>
                Total Reservations
              </span>

              <strong>
                {reservations.length}
              </strong>

            </div>

          </div>

          {/* PENDING */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <Clock size={20} />
            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {pending}
              </strong>

            </div>

          </div>

          {/* FULFILLED */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <CheckCircle size={20} />
            </div>

            <div>

              <span>
                Fulfilled
              </span>

              <strong>
                {fulfilled}
              </strong>

            </div>

          </div>

          {/* CANCELLED */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <XCircle size={20} />
            </div>

            <div>

              <span>
                Cancelled
              </span>

              <strong>
                {cancelled}
              </strong>

            </div>

          </div>

        </div>

        {/* =========================
            SEARCH
        ========================== */}

        <div className="books-toolbar">

          <div className="books-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search student, book, author, or status..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="books-count">

            {filteredReservations.length}{" "}

            {filteredReservations.length ===
            1
              ? "reservation"
              : "reservations"}

          </div>

        </div>

        {/* =========================
            ERROR
        ========================== */}

        {error && (
          <div className="manage-books-error">
            {error}
          </div>
        )}

        {/* =========================
            LOADING
        ========================== */}

        {loading ? (

          <div className="manage-books-loading">

            <Loader2
              size={22}
              className="spin"
            />

            Loading reservations...

          </div>

        ) : filteredReservations.length ===
          0 ? (

          <div className="manage-books-empty">

            <ClipboardList
              size={42}
            />

            <h3>
              No reservations found
            </h3>

            <p>
              There are no matching
              reservation records.
            </p>

          </div>

        ) : (

          /* =========================
             TABLE
          ========================== */

          <div className="books-table-card">

            <div className="books-table-wrapper">

              <table className="books-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Book
                    </th>

                    <th>
                      Reserved
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredReservations.map(
                    (reservation) => {

                      const isPending =
                        reservation.status ===
                        "PENDING";

                      return (
                        <tr
                          key={
                            reservation.id
                          }
                        >

                          {/* STUDENT */}

                          <td>

                            <div className="borrower-info">

                              <div className="borrower-name">

                                <User
                                  size={15}
                                />

                                <strong>
                                  {
                                    reservation
                                      .user
                                      .name
                                  }
                                </strong>

                              </div>

                              <span>
                                {
                                  reservation
                                    .user
                                    .email
                                }
                              </span>

                            </div>

                          </td>

                          {/* BOOK */}

                          <td>

                            <div className="book-table-title">

                              <div className="book-table-icon">
                                <BookOpen
                                  size={19}
                                />
                              </div>

                              <div>

                                <strong>
                                  {
                                    reservation
                                      .book
                                      .title
                                  }
                                </strong>

                                <span>
                                  by{" "}
                                  {
                                    reservation
                                      .book
                                      .author
                                      .name
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* RESERVED */}

                          <td>

                            <div className="date-info">

                              <CalendarDays
                                size={15}
                              />

                              {formatDate(
                                reservation.reservedAt
                              )}

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            {reservation.status ===
                            "PENDING" ? (

                              <span className="copy-status copy-borrowed">
                                PENDING
                              </span>

                            ) : reservation.status ===
                              "FULFILLED" ? (

                              <span className="copy-status borrowing-returned">
                                FULFILLED
                              </span>

                            ) : (

                              <span className="copy-status copy-lost">
                                CANCELLED
                              </span>

                            )}

                          </td>

                          {/* ACTION */}

                          <td>

                            {isPending ? (

                              <button
                                type="button"
                                className="return-book-button"
                                disabled={
                                  fulfillingId ===
                                  reservation.id
                                }
                                onClick={() =>
                                  handleFulfill(
                                    reservation
                                  )
                                }
                              >

                                {fulfillingId ===
                                reservation.id ? (
                                  <>
                                    <Loader2
                                      size={15}
                                      className="spin"
                                    />

                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle
                                      size={15}
                                    />

                                    Fulfill
                                  </>
                                )}

                              </button>

                            ) : (

                              <span className="returned-label">
                                Completed
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </main>

      {/* FOOTER */}

      <footer className="footer">
        © 2026 Library OPAC.
        All rights reserved.
      </footer>

    </div>
  );
}