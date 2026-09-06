import dotenv from "dotenv";

dotenv.config();

import express from "express";
import path from "path";
import cors from "cors";
import prisma from "./prisma";
import authRoutes from "./routes/auth.routes";
import authorRoutes from "./routes/author.routes";
import categoryRoutes from "./routes/category.routes";
import bookRoutes from "./routes/book.routes";
import bookCopyRoutes from "./routes/bookcopy.routes";
import borrowingRoutes from "./routes/borrowing.routes";
import reservationRoutes from "./routes/reservation.routes";
import DashboardRoutes from "./routes/dashboard.routes";
import UesrRoutes from "./routes/user.routes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);


app.use("/api/auth", authRoutes);
app.use("/api/user", UesrRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/book-copies", bookCopyRoutes);
app.use("/api/borrowings", borrowingRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/dashboard", DashboardRoutes);
console.log("PRISMA USER:", prisma.user);

app.get("/", (_req, res) => {
  res.json({
    message: "Library OPAC API is running",
  });
});

app.get("/api/test", (_req, res) => {
  res.json({
    message: "React is successfully connected to the Library OPAC API!",
  });
});

app.get("/api/db-test", async (_req, res) => {
  try {
    const users = await prisma.user.count();

    res.json({
      message: "Database connection successful!",
      userCount: users,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      message: "Database connection failed",
      error: String(error),
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});