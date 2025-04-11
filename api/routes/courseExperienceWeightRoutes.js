import express from "express";
import { 
  createPreferenceWeight, 
  getPreferenceWeights, 
  updatePreferenceWeight 
} from "../controllers/preferenceWeightController.js";
import { 
  createCourseExperienceWeight, 
  getCourseExperienceWeights, 
  updateCourseExperienceWeight, 
  deleteCourseExperienceWeight
} from "../controllers/courseExperienceWeightController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();


router.delete("/:id", authenticate, deleteCourseExperienceWeight)
router.post("/", authenticate, authorize(["HeadOfFaculty"]), createCourseExperienceWeight);
router.get("/", authenticate, getCourseExperienceWeights);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updateCourseExperienceWeight); // Update course experience weight

export default router;
