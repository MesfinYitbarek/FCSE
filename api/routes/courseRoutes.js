import express from "express";
import { createCourse, getCourses, getCourseByChair, updateCourse, deleteCourse } from "../controllers/courseController.js";
const router = express.Router();

// Course Routes
router.post("/", createCourse); // Add a new course
router.get("/", getCourses); // Get all courses
router.get("/:chair", getCourseByChair); // Get courses by chair
router.put("/:id", updateCourse); // Update course details
router.delete("/:id", deleteCourse); // Delete a course

export default router;
