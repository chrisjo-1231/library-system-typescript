import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Hash,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  X,
  Save,
  Loader2,
  User,
  CalendarDays,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getAllBookCopies,
  createBookCopies,
  updateBookCopy,
  deleteBookCopy,
  type BookCopy,
} from "../services/bookCopyApi";

import api from "../services/api";

/* ================================================= */
/* TYPES */
/* ================================================= */

interface Book {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
}

interface BorrowingUser {
  id: number;
  name: string;
  email: string;
}

interface CurrentBorrowing {
  id: number;
  borrowedAt: string;
  dueDate: string;
  user: BorrowingUser;
}

interface FullBookCopy extends BookCopy {
  book: Book;

  borrowings?: CurrentBorrowing[];
}

/* ================================================= */
/* COMPONENT */
/* ================================================= */

export default function ManageBookCopies() {
  const [copies, setCopies] =
    useState<FullBookCopy[]>([]);

  const [books, setBooks] =
    useState<Book[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCopy, setEditingCopy] =
    useState<FullBookCopy | null>(null);

  /* ================================================= */
  /* LOAD COPIES */
  /* ================================================= */

  const loadCopies = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAllBookCopies();

      setCopies(
        (data || []) as FullBookCopy[]
      );
    } catch (error: any) {
      console.error(
        "LOAD COPIES ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load book copies."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================================= */
  /* LOAD BOOKS */
  /* ================================================= */

  const loadBooks = async () => {
    try {
      const response =
        await api.get("/books");

      setBooks(
        response.data || []
      );
    } catch (error) {
      console.error(
        "LOAD BOOKS ERROR:",
        error
      );
    }
  };

  /* ================================================= */
  /* INITIAL LOAD */
  /* ================================================= */

  useEffect(() => {
    loadCopies();
    loadBooks();
  }, []);

  /* ================================================= */
  /* SEARCH */
  /* ================================================= */

  const filteredCopies =
    copies.filter((copy) => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      const borrower =
        copy.borrowings?.[0]?.user;

      return (
        copy.accessionNumber
          ?.toLowerCase()
          .includes(keyword) ||

        copy.book?.title
          ?.toLowerCase()
          .includes(keyword) ||

        copy.book?.author?.name
          ?.toLowerCase()
          .includes(keyword) ||

        copy.shelfLocation
          ?.toLowerCase()
          .includes(keyword) ||

        copy.status
          ?.toLowerCase()
          .includes(keyword) ||

        borrower?.name
          ?.toLowerCase()
          .includes(keyword) ||

        borrower?.email
          ?.toLowerCase()
          .includes(keyword)
      );
    });

  /* ================================================= */
  /* STATISTICS */
  /* ================================================= */

  const available =
    copies.filter(
      (copy) =>
        copy.status ===
        "AVAILABLE"
    ).length;

  const borrowed =
    copies.filter(
      (copy) =>
        copy.status ===
        "BORROWED"
    ).length;

  const damaged =
    copies.filter(
      (copy) =>
        copy.status ===
        "DAMAGED"
    ).length;

  const lost =
    copies.filter(
      (copy) =>
        copy.status ===
        "LOST"
    ).length;

  /* ================================================= */
  /* DELETE */
  /* ================================================= */

  const handleDelete = async (
    copy: FullBookCopy
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${copy.accessionNumber}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteBookCopy(
        copy.id
      );

      await loadCopies();
    } catch (error: any) {
      console.error(
        "DELETE COPY ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to delete book copy."
      );
    }
  };

  /* ================================================= */
  /* RENDER */
  /* ================================================= */

  return (
    <div className="manage-books-page">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="manage-books-main">

        {/* HEADER */}

        <div className="manage-books-header">

          <div>

            <span className="librarian-eyebrow">
              LIBRARY MANAGEMENT
            </span>

            <h1>
              Manage Book Copies
            </h1>

            <p>
              Manage physical copies,
              accession numbers, shelves,
              borrowers, and copy status.
            </p>

          </div>

          <button
            type="button"
            className="add-book-button"
            onClick={() => {
              setEditingCopy(null);
              setShowModal(true);
            }}
          >
            <Plus size={18} />

            Add Copies
          </button>

        </div>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="copy-stats">

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <span>
                Total Copies
              </span>

              <strong>
                {copies.length}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <CheckCircle size={20} />
            </div>

            <div>
              <span>
                Available
              </span>

              <strong>
                {available}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <Clock size={20} />
            </div>

            <div>
              <span>
                Borrowed
              </span>

              <strong>
                {borrowed}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>
                Damaged
              </span>

              <strong>
                {damaged}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <XCircle size={20} />
            </div>

            <div>
              <span>
                Lost
              </span>

              <strong>
                {lost}
              </strong>
            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <div className="books-toolbar">

          <div className="books-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search book, author, accession, shelf, status, or student..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="books-count">

            {filteredCopies.length}{" "}

            {filteredCopies.length === 1
              ? "copy"
              : "copies"}

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="manage-books-error">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        {loading ? (

          <div className="manage-books-loading">

            <Loader2
              size={22}
              className="spin"
            />

            Loading book copies...

          </div>

        ) : filteredCopies.length === 0 ? (

          <div className="manage-books-empty">

            <BookOpen size={42} />

            <h3>
              No book copies found
            </h3>

            <p>
              Add a physical copy to
              your library.
            </p>

          </div>

        ) : (

          <div className="books-table-card">

            <div className="books-table-wrapper">

              <table className="books-table">

                <thead>

                  <tr>

                    <th>
                      Book
                    </th>

                    <th>
                      Accession
                    </th>

                    <th>
                      Shelf
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Borrowed By
                    </th>

                    <th>
                      Due Date
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCopies.map(
                    (copy) => {

                      const borrower =
                        copy.borrowings?.[0];

                      const statusClass =
                        copy.status ===
                        "AVAILABLE"
                          ? "copy-available"
                          : copy.status ===
                            "BORROWED"
                          ? "copy-borrowed"
                          : copy.status ===
                            "LOST"
                          ? "copy-lost"
                          : "copy-damaged";

                      return (

                        <tr
                          key={copy.id}
                        >

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
                                  {copy.book?.title ||
                                    "Unknown Book"}
                                </strong>

                                <span>
                                  by{" "}
                                  {copy.book?.author
                                    ?.name ||
                                    "Unknown Author"}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* ACCESSION */}

                          <td>

                            <div className="table-info">

                              <Hash
                                size={16}
                              />

                              <strong>
                                {
                                  copy.accessionNumber
                                }
                              </strong>

                            </div>

                          </td>

                          {/* SHELF */}

                          <td>

                            <div className="table-info">

                              <MapPin
                                size={16}
                              />

                              {copy.shelfLocation ||
                                "Not assigned"}

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`copy-status ${statusClass}`}
                            >
                              {copy.status}
                            </span>

                          </td>

                          {/* BORROWED BY */}

                          <td>

                            {borrower?.user ? (

                              <div className="borrower-info">

                                <div className="borrower-name">

                                  <User
                                    size={15}
                                  />

                                  <strong>
                                    {
                                      borrower.user.name
                                    }
                                  </strong>

                                </div>

                                <span>
                                  {
                                    borrower.user.email
                                  }
                                </span>

                              </div>

                            ) : (

                              <span className="no-borrower">
                                —
                              </span>

                            )}

                          </td>

                          {/* DUE DATE */}

                          <td>

                            {borrower?.dueDate ? (

                              <div className="due-date-info">

                                <CalendarDays
                                  size={15}
                                />

                                <span>
                                  {new Date(
                                    borrower.dueDate
                                  ).toLocaleDateString(
                                    "en-US",
                                    {
                                      month:
                                        "short",
                                      day:
                                        "numeric",
                                      year:
                                        "numeric",
                                    }
                                  )}
                                </span>

                              </div>

                            ) : (

                              <span className="no-borrower">
                                —
                              </span>

                            )}

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="book-actions">

                              <button
                                type="button"
                                className="edit-book-button"
                                title="Edit copy"
                                onClick={() => {
                                  setEditingCopy(
                                    copy
                                  );

                                  setShowModal(
                                    true
                                  );
                                }}
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              <button
                                type="button"
                                className="delete-book-button"
                                title="Delete copy"
                                onClick={() =>
                                  handleDelete(
                                    copy
                                  )
                                }
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>

                            </div>

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

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="footer">
        © 2026 Library OPAC.
        All rights reserved.
      </footer>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {showModal && (

        <BookCopyModal
          books={books}
          copy={editingCopy}
          onClose={() =>
            setShowModal(false)
          }
          onSuccess={() => {
            setShowModal(false);
            loadCopies();
          }}
        />

      )}

    </div>
  );
}

/* ================================================= */
/* BOOK COPY MODAL */
/* ================================================= */

interface BookCopyModalProps {
  books: Book[];
  copy: FullBookCopy | null;
  onClose: () => void;
  onSuccess: () => void;
}

function BookCopyModal({
  books,
  copy,
  onClose,
  onSuccess,
}: BookCopyModalProps) {

  const [bookId, setBookId] =
    useState(
      copy
        ? String(copy.bookId)
        : ""
    );

  const [quantity, setQuantity] =
    useState("1");

  const [
    startingAccessionNumber,
    setStartingAccessionNumber,
  ] = useState(
    copy?.accessionNumber || ""
  );

  const [shelfLocation, setShelfLocation] =
    useState(
      copy?.shelfLocation || ""
    );

  const [status, setStatus] =
    useState<BookCopy["status"]>(
      copy?.status ||
        "AVAILABLE"
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ================================================= */
  /* SUBMIT */
  /* ================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    /* ========================= */
    /* VALIDATION */
    /* ========================= */

    if (!bookId) {

      setError(
        "Please select a book."
      );

      return;
    }

    if (copy) {

      if (
        !startingAccessionNumber.trim()
      ) {

        setError(
          "Accession number is required."
        );

        return;
      }

    } else {

      if (
        !quantity ||
        Number(quantity) < 1
      ) {

        setError(
          "Number of copies must be at least 1."
        );

        return;
      }

      if (
        Number(quantity) > 1000
      ) {

        setError(
          "Maximum of 1000 copies per batch."
        );

        return;
      }

      if (
        !startingAccessionNumber.trim()
      ) {

        setError(
          "Starting accession number is required."
        );

        return;
      }

    }

    try {

      setLoading(true);

      /* ========================= */
      /* EDIT */
      /* ========================= */

      if (copy) {

        await updateBookCopy(
          copy.id,
          {
            accessionNumber:
              startingAccessionNumber.trim(),

            shelfLocation:
              shelfLocation.trim(),

            status,
          }
        );

      }

      /* ========================= */
      /* CREATE MULTIPLE */
      /* ========================= */

      else {

        await createBookCopies({
          bookId:
            Number(bookId),

          quantity:
            Number(quantity),

          startingAccessionNumber:
            startingAccessionNumber.trim(),

          shelfLocation:
            shelfLocation.trim(),
        });

      }

      onSuccess();

    } catch (error: any) {

      console.error(
        "SAVE COPY ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save book copy."
      );

    } finally {

      setLoading(false);

    }
  };

  /* ================================================= */
  /* MODAL */
  /* ================================================= */

  return (

    <div
      className="add-book-modal-overlay"
      onMouseDown={(e) => {

        if (
          e.target ===
            e.currentTarget &&
          !loading
        ) {
          onClose();
        }

      }}
    >

      <div
        className="add-book-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="add-book-modal-header">

          <div className="add-book-modal-title-wrapper">

            <div className="add-book-modal-icon">
              <BookOpen size={22} />
            </div>

            <div>

              <h2>

                {copy
                  ? "Edit Book Copy"
                  : "Add Book Copies"}

              </h2>

              <p>

                {copy
                  ? "Update this physical copy."
                  : "Add multiple physical copies at once."}

              </p>

            </div>

          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>

        </div>

        {/* FORM */}

        <form
          className="add-book-form"
          onSubmit={handleSubmit}
        >

          {/* ERROR */}

          {error && (

            <div className="add-book-error">
              {error}
            </div>

          )}

          {/* BOOK */}

          <div className="form-group">

            <label>

              Book{" "}
              <span>*</span>

            </label>

            <select
              value={bookId}
              onChange={(e) =>
                setBookId(
                  e.target.value
                )
              }
              disabled={
                loading ||
                !!copy
              }
            >

              <option value="">
                Select book
              </option>

              {books.map(
                (book) => (

                  <option
                    key={book.id}
                    value={book.id}
                  >
                    {book.title}
                  </option>

                )
              )}

            </select>

          </div>

          {/* QUANTITY */}

          {!copy && (

            <div className="form-group">

              <label>

                Number of Copies{" "}
                <span>*</span>

              </label>

              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                disabled={loading}
                placeholder="e.g. 5"
              />

            </div>

          )}

          {/* ACCESSION */}

          <div className="form-group">

            <label>

              {copy
                ? "Accession Number"
                : "Starting Accession Number"}

              {" "}

              <span>*</span>

            </label>

            <input
              type="text"
              placeholder="e.g. LIB-0001"
              value={
                startingAccessionNumber
              }
              onChange={(e) =>
                setStartingAccessionNumber(
                  e.target.value
                )
              }
              disabled={loading}
            />

            {!copy && (

              <small className="form-hint">

                Example: quantity 5 +{" "}
                <strong>
                  LIB-0001
                </strong>{" "}
                creates:

                <br />

                LIB-0001, LIB-0002,
                LIB-0003, LIB-0004,
                LIB-0005

              </small>

            )}

          </div>

          {/* SHELF */}

          <div className="form-group">

            <label>
              Shelf Location
            </label>

            <input
              type="text"
              placeholder="e.g. FIC-A1"
              value={
                shelfLocation
              }
              onChange={(e) =>
                setShelfLocation(
                  e.target.value
                )
              }
              disabled={loading}
            />

          </div>

          {/* STATUS */}

          {copy && (

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target
                      .value as
                      BookCopy["status"]
                  )
                }
                disabled={loading}
              >

                <option value="AVAILABLE">
                  Available
                </option>

                <option value="BORROWED">
                  Borrowed
                </option>

                <option value="DAMAGED">
                  Damaged
                </option>

                <option value="LOST">
                  Lost
                </option>

              </select>

            </div>

          )}

          {/* FOOTER */}

          <div className="add-book-modal-footer">

            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-book-button"
              disabled={loading}
            >

              {loading ? (

                <>
                  <Loader2
                    size={17}
                    className="spin"
                  />

                  Saving...
                </>

              ) : (

                <>
                  <Save size={17} />

                  {copy
                    ? "Save Changes"
                    : "Add Copies"}

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}