import express from "express";
import { createCourse, getCourses, getCourseByChair, updateCourse, deleteCourse } from "../controllers/courseController.js";
const router = express.Router();

router.post("/", createCourse); 
router.get("/", getCourses); 
router.get("/:chair", getCourseByChair); 
router.put("/:id", updateCourse); 
router.delete("/:id", deleteCourse); 

export default router;
