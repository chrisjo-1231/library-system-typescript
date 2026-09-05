import { useEffect, useState } from "react";

import {
  BookOpen,
  BookMarked,
  Users,
  ClipboardList,
  LogOut,
  RefreshCw,
  ArrowRight,
  Library,
  BarChart3,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getLibrarianStats,
  type LibrarianStats,
} from "../services/dashboardApi";

export default function LibrarianDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] =
    useState<LibrarianStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // =========================
  // LOAD DASHBOARD STATS
  // =========================

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getLibrarianStats();

      setStats(data);
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      setError(
        "Failed to load dashboard statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="librarian-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="librarian-navbar">
        <div className="librarian-navbar-inner">

          {/* LOGO */}

          <Link
            to="/"
            className="librarian-logo"
          >
            <div className="librarian-logo-icon">
              <BookOpen size={21} />
            </div>

            Library OPAC
          </Link>

          {/* RIGHT SIDE */}

          <div className="librarian-nav-right">

            <span className="librarian-user">
              <Users size={17} />

              {user.name ||
                "Librarian"}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={17} />

              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="librarian-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="librarian-header">

          <div>

            <span className="librarian-eyebrow">
              LIBRARIAN PORTAL
            </span>

            <h1>
              Welcome,{" "}
              {user.name ||
                "Librarian"}!
            </h1>

            <p>
              Here's what's happening
              in your library today.
            </p>

          </div>

          {/* HEADER ACTIONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            {/* REFRESH */}

            <button
              type="button"
              className="browse-button"
              onClick={loadStats}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "spin"
                    : ""
                }
              />

              Refresh
            </button>

            {/* VIEW CATALOG */}

            <Link
              to="/"
              className="browse-button"
            >
              <BookOpen size={17} />

              View Catalog
            </Link>

          </div>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div
            style={{
              background:
                "#fff1f2",
              border:
                "1px solid #fecdd3",
              color:
                "#be123c",
              padding:
                "14px 18px",
              borderRadius:
                "10px",
              marginBottom:
                "25px",
              fontSize:
                "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="librarian-stats">

          {/* TOTAL BOOKS */}

          <div className="librarian-stat-card">

            <div className="librarian-stat-icon blue">
              <BookOpen size={22} />
            </div>

            <div>

              <span>
                Total Books
              </span>

              <strong>
                {loading
                  ? "..."
                  : stats?.totalBooks ??
                    0}
              </strong>

            </div>

          </div>

          {/* ACTIVE BORROWINGS */}

          <div className="librarian-stat-card">

            <div className="librarian-stat-icon orange">
              <BookMarked size={22} />
            </div>

            <div>

              <span>
                Active Borrowings
              </span>

              <strong>
                {loading
                  ? "..."
                  : stats?.activeBorrowings ??
                    0}
              </strong>

            </div>

          </div>

          {/* RESERVATIONS */}

          <div className="librarian-stat-card">

            <div className="librarian-stat-icon green">
              <ClipboardList
                size={22}
              />
            </div>

            <div>

              <span>
                Pending Reservations
              </span>

              <strong>
                {loading
                  ? "..."
                  : stats?.pendingReservations ??
                    0}
              </strong>

            </div>

          </div>

          {/* STUDENTS */}

          <div className="librarian-stat-card">

            <div className="librarian-stat-icon purple">
              <Users size={22} />
            </div>

            <div>

              <span>
                Students
              </span>

              <strong>
                {loading
                  ? "..."
                  : stats?.totalStudents ??
                    0}
              </strong>

            </div>

          </div>

        </div>

        {/* ===================================================
            MANAGEMENT
        =================================================== */}

        <section className="librarian-section">

          <div className="librarian-section-header">

            <h2>
              Library Management
            </h2>

            <p>
              Manage your library
              collection, circulation,
              reservations, and reports.
            </p>

          </div>

          <div className="librarian-management-grid">

            {/* =================================================
                BOOKS
            ================================================= */}

            <div className="management-card">

              <div className="management-icon blue">
                <BookOpen size={23} />
              </div>

              <div className="management-content">

                <h3>
                  Books
                </h3>

                <p>
                  Add, edit, and remove
                  books from the library
                  catalog.
                </p>

                <Link
                  to="/librarian/books"
                  className="management-button"
                >
                  Manage Books

                  <ArrowRight
                    size={15}
                  />
                </Link>

              </div>

            </div>

            {/* =================================================
                BOOK COPIES
            ================================================= */}

            <div className="management-card">

              <div className="management-icon green">
                <Library size={23} />
              </div>

              <div className="management-content">

                <h3>
                  Book Copies
                </h3>

                <p>
                  Manage accession numbers,
                  shelves, and copy status.
                </p>

                <Link
                  to="/librarian/copies"
                  className="management-button"
                >
                  Manage Copies

                  <ArrowRight
                    size={15}
                  />
                </Link>

              </div>

            </div>

            {/* =================================================
                BORROWINGS
            ================================================= */}

            <div className="management-card">

              <div className="management-icon orange">
                <BookMarked
                  size={23}
                />
              </div>

              <div className="management-content">

                <h3>
                  Borrowings
                </h3>

                <p>
                  View borrowed books
                  and process book
                  returns.
                </p>

                <Link
                  to="/librarian/borrowings"
                  className="management-button"
                >
                  Manage Borrowings

                  <ArrowRight
                    size={15}
                  />
                </Link>

              </div>

            </div>

            {/* =================================================
                RESERVATIONS
            ================================================= */}

            <div className="management-card">

              <div className="management-icon purple">
                <ClipboardList
                  size={23}
                />
              </div>

              <div className="management-content">

                <h3>
                  Reservations
                </h3>

                <p>
                  View pending
                  reservations and
                  fulfill requests.
                </p>

                <Link
                  to="/librarian/reservations"
                  className="management-button"
                >
                  Manage Reservations

                  <ArrowRight
                    size={15}
                  />
                </Link>

              </div>

            </div>

            {/* =================================================
                BORROWING REPORTS
            ================================================= */}

            <div className="management-card">

              <div className="management-icon blue">
                <BarChart3 size={23} />
              </div>

              <div className="management-content">

                <h3>
                  Borrowing Reports
                </h3>

                <p>
                  View borrowing
                  statistics, overdue
                  records, and
                  circulation history.
                </p>

                <Link
                  to="/librarian/reports/borrowings"
                  className="management-button"
                >
                  View Reports

                  <ArrowRight
                    size={15}
                  />
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">
        © 2026 Library OPAC.
        All rights reserved.
      </footer>

    </div>
  );
}