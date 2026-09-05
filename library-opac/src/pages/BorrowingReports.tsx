import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader2,
  Search,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getBorrowings,
  type Borrowing,
} from "../services/borrowingApi";

export default function BorrowingReports() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>(
    []
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [dateFilter, setDateFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // LOAD BORROWINGS
  // =========================

  const loadBorrowings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBorrowings();

      setBorrowings(data || []);
    } catch (error: any) {
      console.error(
        "LOAD BORROWING REPORT ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load borrowing reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowings();
  }, []);

  // =========================
  // DATE HELPERS
  // =========================

  const today = new Date();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const isOverdue = (borrowing: Borrowing) => {
    return (
      !borrowing.returnedAt &&
      new Date(
        borrowing.dueDate
      ).getTime() < startOfToday.getTime()
    );
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // STATISTICS
  // =========================

  const statistics = useMemo(() => {
    const total = borrowings.length;

    const active = borrowings.filter(
      (borrowing) =>
        !borrowing.returnedAt
    ).length;

    const returned = borrowings.filter(
      (borrowing) =>
        !!borrowing.returnedAt
    ).length;

    const overdue = borrowings.filter(
      (borrowing) =>
        isOverdue(borrowing)
    ).length;

    const uniqueStudents =
      new Set(
        borrowings.map(
          (borrowing) =>
            borrowing.user.id
        )
      ).size;

    const uniqueBooks =
      new Set(
        borrowings.map(
          (borrowing) =>
            borrowing.bookCopy.book.id
        )
      ).size;

    return {
      total,
      active,
      returned,
      overdue,
      uniqueStudents,
      uniqueBooks,
    };
  }, [borrowings]);

  // =========================
  // DATE FILTER
  // =========================

  const matchesDateFilter = (
    borrowing: Borrowing
  ) => {
    if (dateFilter === "ALL") {
      return true;
    }

    const borrowedDate =
      new Date(
        borrowing.borrowedAt
      );

    const now = new Date();

    if (dateFilter === "TODAY") {
      return (
        borrowedDate.toDateString() ===
        now.toDateString()
      );
    }

    if (dateFilter === "WEEK") {
      const weekAgo = new Date();

      weekAgo.setDate(
        weekAgo.getDate() - 7
      );

      return borrowedDate >= weekAgo;
    }

    if (dateFilter === "MONTH") {
      const monthAgo = new Date();

      monthAgo.setMonth(
        monthAgo.getMonth() - 1
      );

      return borrowedDate >= monthAgo;
    }

    if (dateFilter === "YEAR") {
      const yearAgo = new Date();

      yearAgo.setFullYear(
        yearAgo.getFullYear() - 1
      );

      return borrowedDate >= yearAgo;
    }

    return true;
  };

  // =========================
  // FILTER REPORT DATA
  // =========================

  const filteredBorrowings =
    useMemo(() => {
      const keyword =
        search.toLowerCase().trim();

      return borrowings.filter(
        (borrowing) => {
          const matchesSearch =
            !keyword ||
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
              .includes(keyword);

          let matchesStatus = true;

          if (
            statusFilter ===
            "BORROWED"
          ) {
            matchesStatus =
              !borrowing.returnedAt &&
              !isOverdue(borrowing);
          }

          if (
            statusFilter ===
            "OVERDUE"
          ) {
            matchesStatus =
              isOverdue(borrowing);
          }

          if (
            statusFilter ===
            "RETURNED"
          ) {
            matchesStatus =
              !!borrowing.returnedAt;
          }

          return (
            matchesSearch &&
            matchesStatus &&
            matchesDateFilter(
              borrowing
            )
          );
        }
      );
    }, [
      borrowings,
      search,
      statusFilter,
      dateFilter,
    ]);

  // =========================
  // MOST BORROWED BOOKS
  // =========================

  const mostBorrowedBooks =
    useMemo(() => {
      const map = new Map<
        number,
        {
          title: string;
          author: string;
          count: number;
        }
      >();

      borrowings.forEach(
        (borrowing) => {
          const book =
            borrowing.bookCopy.book;

          const existing =
            map.get(book.id);

          if (existing) {
            existing.count += 1;
          } else {
            map.set(book.id, {
              title: book.title,
              author: book.author.name,
              count: 1,
            });
          }
        }
      );

      return Array.from(
        map.values()
      )
        .sort(
          (a, b) =>
            b.count - a.count
        )
        .slice(0, 5);
    }, [borrowings]);

  // =========================
  // MOST ACTIVE STUDENTS
  // =========================

  const mostActiveStudents =
    useMemo(() => {
      const map = new Map<
        number,
        {
          name: string;
          email: string;
          count: number;
        }
      >();

      borrowings.forEach(
        (borrowing) => {
          const user =
            borrowing.user;

          const existing =
            map.get(user.id);

          if (existing) {
            existing.count += 1;
          } else {
            map.set(user.id, {
              name: user.name,
              email: user.email,
              count: 1,
            });
          }
        }
      );

      return Array.from(
        map.values()
      )
        .sort(
          (a, b) =>
            b.count - a.count
        )
        .slice(0, 5);
    }, [borrowings]);

  // =========================
  // EXPORT CSV
  // =========================

  const exportCSV = () => {
    if (
      filteredBorrowings.length === 0
    ) {
      return;
    }

    const headers = [
      "Student",
      "Email",
      "Book",
      "Author",
      "Accession Number",
      "Borrowed Date",
      "Due Date",
      "Returned Date",
      "Status",
    ];

    const rows =
      filteredBorrowings.map(
        (borrowing) => {
          let status =
            "BORROWED";

          if (
            borrowing.returnedAt
          ) {
            status = "RETURNED";
          } else if (
            isOverdue(borrowing)
          ) {
            status = "OVERDUE";
          }

          return [
            borrowing.user.name,
            borrowing.user.email,
            borrowing.bookCopy.book.title,
            borrowing.bookCopy.book.author.name,
            borrowing.bookCopy.accessionNumber,
            formatDate(
              borrowing.borrowedAt
            ),
            formatDate(
              borrowing.dueDate
            ),
            borrowing.returnedAt
              ? formatDate(
                  borrowing.returnedAt
                )
              : "",
            status,
          ];
        }
      );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const stringValue =
              String(value);

            return `"${stringValue.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `borrowing-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================
  // RENDER
  // =========================

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
              LIBRARY REPORTS
            </span>

            <h1>
              Borrowing Reports
            </h1>

            <p>
              Monitor circulation activity,
              borrowing trends, and library usage.
            </p>
          </div>

          <button
            type="button"
            className="save-book-button"
            onClick={exportCSV}
            disabled={
              loading ||
              filteredBorrowings.length === 0
            }
          >
            <Download size={17} />

            Export CSV
          </button>

        </div>

        {/* =========================
            STATISTICS
        ========================== */}

        <div className="copy-stats">

          {/* TOTAL */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <FileText size={20} />
            </div>

            <div>
              <span>
                Total Borrowings
              </span>

              <strong>
                {statistics.total}
              </strong>
            </div>

          </div>

          {/* ACTIVE */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <Clock size={20} />
            </div>

            <div>
              <span>
                Active
              </span>

              <strong>
                {statistics.active}
              </strong>
            </div>

          </div>

          {/* OVERDUE */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>
                Overdue
              </span>

              <strong>
                {statistics.overdue}
              </strong>
            </div>

          </div>

          {/* RETURNED */}

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <CheckCircle size={20} />
            </div>

            <div>
              <span>
                Returned
              </span>

              <strong>
                {statistics.returned}
              </strong>
            </div>

          </div>

        </div>

        {/* =========================
            SECONDARY STATS
        ========================== */}

        <div className="copy-stats">

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>
                Students
              </span>

              <strong>
                {statistics.uniqueStudents}
              </strong>
            </div>

          </div>

          <div className="copy-stat-card">

            <div className="copy-stat-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <span>
                Books Borrowed
              </span>

              <strong>
                {statistics.uniqueBooks}
              </strong>
            </div>

          </div>

        </div>

        {/* =========================
            FILTER TOOLBAR
        ========================== */}

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

          <select
            className="category-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Status
            </option>

            <option value="BORROWED">
              Borrowed
            </option>

            <option value="OVERDUE">
              Overdue
            </option>

            <option value="RETURNED">
              Returned
            </option>
          </select>

          <select
            className="category-select"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Dates
            </option>

            <option value="TODAY">
              Today
            </option>

            <option value="WEEK">
              Last 7 Days
            </option>

            <option value="MONTH">
              Last 30 Days
            </option>

            <option value="YEAR">
              Last 12 Months
            </option>
          </select>

          <div className="books-count">
            {filteredBorrowings.length}{" "}
            {filteredBorrowings.length ===
            1
              ? "record"
              : "records"}
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

            Loading borrowing reports...

          </div>

        ) : (

          <>

            {/* =========================
                SUMMARY CARDS
            ========================== */}

            <div className="reports-summary-grid">

              {/* MOST BORROWED */}

              <div className="report-card">

                <div className="report-card-header">

                  <div>
                    <span className="librarian-eyebrow">
                      TOP BOOKS
                    </span>

                    <h2>
                      Most Borrowed Books
                    </h2>
                  </div>

                  <TrendingUp
                    size={21}
                  />

                </div>

                {mostBorrowedBooks.length ===
                0 ? (

                  <div className="report-empty">
                    No borrowing data yet.
                  </div>

                ) : (

                  <div className="report-list">

                    {mostBorrowedBooks.map(
                      (book, index) => (
                        <div
                          className="report-list-item"
                          key={book.title}
                        >

                          <div className="report-rank">
                            {index + 1}
                          </div>

                          <div className="report-item-main">

                            <strong>
                              {book.title}
                            </strong>

                            <span>
                              by{" "}
                              {book.author}
                            </span>

                          </div>

                          <div className="report-item-value">
                            {book.count}
                            <small>
                              borrows
                            </small>
                          </div>

                        </div>
                      )
                    )}

                  </div>

                )}

              </div>

              {/* MOST ACTIVE STUDENTS */}

              <div className="report-card">

                <div className="report-card-header">

                  <div>
                    <span className="librarian-eyebrow">
                      TOP STUDENTS
                    </span>

                    <h2>
                      Most Active Borrowers
                    </h2>
                  </div>

                  <User size={21} />

                </div>

                {mostActiveStudents.length ===
                0 ? (

                  <div className="report-empty">
                    No borrowing data yet.
                  </div>

                ) : (

                  <div className="report-list">

                    {mostActiveStudents.map(
                      (student, index) => (
                        <div
                          className="report-list-item"
                          key={student.email}
                        >

                          <div className="report-rank">
                            {index + 1}
                          </div>

                          <div className="report-item-main">

                            <strong>
                              {student.name}
                            </strong>

                            <span>
                              {student.email}
                            </span>

                          </div>

                          <div className="report-item-value">
                            {student.count}
                            <small>
                              borrows
                            </small>
                          </div>

                        </div>
                      )
                    )}

                  </div>

                )}

              </div>

            </div>

            {/* =========================
                BORROWING TABLE
            ========================== */}

            <div className="books-table-card">

              <div className="report-table-header">

                <div>
                  <span className="librarian-eyebrow">
                    BORROWING RECORDS
                  </span>

                  <h2>
                    Circulation History
                  </h2>
                </div>

                <span className="books-count">
                  {filteredBorrowings.length} records
                </span>

              </div>

              {filteredBorrowings.length ===
              0 ? (

                <div className="manage-books-empty">

                  <BookOpen size={42} />

                  <h3>
                    No records found
                  </h3>

                  <p>
                    Try changing your search
                    or filters.
                  </p>

                </div>

              ) : (

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
                          Returned
                        </th>

                        <th>
                          Status
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
                              key={
                                borrowing.id
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
                                        borrowing
                                          .user
                                          .name
                                      }
                                    </strong>

                                  </div>

                                  <span>
                                    {
                                      borrowing
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

                                  {formatDate(
                                    borrowing.borrowedAt
                                  )}

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

                                  {formatDate(
                                    borrowing.dueDate
                                  )}

                                </div>

                              </td>

                              {/* RETURNED */}

                              <td>

                                {borrowing.returnedAt ? (

                                  <div className="date-info">

                                    <CheckCircle
                                      size={15}
                                    />

                                    {formatDate(
                                      borrowing.returnedAt
                                    )}

                                  </div>

                                ) : (

                                  <span className="returned-label">
                                    Not returned
                                  </span>

                                )}

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

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>

        )}

      </main>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="footer">
        © 2026 Library OPAC.
        All rights reserved.
      </footer>

    </div>
  );
}