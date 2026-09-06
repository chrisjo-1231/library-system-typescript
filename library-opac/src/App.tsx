import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import {
  BookOpen,
  Search,
  LayoutDashboard,
} from "lucide-react";

import {
  getBooks,
  type Book,
} from "./services/bookApi";

import BookCard from "./components/BookCard";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import ManageBooks from "./pages/ManageBooks";
import ManageBookCopies from "./pages/ManageBookCopies";
import ManageBorrowings from "./pages/ManageBorrowings";
import ManageReservations from "./pages/ManageReservations";
import BorrowingReports from "./pages/BorrowingReports";
import Profile from "./pages/Profile";
import "./App.css";

/* =========================================================
   HOME
========================================================= */

function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBooks();

        setBooks(data);
      } catch (error) {
        console.error(
          "LOAD BOOKS ERROR:",
          error
        );

        setError(
          "Failed to load books."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = [
    "ALL",
    ...Array.from(
      new Set(
        books.map(
          (book) => book.category.name
        )
      )
    ),
  ];

  /* =======================================================
     FILTER BOOKS
  ======================================================= */

  const filteredBooks = books.filter(
    (book) => {
      const keyword =
        search.trim().toLowerCase();

      const matchesSearch =
        book.title
          .toLowerCase()
          .includes(keyword) ||
        book.author.name
          .toLowerCase()
          .includes(keyword);

      const matchesCategory =
        category === "ALL" ||
        book.category.name === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="loading">
        <BookOpen size={24} />

        <span
          style={{
            marginLeft: "10px",
          }}
        >
          Loading books...
        </span>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="loading">
        <BookOpen size={24} />

        <span
          style={{
            marginLeft: "10px",
          }}
        >
          {error}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <BookOpen size={15} />
            Library Online Public Access Catalog
          </div>

          <h1>
            Discover Your Next Book
          </h1>

          <p>
            Search our library collection
            and discover books, authors,
            categories, and available
            physical copies.
          </p>

          {/* SEARCH */}

          <div className="search-container">
            <Search
              size={20}
              className="search-icon"
            />

            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main">
        {/* FILTER BAR */}

        <div className="filter-bar">
          <div className="section-header">
            <div>
              <h2>
                Library Collection
              </h2>

              <span className="results-count">
                {filteredBooks.length}{" "}
                {filteredBooks.length === 1
                  ? "book"
                  : "books"}{" "}
                found
              </span>
            </div>
          </div>

          {/* CATEGORY FILTER */}

          <select
            className="category-select"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >
            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "ALL"
                    ? "All Categories"
                    : item}
                </option>
              )
            )}
          </select>
        </div>

        {/* BOOKS */}

        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={40} />

            <h3>
              No books found
            </h3>

            <p>
              Try another title,
              author, or category.
            </p>

            {(search ||
              category !== "ALL") && (
              <button
                type="button"
                className="clear-filter-button"
                onClick={() => {
                  setSearch("");
                  setCategory("ALL");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="book-grid">
            {filteredBooks.map(
              (book) => (
                <BookCard
                  key={book.id}
                  book={book}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <BookOpen size={19} />

            <span>
              Library OPAC
            </span>
          </div>

          <span>
            © 2026 Library OPAC.
            All rights reserved.
          </span>
        </div>
      </footer>
    </>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar() {
  const location = useLocation();

  const [role, setRole] =
    useState<string | null>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      setRole(null);
      return;
    }

    try {
      const user =
        JSON.parse(storedUser);

      setRole(user.role || null);
    } catch (error) {
      console.error(
        "USER PARSE ERROR:",
        error
      );

      setRole(null);
    }
  }, [location.pathname]);

  const dashboardPath =
    role === "LIBRARIAN"
      ? "/librarian"
      : role === "ADMIN"
      ? "/admin"
      : role === "STUDENT"
      ? "/student"
      : "/login";

  const isDashboard =
    location.pathname ===
      "/student" ||
    location.pathname.startsWith(
      "/librarian"
    );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* LOGO */}

        <Link
          to="/"
          className="logo"
        >
          <div className="logo-icon">
            <BookOpen size={22} />
          </div>

          <span>
            Library OPAC
          </span>
        </Link>

        {/* NAVIGATION */}

        <div className="nav-links">
          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "active"
                : ""
            }
          >
            Browse Books
          </Link>

          <Link
            to="/"
            className={
              location.pathname === "/"
                ? ""
                : ""
            }
          >
            Library Catalog
          </Link>

          {role ? (
            <Link
              to={dashboardPath}
              className={`dashboard-nav-link ${
                isDashboard
                  ? "active"
                  : ""
              }`}
            >
              <LayoutDashboard
                size={16}
              />

              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="login-nav-link"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />
        <Route path="/student/profile" element={<Profile />} />

        {/* BOOK DETAILS */}

        <Route
          path="/books/:id"
          element={<BookDetails />}
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />
        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />
        {/* STUDENT */}

        <Route
          path="/student"
          element={
            <StudentDashboard />
          }
        />

        {/* LIBRARIAN */}

        <Route
          path="/librarian"
          element={
            <LibrarianDashboard />
          }
        />

        <Route
          path="/librarian/books"
          element={
            <ManageBooks />
          }
        />

        <Route
          path="/librarian/copies"
          element={
            <ManageBookCopies />
          }
        />

        <Route
          path="/librarian/borrowings"
          element={
            <ManageBorrowings />
          }
        />

        <Route
          path="/librarian/reservations"
          element={
            <ManageReservations />
          }
        />
        <Route
  path="/librarian/reports/borrowings"
  element={<BorrowingReports />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;