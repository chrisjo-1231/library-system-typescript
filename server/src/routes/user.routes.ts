import { Router } from "express";
import prisma from "../prisma";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.middleware";
import profileUpload from "../middleware/profileUpload.middleware";
const router = Router();

/*
|--------------------------------------------------------------------------
| GET /api/user/profile
|--------------------------------------------------------------------------
| Get the currently logged-in user's profile
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profileImage: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json(user);
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch profile",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| PUT /api/user/profile
|--------------------------------------------------------------------------
| Update currently logged-in user's name
|--------------------------------------------------------------------------
*/

router.put(
  "/profile",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const { name } = req.body;

      if (
        !name ||
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          message: "Name is required",
        });
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: req.user.userId,
          },
          data: {
            name: name.trim(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
            createdAt: true,
          },
        });

      return res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to update profile",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| POST /api/user/profile/avatar
|--------------------------------------------------------------------------
| Upload profile picture
|--------------------------------------------------------------------------
*/

router.post(
  "/profile/avatar",
  authenticateToken,
  profileUpload.single("profileImage"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Profile image is required",
        });
      }

      const profileImage =
        `/uploads/profiles/${req.file.filename}`;

      const updatedUser =
        await prisma.user.update({
          where: {
            id: req.user.userId,
          },
          data: {
            profileImage,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
            createdAt: true,
          },
        });

      return res.json({
        message:
          "Profile picture uploaded successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "UPLOAD PROFILE IMAGE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to upload profile picture",
      });
    }
  }
);

export default router;