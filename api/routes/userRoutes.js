import express from "express";
import { check } from 'express-validator';
import { signup, login, getUsers, updateUser, resetPassword, confirmReset, getUserByChair, getUserByRole, deleteUser, changePassword, getUserStatistics } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Authentication Routes
router.post("/signup", signup);
router.post("/login", login);
router.post(
    '/change-password',
    [
        authenticate, // Middleware to ensure user is authenticated
      check('currentPassword', 'Current password is required').notEmpty(),
      check('newPassword', 'New password must be at least 8 characters')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .withMessage('Password must include uppercase, lowercase, number, and special character')
    ],
    changePassword
  );
router.get("/", getUsers);
router.get("/statics", getUserStatistics);
router.get("/users/:chair", getUserByChair); // Get users by chair
router.get("/role/:role", getUserByRole);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/reset-password", resetPassword);
router.post("/confirm-reset", confirmReset);


export default router;
