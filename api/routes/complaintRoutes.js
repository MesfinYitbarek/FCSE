import express from "express";
import { 
  submitComplaint, 
  getComplaints, 
  getInstructorComplaints, 
  resolveComplaint,
  deleteComplaint,
  searchComplaints,
  getFilterOptions
} from "../controllers/complaintController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Basic complaint routes
router.post("/", authenticate, submitComplaint);
router.get("/", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), getComplaints);

// Search and filter routes
router.get("/search", authenticate, searchComplaints);
router.get("/filter-options", authenticate, getFilterOptions);

// Instructor-specific complaints route
router.get("/instructor/:instructorId", authenticate, getInstructorComplaints);

// Complaint management routes
router.put("/:id/resolve", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), resolveComplaint);
router.delete("/:id", authenticate, authorize(["COC"]), deleteComplaint);

export default router;