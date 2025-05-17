import express from "express";
import { check } from 'express-validator';
import { signup, login, getUsers, updateUser,getUserByChair, getUserByRole, deleteUser, changePassword, getUserStatistics } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

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
router.get("/users/:chair", getUserByChair); 
router.get("/role/:role", getUserByRole);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
