import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  Search,
  User,
  CalendarDays,
  RotateCcw,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getBorrowings,
  returnBorrowing,
  type Borrowing,
} from "../services/borrowingApi";

export default function ManageBorrowings() {
  const [borrowings, setBorrowings] = useState<
    Borrowing[]
  >([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [returningId, setReturningId] =
    useState<number | null>(null);

  const loadBorrowings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBorrowings();

      setBorrowings(data || []);
    } catch (error: any) {
      console.error(
        "LOAD BORROWINGS ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load borrowings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowings();
  }, []);

  const activeBorrowings =
    borrowings.filter(
      (borrowing) =>
        !borrowing.returnedAt
    );

  const returnedBorrowings =
    borrowings.filter(
      (borrowing) =>
        !!borrowing.returnedAt
    );

  const overdueBorrowings =
    activeBorrowings.filter(
      (borrowing) =>
        new Date(
          borrowing.dueDate
        ).getTime() <
        new Date().setHours(
          0,
          0,
          0,
          0
        )
    );

  const filteredBorrowings =
    borrowings.filter((borrowing) => {
      const keyword =
        search.toLowerCase().trim();

      return (
        borrowing.user.name
          .toLowerCase()
          .includes(keyword) ||
        borrowing.user.email
          .toLowerCase()
          .includes(keyword) ||
        borrowing.bookCopy.book.title
          .toLowerCase()
          .includes(keyword) ||
        borrowing.bookCopy.book.author.name
          .toLowerCase()
          .includes(keyword) ||
        borrowing.bookCopy.accessionNumber
          .toLowerCase()
          .includes(keyword)
      );
    });

  const handleReturn = async (
    borrowing: Borrowing
  ) => {
    const confirmed =
      window.confirm(
        `Mark "${borrowing.bookCopy.book.title}" (${borrowing.bookCopy.accessionNumber}) as returned?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(
        borrowing.id
      );

      setError("");

      await returnBorrowing(
        borrowing.id
      );

      await loadBorrowings();
    } catch (error: any) {
      console.error(
        "RETURN BOOK ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to return book."
      );
    } finally {
      setReturningId(null);
    }
  };

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

  const isOverdue = (
    borrowing: Borrowing
  ) => {
    return (
      !borrowing.returnedAt &&
      new Date(
        borrowing.dueDate
      ).getTime() <
        new Date().setHours(
          0,
          0,
          0,
          0
        )
    );
  };

  return (
    <div className="manage-books-page">

      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}

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

      {/* ========================= */}
      {/* MAIN */}
      {/* ========================= */}

      <main className="manage-books-main">

        {/* HEADER */}

        <div className="manage-books-header">

          <div>
            <span className="librarian-eyebrow">
              LIBRARY CIRCULATION
            </span>

            <h1>
              Manage Borrowings
            </h1>

            <p>
              Monitor borrowed books and
              process returns.
            </p>
          </div>

        </div>

        {/* ========================= */}
        {/* STATS */}
        {/* ========================= */}

        <div className="copy-stats">

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <span>
                Total Records
              </span>

              <strong>
                {borrowings.length}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <Clock size={20} />
            </div>

            <div>
              <span>
                Active
              </span>

              <strong>
                {activeBorrowings.length}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <span>
                Overdue
              </span>

              <strong>
                {overdueBorrowings.length}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <CheckCircle size={20} />
            </div>

            <div>
              <span>
                Returned
              </span>

              <strong>
                {returnedBorrowings.length}
              </strong>
            </div>

          </div>

        </div>

        {/* ========================= */}
        {/* SEARCH */}
        {/* ========================= */}

        <div className="books-toolbar">

          <div className="books-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search student, book, author, or accession number..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="books-count">
            {filteredBorrowings.length}{" "}
            {filteredBorrowings.length ===
            1
              ? "record"
              : "records"}
          </div>

        </div>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <div className="manage-books-error">
            {error}
          </div>
        )}

        {/* ========================= */}
        {/* LOADING */}
        {/* ========================= */}

        {loading ? (

          <div className="manage-books-loading">

            <Loader2
              size={22}
              className="spin"
            />

            Loading borrowings...

          </div>

        ) : filteredBorrowings.length ===
          0 ? (

          <div className="manage-books-empty">

            <BookOpen size={42} />

            <h3>
              No borrowing records
            </h3>

            <p>
              There are no matching
              borrowing records.
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
                      Accession
                    </th>

                    <th>
                      Borrowed
                    </th>

                    <th>
                      Due Date
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

                  {filteredBorrowings.map(
                    (borrowing) => {

                      const overdue =
                        isOverdue(
                          borrowing
                        );

                      return (
                        <tr
                          key={borrowing.id}
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
                                    borrowing.user.name
                                  }
                                </strong>

                              </div>

                              <span>
                                {
                                  borrowing.user.email
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
                                    borrowing
                                      .bookCopy
                                      .book
                                      .title
                                  }
                                </strong>

                                <span>
                                  by{" "}
                                  {
                                    borrowing
                                      .bookCopy
                                      .book
                                      .author
                                      .name
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* ACCESSION */}

                          <td>

                            <div className="table-info">

                              <span>
                                #
                              </span>

                              <strong>
                                {
                                  borrowing
                                    .bookCopy
                                    .accessionNumber
                                }
                              </strong>

                            </div>

                          </td>

                          {/* BORROWED */}

                          <td>

                            <div className="date-info">

                              <CalendarDays
                                size={15}
                              />

                              {
                                formatDate(
                                  borrowing.borrowedAt
                                )
                              }

                            </div>

                          </td>

                          {/* DUE */}

                          <td>

                            <div
                              className={`date-info ${
                                overdue
                                  ? "overdue-date"
                                  : ""
                              }`}
                            >

                              <CalendarDays
                                size={15}
                              />

                              {
                                formatDate(
                                  borrowing.dueDate
                                )
                              }

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            {borrowing.returnedAt ? (

                              <span className="copy-status borrowing-returned">
                                RETURNED
                              </span>

                            ) : overdue ? (

                              <span className="copy-status copy-lost borrowing-overdue">
                                OVERDUE
                              </span>

                            ) : (

                              <span className="copy-status copy-borrowed">
                                BORROWED
                              </span>

                            )}

                          </td>

                          {/* ACTION */}

                          <td>

                            {!borrowing.returnedAt ? (

                              <button
                                type="button"
                                className="return-book-button"
                                disabled={
                                  returningId ===
                                  borrowing.id
                                }
                                onClick={() =>
                                  handleReturn(
                                    borrowing
                                  )
                                }
                              >

                                {returningId ===
                                borrowing.id ? (
                                  <>
                                    <Loader2
                                      size={15}
                                      className="spin"
                                    />

                                    Returning...
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw
                                      size={15}
                                    />

                                    Return
                                  </>
                                )}

                              </button>

                            ) : (

                              <span className="returned-label">
                                Returned
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