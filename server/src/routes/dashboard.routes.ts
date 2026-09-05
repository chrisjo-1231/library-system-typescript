import { Router } from "express";

import prisma from "../prisma";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/librarian",
  authenticateToken,
  authorizeRoles("LIBRARIAN", "ADMIN"),
  async (_req, res) => {
    try {
      const [
        totalBooks,
        activeBorrowings,
        pendingReservations,
        totalStudents,
      ] = await Promise.all([
        prisma.book.count(),

        prisma.borrowing.count({
          where: {
            returnedAt: null,
          },
        }),

        prisma.reservation.count({
          where: {
            status: "PENDING",
          },
        }),

        prisma.user.count({
          where: {
            role: "STUDENT",
          },
        }),
      ]);

      res.json({
        totalBooks,
        activeBorrowings,
        pendingReservations,
        totalStudents,
      });
    } catch (error) {
      console.error(
        "LIBRARIAN DASHBOARD ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load dashboard statistics",
      });
    }
  }
);

export default router;