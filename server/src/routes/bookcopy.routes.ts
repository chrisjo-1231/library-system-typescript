import { Router } from "express";
import prisma from "../prisma";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

/* =========================================================
   GET ALL BOOK COPIES
========================================================= */

router.get(
  "/",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (_req, res) => {
    try {
      const copies =
        await prisma.bookCopy.findMany({
          include: {
            book: {
              include: {
                author: true,
                category: true,
              },
            },

            borrowings: {
              where: {
                returnedAt: null,
              },

              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },

              orderBy: {
                borrowedAt: "desc",
              },

              take: 1,
            },
          },

          orderBy: {
            id: "desc",
          },
        });

      res.json(copies);
    } catch (error) {
      console.error(
        "GET ALL BOOK COPIES ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch book copies",
      });
    }
  }
);

/* =========================================================
   GET COPIES BY BOOK
========================================================= */

router.get(
  "/book/:bookId",
  authenticateToken,
  authorizeRoles(
    "LIBRARIAN",
    "ADMIN",
    "STUDENT"
  ),
  async (req, res) => {
    try {
      const bookId = Number(
        req.params.bookId
      );

      if (!Number.isInteger(bookId)) {
        return res.status(400).json({
          message: "Invalid book ID",
        });
      }

      const copies =
        await prisma.bookCopy.findMany({
          where: {
            bookId,
          },

          orderBy: {
            accessionNumber: "asc",
          },
        });

      res.json(copies);
    } catch (error) {
      console.error(
        "GET BOOK COPIES ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch book copies",
      });
    }
  }
);

/* =========================================================
   CREATE BOOK COPIES
   BULK CREATE
========================================================= */

router.post(
  "/",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (req, res) => {
    try {
      const {
        bookId,
        quantity,
        startingAccessionNumber,
        shelfLocation,
      } = req.body;

      /* ---------------------------------------------
         VALIDATION
      --------------------------------------------- */

      if (!bookId) {
        return res.status(400).json({
          message: "Book is required",
        });
      }

      if (
        !quantity ||
        Number(quantity) < 1
      ) {
        return res.status(400).json({
          message:
            "Quantity must be at least 1",
        });
      }

      if (
        !startingAccessionNumber ||
        !startingAccessionNumber.trim()
      ) {
        return res.status(400).json({
          message:
            "Starting accession number is required",
        });
      }

      const numericBookId =
        Number(bookId);

      const numericQuantity =
        Number(quantity);

      if (!Number.isInteger(numericBookId)) {
        return res.status(400).json({
          message: "Invalid book ID",
        });
      }

      if (
        !Number.isInteger(numericQuantity) ||
        numericQuantity < 1
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a whole number greater than 0",
        });
      }

      if (numericQuantity > 100) {
        return res.status(400).json({
          message:
            "You can create a maximum of 100 copies at once",
        });
      }

      /* ---------------------------------------------
         CHECK BOOK
      --------------------------------------------- */

      const book =
        await prisma.book.findUnique({
          where: {
            id: numericBookId,
          },
        });

      if (!book) {
        return res.status(404).json({
          message: "Book not found",
        });
      }

      /* ---------------------------------------------
         PARSE ACCESSION NUMBER
         
         Example:
         LIB-0001
         
         quantity = 5
         
         Results:
         LIB-0001
         LIB-0002
         LIB-0003
         LIB-0004
         LIB-0005
      --------------------------------------------- */

      const startingValue =
        startingAccessionNumber.trim();

      const match =
        startingValue.match(
          /^(.*?)(\d+)$/
        );

      if (!match) {
        return res.status(400).json({
          message:
            "Starting accession number must end with a number. Example: LIB-0001",
        });
      }

      const prefix = match[1];

      const startingNumber =
        Number(match[2]);

      const numberLength =
        match[2].length;

      if (!Number.isInteger(startingNumber)) {
        return res.status(400).json({
          message:
            "Invalid starting accession number",
        });
      }

      /* ---------------------------------------------
         GENERATE ACCESSION NUMBERS
      --------------------------------------------- */

      const accessionNumbers: string[] =
        [];

      for (
        let i = 0;
        i < numericQuantity;
        i++
      ) {
        const currentNumber =
          startingNumber + i;

        const accessionNumber =
          `${prefix}${String(
            currentNumber
          ).padStart(
            numberLength,
            "0"
          )}`;

        accessionNumbers.push(
          accessionNumber
        );
      }

      /* ---------------------------------------------
         CHECK DUPLICATES
      --------------------------------------------- */

      const existingCopies =
        await prisma.bookCopy.findMany({
          where: {
            accessionNumber: {
              in: accessionNumbers,
            },
          },

          select: {
            accessionNumber: true,
          },
        });

      if (existingCopies.length > 0) {
        return res.status(409).json({
          message:
            "One or more accession numbers already exist",
          duplicates:
            existingCopies.map(
              (copy) =>
                copy.accessionNumber
            ),
        });
      }

      /* ---------------------------------------------
         CREATE ALL COPIES
      --------------------------------------------- */

      const copies =
        await prisma.$transaction(
          accessionNumbers.map(
            (accessionNumber) =>
              prisma.bookCopy.create({
                data: {
                  bookId:
                    numericBookId,

                  accessionNumber,

                  shelfLocation:
                    shelfLocation?.trim() ||
                    null,

                  status: "AVAILABLE",
                },
              })
          )
        );

      res.status(201).json({
        message: `${copies.length} book ${
          copies.length === 1
            ? "copy"
            : "copies"
        } added successfully`,

        copies,
      });
    } catch (error) {
      console.error(
        "CREATE BOOK COPIES ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create book copies",
      });
    }
  }
);

/* =========================================================
   UPDATE BOOK COPY
========================================================= */

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (req, res) => {
    try {
      const id = Number(
        req.params.id
      );

      const {
        accessionNumber,
        shelfLocation,
        status,
      } = req.body;

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message:
            "Invalid book copy ID",
        });
      }

      const existingCopy =
        await prisma.bookCopy.findUnique({
          where: { id },
        });

      if (!existingCopy) {
        return res.status(404).json({
          message:
            "Book copy not found",
        });
      }

      /* ---------------------------------------------
         CHECK DUPLICATE ACCESSION
      --------------------------------------------- */

      if (
        accessionNumber &&
        accessionNumber.trim() !==
          existingCopy.accessionNumber
      ) {
        const duplicate =
          await prisma.bookCopy.findUnique({
            where: {
              accessionNumber:
                accessionNumber.trim(),
            },
          });

        if (duplicate) {
          return res.status(409).json({
            message:
              "Accession number already exists",
          });
        }
      }

      /* ---------------------------------------------
         VALIDATE STATUS
      --------------------------------------------- */

      const validStatuses = [
        "AVAILABLE",
        "BORROWED",
        "LOST",
        "DAMAGED",
      ];

      if (
        status &&
        !validStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid book copy status",
        });
      }

      /* ---------------------------------------------
         UPDATE
      --------------------------------------------- */

      const updatedCopy =
        await prisma.bookCopy.update({
          where: { id },

          data: {
            accessionNumber:
              accessionNumber?.trim() ||
              existingCopy.accessionNumber,

            shelfLocation:
              shelfLocation?.trim() ||
              null,

            status:
              status ||
              existingCopy.status,
          },
        });

      res.json({
        message:
          "Book copy updated successfully",

        copy: updatedCopy,
      });
    } catch (error) {
      console.error(
        "UPDATE BOOK COPY ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update book copy",
      });
    }
  }
);

/* =========================================================
   DELETE BOOK COPY
========================================================= */

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (req, res) => {
    try {
      const id = Number(
        req.params.id
      );

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message:
            "Invalid book copy ID",
        });
      }

      const copy =
        await prisma.bookCopy.findUnique({
          where: { id },

          include: {
            borrowings: {
              where: {
                returnedAt: null,
              },
            },
          },
        });

      if (!copy) {
        return res.status(404).json({
          message:
            "Book copy not found",
        });
      }

      if (
        copy.borrowings.length > 0
      ) {
        return res.status(409).json({
          message:
            "Cannot delete a book copy that is currently borrowed",
        });
      }

      await prisma.bookCopy.delete({
        where: { id },
      });

      res.json({
        message:
          "Book copy deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE BOOK COPY ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete book copy",
      });
    }
  }
);

export default router;