import express from "express";
import { submitPreferences, getInstructorPreferences, getPreferencesByParams } from "../controllers/preferenceController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Instructors submit preferences
router.post("/", authenticate, authorize(["Instructor"]), submitPreferences);
// Route to fetch preferences by year, semester, and chair
router.get('/search-preferences', getPreferencesByParams);
// Instructors view their submitted preferences
router.get("/:instructorId", authenticate, getInstructorPreferences);

export default router;
