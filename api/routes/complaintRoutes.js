import express from "express";
import { submitComplaint, getComplaints,getInstructorComplaints, resolveComplaint } from "../controllers/complaintController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Complaint Routes
router.post("/", authenticate, submitComplaint);
router.get("/", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), getComplaints);
router.put("/:id", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), resolveComplaint);
// Route to fetch instructor complaints
router.get("/:instructorId", authorize(["Instructor",]),getInstructorComplaints);

export default router;
