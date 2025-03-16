import express from "express";
import { createInstructor, deleteInstructor, getInstructorByUserId, getInstructors, getInstructorsByChair, updateInstructor } from "../controllers/instructorController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Instructor Routes
router.post("/", authenticate, authorize(["HeadOfFaculty", "ChairHead"]), createInstructor);
router.get("/chair/:chair", authenticate, getInstructorsByChair);
router.get("/instructors", authenticate, getInstructors);
router.get("/user/:userId", authenticate, getInstructorByUserId);
router.put("/:id", authenticate, authorize(["HeadOfFaculty", "ChairHead"]), updateInstructor);

router.delete("/:id", authenticate, authorize(["HeadOfFaculty", "ChairHead"]), deleteInstructor);
export default router;
