import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// GET all categories
router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
});

// GET category by ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch category",
    });
  }
});

// POST create category
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        name: name.trim(),
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    res.status(500).json({
      message: "Failed to create category",
    });
  }
});

// PUT update category
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    res.json(category);
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    res.status(500).json({
      message: "Failed to update category",
    });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const books = await prisma.book.count({
      where: {
        categoryId: id,
      },
    });

    if (books > 0) {
      return res.status(409).json({
        message: "Cannot delete category because it has books",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    res.status(500).json({
      message: "Failed to delete category",
    });
  }
});

export default router;