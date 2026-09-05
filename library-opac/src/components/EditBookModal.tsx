import { useEffect, useState } from "react";

import {
  X,
  BookOpen,
  Save,
  Loader2,
  ImagePlus,
  Trash2,
} from "lucide-react";

import api from "../services/api";
import type { Book } from "../services/bookApi";

interface EditBookModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

interface Category {
  id: number;
  name: string;
}

const API_URL = "http://localhost:5000";

export default function EditBookModal({
  book,
  onClose,
  onSuccess,
}: EditBookModalProps) {
  const [title, setTitle] = useState(
    book.title
  );

  const [authorName, setAuthorName] = useState(
    book.author.name
  );

  const [isbn, setIsbn] = useState(
    book.isbn || ""
  );

  const [description, setDescription] =
    useState(book.description || "");

  const [publisher, setPublisher] =
    useState(book.publisher || "");

  const [publicationYear, setPublicationYear] =
    useState(
      book.publicationYear
        ? String(book.publicationYear)
        : ""
    );

  const [categoryId, setCategoryId] =
    useState(String(book.category.id));

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [coverPreview, setCoverPreview] =
    useState<string | null>(
      book.coverImage
        ? `${API_URL}${book.coverImage}`
        : null
    );

  const [removeCover, setRemoveCover] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // LOAD CATEGORIES
  // =========================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response =
          await api.get("/categories");

        setCategories(response.data);
      } catch (error) {
        console.error(
          "LOAD CATEGORIES ERROR:",
          error
        );

        setError(
          "Failed to load categories."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadCategories();
  }, []);

  // =========================
  // HANDLE COVER IMAGE
  // =========================

  const handleCoverChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Book cover must not exceed 5 MB."
      );

      e.target.value = "";
      return;
    }

    setError("");

    setCoverImage(file);
    setRemoveCover(false);

    const previewUrl =
      URL.createObjectURL(file);

    setCoverPreview(previewUrl);
  };

  // =========================
  // REMOVE COVER
  // =========================

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
    setRemoveCover(true);
    setError("");
  };

  // =========================
  // UPDATE BOOK
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError(
        "Book title is required."
      );
      return;
    }

    if (!authorName.trim()) {
      setError(
        "Author name is required."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Please select a category."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // FIND AUTHOR
      // =========================

      const authorsResponse =
        await api.get("/authors");

      let authorId = book.author.id;

      const existingAuthor =
        authorsResponse.data.find(
          (author: {
            id: number;
            name: string;
          }) =>
            author.name
              .trim()
              .toLowerCase() ===
            authorName
              .trim()
              .toLowerCase()
        );

      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        const newAuthorResponse =
          await api.post("/authors", {
            name: authorName.trim(),
          });

        authorId =
          newAuthorResponse.data.id ||
          newAuthorResponse.data.author?.id;
      }

      if (!authorId) {
        throw new Error(
          "Failed to determine author."
        );
      }

      // =========================
      // FORM DATA
      // =========================

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "isbn",
        isbn.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "publisher",
        publisher.trim()
      );

      if (publicationYear) {
        formData.append(
          "publicationYear",
          publicationYear
        );
      }

      formData.append(
        "authorId",
        String(authorId)
      );

      formData.append(
        "categoryId",
        String(Number(categoryId))
      );

      // New cover
      if (coverImage) {
        formData.append(
          "coverImage",
          coverImage
        );
      }

      // Remove cover
      if (removeCover) {
        formData.append(
          "removeCover",
          "true"
        );
      }

      // =========================
      // UPDATE BOOK
      // =========================

      await api.put(
        `/books/${book.id}`,
        formData
      );

      onSuccess();
    } catch (error: any) {
      console.error(
        "UPDATE BOOK ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update book."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="add-book-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
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
        {/* =========================
            HEADER
        ========================== */}

        <div className="add-book-modal-header">
          <div className="add-book-modal-title-wrapper">
            <div className="add-book-modal-icon">
              <BookOpen size={22} />
            </div>

            <div>
              <h2>
                Edit Book
              </h2>

              <p>
                Update this book's information.
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

        {/* =========================
            FORM
        ========================== */}

        <form
          className="add-book-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="add-book-error">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="modal-loading">
              <Loader2
                size={20}
                className="spin"
              />

              Loading categories...
            </div>
          ) : (
            <>
              {/* =========================
                  TITLE
              ========================== */}

              <div className="form-group">
                <label>
                  Book Title{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* =========================
                  AUTHOR + CATEGORY
              ========================== */}

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Author{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Jose Rizal"
                    value={authorName}
                    onChange={(e) =>
                      setAuthorName(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Category{" "}
                    <span>*</span>
                  </label>

                  <select
                    value={categoryId}
                    onChange={(e) =>
                      setCategoryId(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* =========================
                  ISBN + YEAR
              ========================== */}

              <div className="form-row">
                <div className="form-group">
                  <label>
                    ISBN
                  </label>

                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) =>
                      setIsbn(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Publication Year
                  </label>

                  <input
                    type="number"
                    value={
                      publicationYear
                    }
                    onChange={(e) =>
                      setPublicationYear(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* =========================
                  PUBLISHER
              ========================== */}

              <div className="form-group">
                <label>
                  Publisher
                </label>

                <input
                  type="text"
                  value={publisher}
                  onChange={(e) =>
                    setPublisher(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* =========================
                  BOOK COVER
              ========================== */}

              <div className="form-group">
                <label>
                  Book Cover
                </label>

                {coverPreview ? (
                  <div className="edit-cover-preview-container">
                    <img
                      src={coverPreview}
                      alt={`Cover of ${book.title}`}
                      className="edit-cover-preview"
                    />

                    <div className="edit-cover-actions">
                      <label className="book-cover-upload">
                        <ImagePlus size={18} />

                        <span>
                          Replace Cover
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleCoverChange
                          }
                          hidden
                        />
                      </label>

                      <button
                        type="button"
                        className="remove-cover-button"
                        onClick={
                          handleRemoveCover
                        }
                        disabled={loading}
                      >
                        <Trash2 size={17} />

                        Remove Cover
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="book-cover-upload">
                      <ImagePlus size={20} />

                      <span>
                        Choose book cover
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleCoverChange
                        }
                        hidden
                      />
                    </label>

                    <small className="form-hint">
                      JPG, PNG, or WEBP.
                      Maximum 5 MB.
                    </small>
                  </div>
                )}
              </div>

              {/* =========================
                  DESCRIPTION
              ========================== */}

              <div className="form-group">
                <label>
                  Description
                </label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* =========================
                  FOOTER
              ========================== */}

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

                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}