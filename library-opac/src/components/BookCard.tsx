import {
  BookOpen,
  CheckCircle,
  MapPin,
  ArrowRight,
} from "lucide-react";

import type { Book } from "../services/bookApi";
import { Link } from "react-router-dom";

interface BookCardProps {
  book: Book;
}

const API_URL = "http://localhost:5000";

export default function BookCard({
  book,
}: BookCardProps) {
  const availableCopies = book.copies.filter(
    (copy) => copy.status === "AVAILABLE"
  );

  const isAvailable = availableCopies.length > 0;

  const coverUrl = book.coverImage
    ? `${API_URL}${book.coverImage}`
    : null;

  return (
    <article className="book-card">
      <div className="book-cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="book-cover-placeholder">
            <BookOpen size={52} />
            <span>Library Book</span>
          </div>
        )}
      </div>

      <div className="book-card-content">
        <div className="book-card-category">
          {book.category.name}
        </div>

        <h3>{book.title}</h3>

        <p className="book-author">
          by {book.author.name}
        </p>

        {book.description && (
          <p className="book-description">
            {book.description}
          </p>
        )}

        <div className="book-card-meta">
          <div className="book-availability">
            <CheckCircle size={16} />

            {isAvailable
              ? `${availableCopies.length} available`
              : "Currently unavailable"}
          </div>

          {availableCopies.length > 0 && (
            <div className="book-location">
              <MapPin size={15} />

              {availableCopies[0].shelfLocation ||
                "Shelf location not set"}
            </div>
          )}
        </div>

        <Link
          to={`/books/${book.id}`}
          className="book-details-button"
        >
          View Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}