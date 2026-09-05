import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// GET all authors
router.get("/", async (_req, res) => {
  try {
    const authors = await prisma.author.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(authors);
  } catch (error) {
    console.error("GET AUTHORS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch authors",
    });
  }
});

// GET author by ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const author = await prisma.author.findUnique({
      where: { id },
    });

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.json(author);
  } catch (error) {
    console.error("GET AUTHOR ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch author",
    });
  }
});
// POST create author
router.post("/", async (req, res) => {
  try {
    const { name, biography } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Author name is required",
      });
    }

    const cleanName = name.trim();

    // Check existing author
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const existingAuthor = authors.find(
      (author) =>
        author.name.trim().toLowerCase() ===
        cleanName.toLowerCase()
    );

    // If already exists
    if (existingAuthor) {
      return res.status(200).json(
        existingAuthor
      );
    }

    // Create new author
    const author =
      await prisma.author.create({
        data: {
          name: cleanName,
          biography:
            biography?.trim() || null,
        },
      });

    res.status(201).json(author);
  } catch (error) {
    console.error(
      "CREATE AUTHOR ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create author",
    });
  }
});
// PUT update author
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, biography } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Author name is required",
      });
    }

    const existingAuthor = await prisma.author.findUnique({
      where: { id },
    });

    if (!existingAuthor) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    const author = await prisma.author.update({
      where: { id },
      data: {
        name: name.trim(),
        biography: biography?.trim() || null,
      },
    });

    res.json(author);
  } catch (error) {
    console.error("UPDATE AUTHOR ERROR:", error);

    res.status(500).json({
      message: "Failed to update author",
    });
  }
});

// DELETE author
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingAuthor = await prisma.author.findUnique({
      where: { id },
    });

    if (!existingAuthor) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    const author = await prisma.author.delete({
      where: { id },
    });

    res.json({
      message: "Author deleted successfully",
      author,
    });
  } catch (error) {
    console.error("DELETE AUTHOR ERROR:", error);

    res.status(500).json({
      message: "Failed to delete author",
    });
  }
});

export default router;