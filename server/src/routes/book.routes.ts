import { Router } from "express";

import prisma from "../prisma";

import upload from "../middleware/upload.middleware";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

/* =========================================================
   GET ALL BOOKS
========================================================= */

router.get("/", async (_req, res) => {
  try {
    const books =
      await prisma.book.findMany({
        include: {
          author: true,
          category: true,
          copies: true,
        },

        orderBy: {
          title: "asc",
        },
      });

    res.json(books);
  } catch (error) {
    console.error(
      "GET BOOKS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch books",
    });
  }
});

/* =========================================================
   GET BOOK BY ID
========================================================= */

router.get(
  "/:id",
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message:
            "Invalid book ID",
        });
      }

      const book =
        await prisma.book.findUnique({
          where: {
            id,
          },

          include: {
            author: true,
            category: true,
            copies: true,
          },
        });

      if (!book) {
        return res.status(404).json({
          message:
            "Book not found",
        });
      }

      res.json(book);
    } catch (error) {
      console.error(
        "GET BOOK ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch book",
      });
    }
  }
);

/* =========================================================
   CREATE BOOK
========================================================= */

router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "LIBRARIAN",
    "ADMIN"
  ),
  upload.single("coverImage"),

  async (req, res) => {
    try {
      const {
        title,
        isbn,
        description,
        publisher,
        publicationYear,
        authorId,
        categoryId,
        categoryName,
      } = req.body;

      /* =====================================================
         VALIDATE TITLE
      ===================================================== */

      if (
        !title ||
        !title.trim()
      ) {
        return res.status(400).json({
          message:
            "Book title is required",
        });
      }

      /* =====================================================
         VALIDATE AUTHOR
      ===================================================== */

      if (!authorId) {
        return res.status(400).json({
          message:
            "Author is required",
        });
      }

      const parsedAuthorId =
        Number(authorId);

      if (
        Number.isNaN(
          parsedAuthorId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid author ID",
        });
      }

      const author =
        await prisma.author.findUnique(
          {
            where: {
              id: parsedAuthorId,
            },
          }
        );

      if (!author) {
        return res.status(404).json({
          message:
            "Author not found",
        });
      }

      /* =====================================================
         CATEGORY
         
         Supports:
         1. categoryName
         2. categoryId
      ===================================================== */

      let category;

      if (
        categoryName &&
        categoryName.trim()
      ) {
        const normalizedCategory =
          categoryName.trim();

        /* -----------------------------------------------
           FIND EXISTING CATEGORY
        ------------------------------------------------ */

        category =
          await prisma.category.findFirst(
            {
              where: {
                name: {
                  equals:
                    normalizedCategory,
                  mode: "insensitive",
                },
              },
            }
          );

        /* -----------------------------------------------
           CREATE CATEGORY IF NOT FOUND
        ------------------------------------------------ */

        if (!category) {
          category =
            await prisma.category.create(
              {
                data: {
                  name:
                    normalizedCategory,
                },
              }
            );
        }
      } else if (
        categoryId
      ) {
        const parsedCategoryId =
          Number(categoryId);

        if (
          Number.isNaN(
            parsedCategoryId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid category ID",
          });
        }

        category =
          await prisma.category.findUnique(
            {
              where: {
                id:
                  parsedCategoryId,
              },
            }
          );

        if (!category) {
          return res.status(404).json({
            message:
              "Category not found",
          });
        }
      } else {
        return res.status(400).json({
          message:
            "Category is required",
        });
      }

      /* =====================================================
         COVER IMAGE
      ===================================================== */

      const coverImage =
        req.file
          ? `/uploads/books/${req.file.filename}`
          : null;

      /* =====================================================
         ISBN DUPLICATE CHECK
      ===================================================== */

      const cleanIsbn =
        isbn?.trim() || null;

      if (cleanIsbn) {
        const existingBook =
          await prisma.book.findUnique(
            {
              where: {
                isbn: cleanIsbn,
              },
            }
          );

        if (existingBook) {
          return res.status(409).json({
            message:
              "ISBN already exists",
          });
        }
      }

      /* =====================================================
         PUBLICATION YEAR
      ===================================================== */

      let parsedPublicationYear =
        null;

      if (
        publicationYear !==
          undefined &&
        publicationYear !==
          null &&
        String(
          publicationYear
        ).trim() !== ""
      ) {
        parsedPublicationYear =
          Number(
            publicationYear
          );

        if (
          Number.isNaN(
            parsedPublicationYear
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid publication year",
          });
        }
      }

      /* =====================================================
         CREATE BOOK
      ===================================================== */

      const book =
        await prisma.book.create({
          data: {
            title:
              title.trim(),

            isbn:
              cleanIsbn,

            description:
              description?.trim() ||
              null,

            publisher:
              publisher?.trim() ||
              null,

            publicationYear:
              parsedPublicationYear,

            coverImage,

            authorId:
              parsedAuthorId,

            categoryId:
              category.id,
          },

          include: {
            author: true,
            category: true,
            copies: true,
          },
        });

      /* =====================================================
         SUCCESS
      ===================================================== */

      res.status(201).json({
        message:
          "Book created successfully",

        book,
      });
    } catch (error) {
      console.error(
        "CREATE BOOK ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create book",
      });
    }
  }
);

/* =========================================================
   UPDATE BOOK
========================================================= */

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "LIBRARIAN",
    "ADMIN"
  ),
  upload.single("coverImage"),

  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message:
            "Invalid book ID",
        });
      }

      const {
        title,
        isbn,
        description,
        publisher,
        publicationYear,
        authorId,
        categoryId,
        categoryName,
        removeCover,
      } = req.body;

      /* =====================================================
         VALIDATE TITLE
      ===================================================== */

      if (
        !title ||
        !title.trim()
      ) {
        return res.status(400).json({
          message:
            "Book title is required",
        });
      }

      /* =====================================================
         FIND EXISTING BOOK
      ===================================================== */

      const existingBook =
        await prisma.book.findUnique({
          where: {
            id,
          },
        });

      if (!existingBook) {
        return res.status(404).json({
          message:
            "Book not found",
        });
      }

      /* =====================================================
         AUTHOR
      ===================================================== */

      let finalAuthorId =
        existingBook.authorId;

      if (authorId) {
        const parsedAuthorId =
          Number(authorId);

        if (
          Number.isNaN(
            parsedAuthorId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid author ID",
          });
        }

        const author =
          await prisma.author.findUnique(
            {
              where: {
                id:
                  parsedAuthorId,
              },
            }
          );

        if (!author) {
          return res.status(404).json({
            message:
              "Author not found",
          });
        }

        finalAuthorId =
          parsedAuthorId;
      }

      /* =====================================================
         CATEGORY
      ===================================================== */

      let finalCategoryId =
        existingBook.categoryId;

      /* -----------------------------------------------------
         CATEGORY NAME HAS PRIORITY
      ----------------------------------------------------- */

      if (
        categoryName &&
        categoryName.trim()
      ) {
        const normalizedCategory =
          categoryName.trim();

        let category =
          await prisma.category.findFirst(
            {
              where: {
                name: {
                  equals:
                    normalizedCategory,
                  mode: "insensitive",
                },
              },
            }
          );

        /* ---------------------------------------------------
           CREATE NEW CATEGORY
        --------------------------------------------------- */

        if (!category) {
          category =
            await prisma.category.create(
              {
                data: {
                  name:
                    normalizedCategory,
                },
              }
            );
        }

        finalCategoryId =
          category.id;
      }

      /* -----------------------------------------------------
         FALLBACK TO CATEGORY ID
      ----------------------------------------------------- */

      else if (categoryId) {
        const parsedCategoryId =
          Number(categoryId);

        if (
          Number.isNaN(
            parsedCategoryId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid category ID",
          });
        }

        const category =
          await prisma.category.findUnique(
            {
              where: {
                id:
                  parsedCategoryId,
              },
            }
          );

        if (!category) {
          return res.status(404).json({
            message:
              "Category not found",
          });
        }

        finalCategoryId =
          parsedCategoryId;
      }

      /* =====================================================
         ISBN
      ===================================================== */

      const cleanIsbn =
        isbn?.trim() || null;

      if (cleanIsbn) {
        const duplicate =
          await prisma.book.findFirst({
            where: {
              isbn: cleanIsbn,

              NOT: {
                id,
              },
            },
          });

        if (duplicate) {
          return res.status(409).json({
            message:
              "ISBN already exists",
          });
        }
      }

      /* =====================================================
         PUBLICATION YEAR
      ===================================================== */

      let parsedPublicationYear =
        null;

      if (
        publicationYear !==
          undefined &&
        publicationYear !==
          null &&
        String(
          publicationYear
        ).trim() !== ""
      ) {
        parsedPublicationYear =
          Number(
            publicationYear
          );

        if (
          Number.isNaN(
            parsedPublicationYear
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid publication year",
          });
        }
      }

      /* =====================================================
         COVER IMAGE
      ===================================================== */

      let coverImage =
        existingBook.coverImage;

      /* New cover uploaded */

      if (req.file) {
        coverImage =
          `/uploads/books/${req.file.filename}`;
      }

      /* Remove cover */

      if (
        removeCover ===
        "true"
      ) {
        coverImage = null;
      }

      /* =====================================================
         UPDATE BOOK
      ===================================================== */

      const book =
        await prisma.book.update({
          where: {
            id,
          },

          data: {
            title:
              title.trim(),

            isbn:
              cleanIsbn,

            description:
              description?.trim() ||
              null,

            publisher:
              publisher?.trim() ||
              null,

            publicationYear:
              parsedPublicationYear,

            coverImage,

            authorId:
              finalAuthorId,

            categoryId:
              finalCategoryId,
          },

          include: {
            author: true,
            category: true,
            copies: true,
          },
        });

      /* =====================================================
         SUCCESS
      ===================================================== */

      res.json({
        message:
          "Book updated successfully",

        book,
      });
    } catch (error) {
      console.error(
        "UPDATE BOOK ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update book",
      });
    }
  }
);

/* =========================================================
   DELETE BOOK
========================================================= */

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "LIBRARIAN",
    "ADMIN"
  ),

  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message:
            "Invalid book ID",
        });
      }

      /* =====================================================
         FIND BOOK
      ===================================================== */

      const existingBook =
        await prisma.book.findUnique({
          where: {
            id,
          },

          include: {
            copies: true,
            reservations: true,
          },
        });

      if (!existingBook) {
        return res.status(404).json({
          message:
            "Book not found",
        });
      }

      /* =====================================================
         CHECK COPIES
      ===================================================== */

      if (
        existingBook.copies
          .length > 0
      ) {
        return res.status(409).json({
          message:
            "Cannot delete book because it has physical copies",
        });
      }

      /* =====================================================
         CHECK RESERVATIONS
      ===================================================== */

      if (
        existingBook
          .reservations.length > 0
      ) {
        return res.status(409).json({
          message:
            "Cannot delete book because it has reservations",
        });
      }

      /* =====================================================
         DELETE
      ===================================================== */

      await prisma.book.delete({
        where: {
          id,
        },
      });

      res.json({
        message:
          "Book deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE BOOK ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete book",
      });
    }
  }
);

export default router;