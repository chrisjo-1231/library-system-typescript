import { Router } from "express";
import prisma from "../prisma";
import {
  authenticateToken,
  AuthRequest,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

// GET MY BORROWINGS
router.get(
  "/my",
  authenticateToken,
  authorizeRoles("STUDENT"),
  async (req: AuthRequest, res) => {
    try {
      const borrowings = await prisma.borrowing.findMany({
        where: {
          userId: req.user!.userId,
        },
        include: {
          bookCopy: {
            include: {
              book: {
                include: {
                  author: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          borrowedAt: "desc",
        },
      });

      res.json(borrowings);
    } catch (error) {
      console.error("GET MY BORROWINGS ERROR:", error);

      res.status(500).json({
        message: "Failed to fetch borrowings",
      });
    }
  }
);

// GET ALL BORROWINGS
router.get(
  "/",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (_req, res) => {
    try {
      const borrowings = await prisma.borrowing.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          bookCopy: {
            include: {
              book: {
                include: {
                  author: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          borrowedAt: "desc",
        },
      });

      res.json(borrowings);
    } catch (error) {
      console.error("GET BORROWINGS ERROR:", error);

      res.status(500).json({
        message: "Failed to fetch borrowings",
      });
    }
  }
);

// BORROW BOOK
router.post(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  async (req: AuthRequest, res) => {
    try {
      const { bookCopyId, dueDate } = req.body;

      if (!bookCopyId || !dueDate) {
        return res.status(400).json({
          message: "Book copy and due date are required",
        });
      }

      const copy = await prisma.bookCopy.findUnique({
        where: {
          id: Number(bookCopyId),
        },
        include: {
          book: true,
        },
      });

      if (!copy) {
        return res.status(404).json({
          message: "Book copy not found",
        });
      }

      if (copy.status !== "AVAILABLE") {
        return res.status(409).json({
          message: "Book copy is not available",
        });
      }

      const due = new Date(dueDate);

      if (isNaN(due.getTime())) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }

      const borrowing = await prisma.$transaction(async (tx) => {
        const newBorrowing = await tx.borrowing.create({
          data: {
            userId: req.user!.userId,
            bookCopyId: Number(bookCopyId),
            dueDate: due,
          },
          include: {
            bookCopy: {
              include: {
                book: true,
              },
            },
          },
        });

        await tx.bookCopy.update({
          where: {
            id: Number(bookCopyId),
          },
          data: {
            status: "BORROWED",
          },
        });

        return newBorrowing;
      });

      res.status(201).json({
        message: "Book borrowed successfully",
        borrowing,
      });
    } catch (error) {
      console.error("BORROW BOOK ERROR:", error);

      res.status(500).json({
        message: "Failed to borrow book",
      });
    }
  }
);

// RETURN BOOK
router.put(
  "/:id/return",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const borrowing = await prisma.borrowing.findUnique({
        where: { id },
      });

      if (!borrowing) {
        return res.status(404).json({
          message: "Borrowing record not found",
        });
      }

      if (borrowing.returnedAt) {
        return res.status(409).json({
          message: "Book has already been returned",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedBorrowing = await tx.borrowing.update({
          where: { id },
          data: {
            returnedAt: new Date(),
          },
        });

        await tx.bookCopy.update({
          where: {
            id: borrowing.bookCopyId,
          },
          data: {
            status: "AVAILABLE",
          },
        });

        return updatedBorrowing;
      });

      res.json({
        message: "Book returned successfully",
        borrowing: result,
      });
    } catch (error) {
      console.error("RETURN BOOK ERROR:", error);

      res.status(500).json({
        message: "Failed to return book",
      });
    }
  }
);

export default router;