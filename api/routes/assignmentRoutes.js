// assignmentRoutes.js
import express from "express";
import { 
  manualAssignment, 
  autoAssignExtensionCourses, 
  autoAssignSummerCourses, 
  updateAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignmentById,
  getAutomaticAssignments,
  runAutomaticAssignment,
  commonManualAssignment,
  autoAssignCommonCourses
} from "../controllers/assignmentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Assignment management routes
router.get("/", authenticate, getAllAssignments);
router.get("/automatic", getAutomaticAssignments);
router.post("/automatic", runAutomaticAssignment);
router.get("/get/:id", authenticate, getAssignmentById);
router.put("/sub/:parentId/:subId", authenticate, authorize(["ChairHead", "COC"]), updateAssignment);
router.delete("/sub/:parentId/:subId", authenticate, authorize(["ChairHead", "COC"]), deleteAssignment);


// ✅ Manual assignment by Chair Head or COC
router.post("/manual", authenticate, authorize(["ChairHead", "COC"]), manualAssignment);
router.post("/common/manual", authenticate, authorize(["ChairHead", "COC"]), commonManualAssignment);

// ✅ Automatic assignment routes
router.post("/auto/common", authenticate, authorize(["COC"]), autoAssignCommonCourses);
router.post("/auto/extension", authenticate, authorize(["COC"]), autoAssignExtensionCourses);
router.post("/auto/summer", authenticate, authorize(["COC"]), autoAssignSummerCourses);



export default router;
