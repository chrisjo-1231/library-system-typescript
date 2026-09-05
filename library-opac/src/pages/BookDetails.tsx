import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  MapPin,
  Library,
  Calendar,
  User,
  Tag,
  Hash,
  Building2,
  BookMarked,
  Clock,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getBook,
  type Book,
} from "../services/bookApi";

import api from "../services/api";

const API_URL = "http://localhost:5000";

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [book, setBook] =
    useState<Book | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reserving, setReserving] =
    useState(false);

  const [reservationMessage, setReservationMessage] =
    useState("");

  const [borrowing, setBorrowing] =
    useState(false);

  const [borrowMessage, setBorrowMessage] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  useEffect(() => {
    const loadBook = async () => {
      try {
        if (!id) {
          setError("Book ID is missing");
          return;
        }

        const data = await getBook(
          Number(id)
        );

        setBook(data);
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load book details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  /* =========================
     RESERVE BOOK
  ========================= */

  const handleReserve = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!book) {
      return;
    }

    try {
      setReserving(true);

      setReservationMessage("");
      setBorrowMessage("");
      setError("");

      await api.post(
        "/reservations",
        {
          bookId: book.id,
        }
      );

      setReservationMessage(
        "Book reserved successfully!"
      );
    } catch (error: any) {
      console.error(
        "Reservation error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to reserve book."
      );
    } finally {
      setReserving(false);
    }
  };

  /* =========================
     BORROW BOOK
  ========================= */

  const handleBorrow = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!book) {
      return;
    }

    if (!dueDate) {
      setError(
        "Please select a due date."
      );

      return;
    }

    const availableCopy =
      book.copies.find(
        (copy) =>
          copy.status === "AVAILABLE"
      );

    if (!availableCopy) {
      setError(
        "No available copy found."
      );

      return;
    }

    try {
      setBorrowing(true);

      setBorrowMessage("");
      setReservationMessage("");
      setError("");

      await api.post(
        "/borrowings",
        {
          bookCopyId:
            availableCopy.id,

          dueDate: dueDate,
        }
      );

      setBorrowMessage(
        "Book borrowed successfully!"
      );

      const updatedBook =
        await getBook(book.id);

      setBook(updatedBook);

      setDueDate("");
    } catch (error: any) {
      console.error(
        "Borrowing error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to borrow book."
      );
    } finally {
      setBorrowing(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="loading">
        <BookOpen size={24} />

        <span
          style={{
            marginLeft: "10px",
          }}
        >
          Loading book details...
        </span>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error && !book) {
    return (
      <div className="loading">
        {error}
      </div>
    );
  }

  if (!book) {
    return (
      <div className="loading">
        Book not found.
      </div>
    );
  }

  /* =========================
     AVAILABLE COPIES
  ========================= */

  const availableCopies =
    book.copies.filter(
      (copy) =>
        copy.status === "AVAILABLE"
    );

  const isAvailable =
    availableCopies.length > 0;

  const availableCopy =
    availableCopies[0];

  /*
   * Uploaded cover image
   * is stored as:
   *
   * /uploads/books/filename.jpg
   *
   * so we prepend the backend URL.
   */
  const coverUrl = book.coverImage
    ? `${API_URL}${book.coverImage}`
    : null;

  return (
    <>
      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">
        <div className="navbar-inner">
          <Link
            to="/"
            className="logo"
          >
            <div className="logo-icon">
              <BookOpen size={22} />
            </div>

            Library OPAC
          </Link>

          <div className="nav-links">
            <Link to="/">
              Browse Books
            </Link>

            <Link to="/">
              Library Catalog
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="details-page">
        {/* BACK */}

        <Link
          to="/"
          className="back-link"
        >
          <ArrowLeft size={17} />

          Back to Books
        </Link>

        <div className="details-card">
          <div className="details-layout">
            {/* =========================
                COVER
            ========================= */}

            <div className="details-cover">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={`Cover of ${book.title}`}
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="details-cover-placeholder">
                  <BookOpen size={70} />

                  <span>
                    Library Book
                  </span>
                </div>
              )}
            </div>

            {/* =========================
                BOOK INFORMATION
            ========================= */}

            <div>
              <div className="details-category">
                {book.category.name}
              </div>

              <h1 className="details-title">
                {book.title}
              </h1>

              <p className="details-author">
                <User
                  size={16}
                  style={{
                    verticalAlign:
                      "middle",
                    marginRight: "6px",
                  }}
                />

                by {book.author.name}
              </p>

              {/* =========================
                  AVAILABILITY
              ========================= */}

              <div
                className={`availability ${
                  isAvailable
                    ? "available"
                    : "unavailable"
                }`}
                style={{
                  marginBottom: "15px",
                  fontSize: "14px",
                }}
              >
                <CheckCircle size={18} />

                {isAvailable
                  ? `${availableCopies.length} ${
                      availableCopies.length ===
                      1
                        ? "copy"
                        : "copies"
                    } available`
                  : "Currently unavailable"}
              </div>

              {/* =========================
                  BORROW SECTION
              ========================= */}

              {isAvailable && (
                <div className="borrow-section">
                  <div className="borrow-header">
                    <Clock size={18} />

                    <strong>
                      Borrow this book
                    </strong>
                  </div>

                  <p className="borrow-description">
                    Select your desired due
                    date and borrow an
                    available copy.
                  </p>

                  <div className="borrow-form">
                    <div className="due-date-field">
                      <label htmlFor="dueDate">
                        Due Date
                      </label>

                      <div className="due-date-input">
                        <Calendar size={17} />

                        <input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          min={
                            new Date()
                              .toISOString()
                              .split("T")[0]
                          }
                          onChange={(e) =>
                            setDueDate(
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="borrow-button"
                      onClick={
                        handleBorrow
                      }
                      disabled={
                        borrowing ||
                        !dueDate
                      }
                    >
                      <BookOpen size={18} />

                      {borrowing
                        ? "Borrowing..."
                        : "Borrow This Book"}
                    </button>
                  </div>

                  {availableCopy && (
                    <div className="selected-copy">
                      <MapPin size={14} />

                      Copy:{" "}
                      <strong>
                        {
                          availableCopy.accessionNumber
                        }
                      </strong>

                      {availableCopy.shelfLocation && (
                        <>
                          {" "}
                          • Shelf:{" "}
                          {
                            availableCopy.shelfLocation
                          }
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =========================
                  RESERVE SECTION
              ========================= */}

              {!isAvailable && (
                <button
                  type="button"
                  className="reserve-button"
                  onClick={
                    handleReserve
                  }
                  disabled={reserving}
                >
                  <BookMarked size={18} />

                  {reserving
                    ? "Reserving..."
                    : "Reserve This Book"}
                </button>
              )}

              {/* =========================
                  SUCCESS MESSAGES
              ========================= */}

              {borrowMessage && (
                <div className="reservation-success">
                  <CheckCircle size={17} />

                  {borrowMessage}
                </div>
              )}

              {reservationMessage && (
                <div className="reservation-success">
                  <CheckCircle size={17} />

                  {reservationMessage}
                </div>
              )}

              {/* =========================
                  ERROR MESSAGE
              ========================= */}

              {error && (
                <div className="reservation-error">
                  {error}
                </div>
              )}

              {/* =========================
                  DESCRIPTION
              ========================= */}

              <p className="details-description">
                {book.description ||
                  "No description is available for this book."}
              </p>

              {/* =========================
                  BOOK INFO
              ========================= */}

              <div className="info-list">
                {/* ISBN */}

                <div className="info-item">
                  <span className="info-label">
                    ISBN
                  </span>

                  <span className="info-value">
                    <Hash
                      size={14}
                      style={{
                        verticalAlign:
                          "middle",
                        marginRight: "5px",
                      }}
                    />

                    {book.isbn || "N/A"}
                  </span>
                </div>

                {/* PUBLICATION YEAR */}

                <div className="info-item">
                  <span className="info-label">
                    Publication Year
                  </span>

                  <span className="info-value">
                    <Calendar
                      size={14}
                      style={{
                        verticalAlign:
                          "middle",
                        marginRight: "5px",
                      }}
                    />

                    {book.publicationYear ||
                      "N/A"}
                  </span>
                </div>

                {/* PUBLISHER */}

                <div className="info-item">
                  <span className="info-label">
                    Publisher
                  </span>

                  <span className="info-value">
                    <Building2
                      size={14}
                      style={{
                        verticalAlign:
                          "middle",
                        marginRight: "5px",
                      }}
                    />

                    {book.publisher ||
                      "N/A"}
                  </span>
                </div>

                {/* CATEGORY */}

                <div className="info-item">
                  <span className="info-label">
                    Category
                  </span>

                  <span className="info-value">
                    <Tag
                      size={14}
                      style={{
                        verticalAlign:
                          "middle",
                        marginRight: "5px",
                      }}
                    />

                    {book.category.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              LIBRARY COPIES
          ========================= */}

          <section className="copies-section">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "5px",
              }}
            >
              <Library size={22} />

              <h2
                style={{
                  margin: 0,
                }}
              >
                Library Copies
              </h2>
            </div>

            <p
              style={{
                color: "#667085",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {availableCopies.length} of{" "}
              {book.copies.length} copies
              currently available.
            </p>

            {book.copies.length === 0 ? (
              <div className="empty-state">
                <BookMarked size={35} />

                <h3>
                  No copies registered
                </h3>

                <p>
                  There are currently no
                  physical copies registered
                  for this book.
                </p>
              </div>
            ) : (
              <div className="copy-list">
                {book.copies.map(
                  (copy) => {
                    const statusClass =
                      copy.status ===
                      "AVAILABLE"
                        ? "copy-available"
                        : copy.status ===
                          "BORROWED"
                        ? "copy-borrowed"
                        : "copy-other";

                    return (
                      <div
                        key={copy.id}
                        className="copy-item"
                      >
                        <div>
                          <div className="copy-accession">
                            {
                              copy.accessionNumber
                            }
                          </div>

                          <div
                            className="copy-location"
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "5px",
                              marginTop:
                                "4px",
                            }}
                          >
                            <MapPin size={13} />

                            {copy.shelfLocation ||
                              "Shelf location not assigned"}
                          </div>
                        </div>

                        <span
                          className={`copy-status ${statusClass}`}
                        >
                          {copy.status}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">
        © 2026 Library OPAC. All rights reserved.
      </footer>
    </>
  );
}