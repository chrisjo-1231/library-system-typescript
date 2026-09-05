import { Router } from "express";

import prisma from "../prisma";

import {
  authenticateToken,
  AuthRequest,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

/* =========================
   GET MY RESERVATIONS
========================= */

router.get(
  "/my",
  authenticateToken,
  authorizeRoles("STUDENT"),
  async (req: AuthRequest, res) => {
    try {
      const reservations =
        await prisma.reservation.findMany({
          where: {
            userId: req.user!.userId,
          },
          include: {
            book: {
              include: {
                author: true,
                category: true,
                copies: true,
              },
            },
          },
          orderBy: {
            reservedAt: "desc",
          },
        });

      res.json(reservations);
    } catch (error) {
      console.error(
        "GET MY RESERVATIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch reservations",
      });
    }
  }
);

/* =========================
   GET ALL RESERVATIONS
========================= */

router.get(
  "/",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (_req, res) => {
    try {
      const reservations =
        await prisma.reservation.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            book: {
              include: {
                author: true,
                category: true,
              },
            },
          },
          orderBy: {
            reservedAt: "asc",
          },
        });

      res.json(reservations);
    } catch (error) {
      console.error(
        "GET RESERVATIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch reservations",
      });
    }
  }
);

/* =========================
   CREATE RESERVATION
========================= */

router.post(
  "/",
  authenticateToken,
  authorizeRoles("STUDENT"),
  async (req: AuthRequest, res) => {
    try {
      const { bookId } = req.body;

      /* =========================
         VALIDATE
      ========================= */

      if (!bookId) {
        return res.status(400).json({
          message: "Book is required",
        });
      }

      const numericBookId =
        Number(bookId);

      if (isNaN(numericBookId)) {
        return res.status(400).json({
          message: "Invalid book ID",
        });
      }

      /* =========================
         FIND BOOK
      ========================= */

      const book =
        await prisma.book.findUnique({
          where: {
            id: numericBookId,
          },
          include: {
            copies: true,
          },
        });

      if (!book) {
        return res.status(404).json({
          message: "Book not found",
        });
      }

      /* =========================
         CHECK AVAILABILITY
      ========================= */

      const isAvailable =
        book.copies.some(
          (copy) =>
            copy.status === "AVAILABLE"
        );

      if (isAvailable) {
        return res.status(409).json({
          message:
            "This book is currently available. You do not need to reserve it.",
        });
      }

      /* =========================
         FIND EXISTING RESERVATION
      ========================= */

      const existingReservation =
        await prisma.reservation.findUnique({
          where: {
            userId_bookId: {
              userId:
                req.user!.userId,
              bookId:
                numericBookId,
            },
          },
        });

      /* =========================
         ALREADY PENDING
      ========================= */

      if (
        existingReservation?.status ===
        "PENDING"
      ) {
        return res.status(409).json({
          message:
            "You already have a pending reservation",
        });
      }

      /* =========================
         REACTIVATE OLD RESERVATION
         
         Handles:
         CANCELLED
         FULFILLED
      ========================= */

      if (
        existingReservation &&
        (
          existingReservation.status ===
            "CANCELLED" ||
          existingReservation.status ===
            "FULFILLED"
        )
      ) {
        const reservation =
          await prisma.reservation.update({
            where: {
              id:
                existingReservation.id,
            },

            data: {
              status: "PENDING",
              reservedAt: new Date(),
            },

            include: {
              book: {
                include: {
                  author: true,
                  category: true,
                },
              },
            },
          });

        return res.status(200).json({
          message:
            "Book reserved successfully",
          reservation,
        });
      }

      /* =========================
         CREATE NEW RESERVATION
      ========================= */

      const reservation =
        await prisma.reservation.create({
          data: {
            userId:
              req.user!.userId,

            bookId:
              numericBookId,

            status: "PENDING",
          },

          include: {
            book: {
              include: {
                author: true,
                category: true,
              },
            },
          },
        });

      return res.status(201).json({
        message:
          "Book reserved successfully",
        reservation,
      });
    } catch (error: any) {
      console.error(
        "CREATE RESERVATION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create reservation",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* =========================
   CANCEL RESERVATION
========================= */

router.put(
  "/:id/cancel",
  authenticateToken,
  authorizeRoles("STUDENT"),
  async (req: AuthRequest, res) => {
    try {
      const id =
        Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message:
            "Invalid reservation ID",
        });
      }

      const reservation =
        await prisma.reservation.findUnique({
          where: {
            id,
          },
        });

      if (!reservation) {
        return res.status(404).json({
          message:
            "Reservation not found",
        });
      }

      if (
        reservation.userId !==
        req.user!.userId
      ) {
        return res.status(403).json({
          message:
            "You can only cancel your own reservation",
        });
      }

      if (
        reservation.status !==
        "PENDING"
      ) {
        return res.status(409).json({
          message:
            "Only pending reservations can be cancelled",
        });
      }

      const updatedReservation =
        await prisma.reservation.update({
          where: {
            id,
          },
          data: {
            status: "CANCELLED",
          },
        });

      res.json({
        message:
          "Reservation cancelled successfully",
        reservation:
          updatedReservation,
      });
    } catch (error) {
      console.error(
        "CANCEL RESERVATION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to cancel reservation",
      });
    }
  }
);

/* =========================
   FULFILL RESERVATION
========================= */

router.put(
  "/:id/fulfill",
  authenticateToken,
  authorizeRoles(
    "LIBRARIAN",
    "ADMIN"
  ),
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message:
            "Invalid reservation ID",
        });
      }

      const reservation =
        await prisma.reservation.findUnique({
          where: {
            id,
          },
        });

      if (!reservation) {
        return res.status(404).json({
          message:
            "Reservation not found",
        });
      }

      if (
        reservation.status !==
        "PENDING"
      ) {
        return res.status(409).json({
          message:
            "Only pending reservations can be fulfilled",
        });
      }

      const updatedReservation =
        await prisma.reservation.update({
          where: {
            id,
          },
          data: {
            status: "FULFILLED",
          },
        });

      res.json({
        message:
          "Reservation fulfilled successfully",
        reservation:
          updatedReservation,
      });
    } catch (error) {
      console.error(
        "FULFILL RESERVATION ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fulfill reservation",
      });
    }
  }
);

export default router;