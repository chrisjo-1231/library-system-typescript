import { useEffect, useState } from "react";

import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Users,
  Tag,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getBooks,
  type Book,
  deleteBook,
} from "../services/bookApi";

import AddBookModal from "../components/AddBookModal";
import EditBookModal from "../components/EditBookModal";
export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showAddBook, setShowAddBook] =
    useState(false);
    const [editingBook, setEditingBook] =
  useState<Book | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
const [deleting, setDeleting] = useState(false);
  /* ================================
     LOAD BOOKS
  ================================= */

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
        "Failed to load books"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     INITIAL LOAD
  ================================= */

  useEffect(() => {
    loadBooks();
  }, []);

  /* ================================
     SEARCH
  ================================= */

  const filteredBooks =
    books.filter((book) => {
      const keyword =
        search.toLowerCase().trim();

      return (
        book.title
          .toLowerCase()
          .includes(keyword) ||

        book.author.name
          .toLowerCase()
          .includes(keyword) ||

        book.category.name
          .toLowerCase()
          .includes(keyword) ||

        (book.isbn || "")
          .toLowerCase()
          .includes(keyword)
      );
    });

  /* ================================
     RENDER
  ================================= */

  return (
    <div className="manage-books-page">

      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="librarian-navbar">
        <div className="librarian-navbar-inner">

          <Link
            to="/librarian"
            className="librarian-logo"
          >
            <div className="librarian-logo-icon">
              <BookOpen size={21} />
            </div>

            <span>
              Library OPAC
            </span>
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

      {/* =================================
          MAIN
      ================================= */}

      <main className="manage-books-main">

        {/* =================================
            HEADER
        ================================= */}

        <div className="manage-books-header">

          <div>

            <span className="librarian-eyebrow">
              LIBRARY MANAGEMENT
            </span>

            <h1>
              Manage Books
            </h1>

            <p>
              Manage your library collection
              and book records.
            </p>

          </div>

          {/* ADD BOOK */}

          <button
            type="button"
            className="add-book-button"
            onClick={() =>
              setShowAddBook(true)
            }
          >
            <Plus size={18} />

            Add Book
          </button>

        </div>

        {/* =================================
            TOOLBAR
        ================================= */}

        <div className="books-toolbar">

          <div className="books-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search title, author, category, or ISBN..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="books-count">

            {filteredBooks.length}

            {" "}

            {filteredBooks.length === 1
              ? "book"
              : "books"}

          </div>

        </div>

        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="manage-books-error">
            {error}
          </div>
        )}

        {/* =================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="manage-books-loading">

            <BookOpen size={22} />

            Loading books...

          </div>

        ) : filteredBooks.length === 0 ? (

          /* =================================
             EMPTY
          ================================= */

          <div className="manage-books-empty">

            <BookOpen size={42} />

            <h3>
              No books found
            </h3>

            <p>
              Try changing your search
              or add a new book.
            </p>

          </div>

        ) : (

          /* =================================
             TABLE
          ================================= */

          <div className="books-table-card">

            <div className="books-table-wrapper">

              <table className="books-table">

                <thead>

                  <tr>

                    <th>
                      Book
                    </th>

                    <th>
                      Author
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      ISBN
                    </th>

                    <th>
                      Copies
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredBooks.map(
                    (book) => {

                      const available =
                        book.copies.filter(
                          (copy) =>
                            copy.status ===
                            "AVAILABLE"
                        ).length;

                      return (
                        <tr
                          key={book.id}
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
                                  {book.title}
                                </strong>

                                <span>
                                  {book.publisher ||
                                    "No publisher"}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* AUTHOR */}

                          <td>

                            <div className="table-info">

                              <Users
                                size={15}
                              />

                              {book.author.name}

                            </div>

                          </td>

                          {/* CATEGORY */}

                          <td>

                            <span className="category-badge">

                              <Tag
                                size={13}
                              />

                              {book.category.name}

                            </span>

                          </td>

                          {/* ISBN */}

                          <td>

                            <span className="isbn-text">

                              {book.isbn ||
                                "N/A"}

                            </span>

                          </td>

                          {/* COPIES */}

                          <td>

                            <div className="copies-info">

                              <strong>
                                {available}
                              </strong>

                              <span>
                                /
                                {" "}
                                {book.copies.length}
                              </span>

                            </div>

                            <small>
                              available
                            </small>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="book-actions">

                              <button
  className="edit-book-button"
  title="Edit book"
  onClick={() =>
    setEditingBook(book)
  }
>
  <Pencil size={16} />
</button>
<button
  className="delete-book-button"
  title="Delete book"
  onClick={async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteBook(book.id);

      await loadBooks();
    } catch (error: any) {
      console.error("DELETE BOOK ERROR:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to delete book."
      );
    }
  }}
>
  <Trash2 size={16} />
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

      {/* =================================
          FOOTER
      ================================= */}

      <footer className="footer">

        © 2026 Library OPAC.
        All rights reserved.

      </footer>

      {/* =================================
          ADD BOOK MODAL
          IMPORTANT:
          OUTSIDE MAIN/HEADER
      ================================= */}

      {showAddBook && (
        <AddBookModal
          onClose={() =>
            setShowAddBook(false)
          }
          onSuccess={async () => {
            setShowAddBook(false);

            await loadBooks();
          }}
        />
      )}
      {editingBook && (
  <EditBookModal
    book={editingBook}
    onClose={() =>
      setEditingBook(null)
    }
    onSuccess={() => {
      setEditingBook(null);
      loadBooks();
    }}
  />
)}{deleteTarget && (
  <div
    className="delete-modal-overlay"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !deleting) {
        setDeleteTarget(null);
      }
    }}
  >
    <div
      className="delete-modal"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="delete-modal-icon">
        <Trash2 size={24} />
      </div>

      <h2>Delete Book?</h2>

      <p>
        Are you sure you want to delete{" "}
        <strong>{deleteTarget.title}</strong>?
      </p>

      <span className="delete-warning">
        This action cannot be undone.
      </span>

      <div className="delete-modal-actions">
        <button
          type="button"
          className="delete-cancel-button"
          disabled={deleting}
          onClick={() => setDeleteTarget(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="delete-confirm-button"
          disabled={deleting}
          onClick={async () => {
            try {
              setDeleting(true);

              await deleteBook(deleteTarget.id);

              setDeleteTarget(null);

              await loadBooks();
            } catch (error: any) {
              console.error(
                "DELETE BOOK ERROR:",
                error
              );

              setError(
                error?.response?.data?.message ||
                  "Failed to delete book."
              );
            } finally {
              setDeleting(false);
            }
          }}
        >
          {deleting ? "Deleting..." : "Delete Book"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}