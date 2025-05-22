import express from "express";
import { 
  createCourse, 
  getCourses, 
  getCourseByChair, 
  updateCourse, 
  deleteCourse,
  assignCourses,
  getAssignedCourses,
  getChairHeads,
  unassignCourses,
  bulkUpdateCourses
} from "../controllers/courseController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";


const router = express.Router();

// Original routes with auth middleware
router.post("/", authenticate, authorize(["HeadOfFaculty"]), createCourse); 
router.get("/", authenticate, getCourses); 
router.get("/:chair", authenticate, getCourseByChair); 
router.put("/:id", authenticate, updateCourse); 
router.delete("/:id", authenticate, authorize(["HeadOfFaculty"]), deleteCourse); 
router.post(
  "/bulk-update",
  authenticate,
  authorize(["ChairHead", "COC", "HeadOfFaculty"]), 
  bulkUpdateCourses
);
// New routes for course assignment workflow
router.post("/assign", authenticate, assignCourses);
router.get("/assigned/:chair", authenticate, getAssignedCourses);
router.post('/unassign', authorize(["HeadOfFaculty"]), unassignCourses);
// Chair heads endpoint (could also be in a user routes file)
router.get("/chairheads", authenticate, authorize(["HeadOfFaculty"]), getChairHeads);

export default router;