import {
  useEffect,
  useState,
} from "react";

import {
  X,
  BookOpen,
  Save,
  Loader2,
  ImagePlus,
} from "lucide-react";

import api from "../services/api";

interface AddBookModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Author {
  id: number;
  name: string;
}

export default function AddBookModal({
  onClose,
  onSuccess,
}: AddBookModalProps) {
  // =========================
  // FORM STATES
  // =========================

  const [title, setTitle] =
    useState("");

  const [authorName, setAuthorName] =
    useState("");

  const [categoryName, setCategoryName] =
    useState("");

  const [isbn, setIsbn] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [publisher, setPublisher] =
    useState("");

  const [publicationYear, setPublicationYear] =
    useState("");

  // =========================
  // COVER IMAGE
  // =========================

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [coverPreview, setCoverPreview] =
    useState("");

  // =========================
  // AUTHORS
  // =========================

  const [authors, setAuthors] =
    useState<Author[]>([]);

  const [loadingAuthors, setLoadingAuthors] =
    useState(true);

  // =========================
  // UI STATES
  // =========================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // LOAD AUTHORS
  // =========================

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        setLoadingAuthors(true);

        const response =
          await api.get("/authors");

        setAuthors(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "LOAD AUTHORS ERROR:",
          error
        );

        /*
         * Hindi natin ibablock ang user.
         *
         * Kahit hindi ma-load ang authors,
         * susubukan pa rin nating gumawa
         * ng bagong author kapag submit.
         */
        setAuthors([]);
      } finally {
        setLoadingAuthors(false);
      }
    };

    loadAuthors();
  }, []);

  // =========================
  // CLEANUP PREVIEW URL
  // =========================

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(
          coverPreview
        );
      }
    };
  }, [coverPreview]);

  // =========================
  // HANDLE COVER IMAGE
  // =========================

  const handleCoverImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      setCoverImage(null);
      setCoverPreview("");
      return;
    }

    // =========================
    // FILE TYPE
    // =========================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      e.target.value = "";

      return;
    }

    // =========================
    // FILE SIZE
    // =========================

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Book cover must not exceed 5 MB."
      );

      e.target.value = "";

      return;
    }

    // =========================
    // CREATE PREVIEW
    // =========================

    setError("");

    setCoverImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setCoverPreview(
      previewUrl
    );
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    // =========================
    // VALIDATION
    // =========================

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

    if (!categoryName.trim()) {
      setError(
        "Category is required."
      );

      return;
    }

    // =========================
    // PUBLICATION YEAR
    // =========================

    if (publicationYear) {
      const year =
        Number(publicationYear);

      const currentYear =
        new Date().getFullYear();

      if (
        !Number.isInteger(year) ||
        year < 1000 ||
        year > currentYear
      ) {
        setError(
          `Publication year must be between 1000 and ${currentYear}.`
        );

        return;
      }
    }

    try {
      setLoading(true);

      // ==================================================
      // FIND EXISTING AUTHOR
      // ==================================================

      let authorId: number | null =
        null;

      const cleanAuthorName =
        authorName.trim();

      const matchedAuthor =
        authors.find(
          (author) =>
            author.name
              .trim()
              .toLowerCase() ===
            cleanAuthorName
              .toLowerCase()
        );

      // ==================================================
      // EXISTING AUTHOR
      // ==================================================

      if (matchedAuthor) {
        authorId =
          matchedAuthor.id;
      }

      // ==================================================
      // NEW AUTHOR
      // ==================================================

      else {
        const authorResponse =
          await api.post(
            "/authors",
            {
              name:
                cleanAuthorName,
            }
          );

        /*
         * Supported responses:
         *
         * {
         *   id: 1,
         *   name: "Jose Rizal"
         * }
         *
         * OR
         *
         * {
         *   author: {
         *     id: 1
         *   }
         * }
         */

        authorId =
          authorResponse.data?.id ||
          authorResponse.data?.author?.id ||
          null;
      }

      // ==================================================
      // CHECK AUTHOR ID
      // ==================================================

      if (!authorId) {
        throw new Error(
          "Failed to create or find author."
        );
      }

      // ==================================================
      // FORM DATA
      // ==================================================

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "authorId",
        String(authorId)
      );

      formData.append(
        "categoryName",
        categoryName.trim()
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

      // ==================================================
      // PUBLICATION YEAR
      // ==================================================

      if (publicationYear) {
        formData.append(
          "publicationYear",
          publicationYear
        );
      }

      // ==================================================
      // COVER IMAGE
      // ==================================================

      if (coverImage) {
        formData.append(
          "coverImage",
          coverImage
        );
      }

      // ==================================================
      // CREATE BOOK
      // ==================================================

      await api.post(
        "/books",
        formData
      );

      // ==================================================
      // SUCCESS
      // ==================================================

      onSuccess();
    } catch (error: any) {
      console.error(
        "ADD BOOK ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create book."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

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
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="add-book-modal-header">
          <div className="add-book-modal-title-wrapper">

            <div className="add-book-modal-icon">
              <BookOpen size={22} />
            </div>

            <div>
              <h2>
                Add New Book
              </h2>

              <p>
                Add a book to your
                library collection.
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

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          className="add-book-form"
          onSubmit={handleSubmit}
        >

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="add-book-error">
              {error}
            </div>
          )}

          {/* ==================================================
              BOOK TITLE
          ================================================== */}

          <div className="form-group">

            <label>
              Book Title{" "}
              <span>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Noli Me Tangere"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              disabled={loading}
            />

          </div>

          {/* ==================================================
              AUTHOR + CATEGORY
          ================================================== */}

          <div className="form-row">

            {/* AUTHOR */}

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
                disabled={loading}
              />

              <small className="form-hint">
                Enter an existing author
                or create a new one.
              </small>

            </div>

            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category{" "}
                <span>*</span>
              </label>

              <input
                type="text"
                placeholder="e.g. Fiction, History, Programming"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(
                    e.target.value
                  )
                }
                disabled={loading}
              />

              <small className="form-hint">
                Enter any category.
                New categories are
                created automatically.
              </small>

            </div>

          </div>

          {/* ==================================================
              ISBN + YEAR
          ================================================== */}

          <div className="form-row">

            {/* ISBN */}

            <div className="form-group">

              <label>
                ISBN
              </label>

              <input
                type="text"
                placeholder="9789715694007"
                value={isbn}
                onChange={(e) =>
                  setIsbn(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>

            {/* YEAR */}

            <div className="form-group">

              <label>
                Publication Year
              </label>

              <input
                type="number"
                placeholder="1887"
                min="1000"
                max={
                  new Date().getFullYear()
                }
                value={
                  publicationYear
                }
                onChange={(e) =>
                  setPublicationYear(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>

          </div>

          {/* ==================================================
              PUBLISHER
          ================================================== */}

          <div className="form-group">

            <label>
              Publisher
            </label>

            <input
              type="text"
              placeholder="e.g. Ateneo de Manila University Press"
              value={publisher}
              onChange={(e) =>
                setPublisher(
                  e.target.value
                )
              }
              disabled={loading}
            />

          </div>

          {/* ==================================================
              BOOK COVER
          ================================================== */}

          <div className="form-group">

            <label>
              Book Cover
            </label>

            <label
              className="book-cover-upload"
            >

              <ImagePlus size={20} />

              <span>
                {coverImage
                  ? coverImage.name
                  : "Choose book cover"}
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleCoverImageChange
                }
                hidden
                disabled={loading}
              />

            </label>

            <small className="form-hint">
              JPG, PNG, or WEBP.
              Maximum 5 MB.
            </small>

            {/* ==================================================
                IMAGE PREVIEW
            ================================================== */}

            {coverPreview && (
              <div className="book-cover-preview-wrapper">

                <img
                  src={coverPreview}
                  alt="Book cover preview"
                  className="book-cover-preview"
                />

              </div>
            )}

          </div>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              rows={4}
              placeholder="Enter a short description of the book..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              disabled={loading}
            />

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

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
              disabled={
                loading ||
                loadingAuthors
              }
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

                  Add Book
                </>
              )}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
}