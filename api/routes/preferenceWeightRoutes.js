import express from "express";
import { 
  createPreferenceWeight, 
  deletePreferenceWeight, 
  getPreferenceWeights, 
  updatePreferenceWeight 
} from "../controllers/preferenceWeightController.js";
import { 
  createCourseExperienceWeight, 
  getCourseExperienceWeights, 
  updateCourseExperienceWeight 
} from "../controllers/courseExperienceWeightController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Preference Weight Routes
router.post("/", authenticate, authorize(["HeadOfFaculty"]), createPreferenceWeight);
router.get("/", authenticate, getPreferenceWeights);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updatePreferenceWeight); // Update preference weight
router.delete("/:id", authenticate, deletePreferenceWeight)
// Course Experience Weight Routes
router.post("/", authenticate, authorize(["HeadOfFaculty"]), createCourseExperienceWeight);
router.get("/", authenticate, getCourseExperienceWeights);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updateCourseExperienceWeight); // Update course experience weight

export default router;
