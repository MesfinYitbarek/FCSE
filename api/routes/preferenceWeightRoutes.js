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

router.post("/", authenticate, authorize(["HeadOfFaculty"]), createPreferenceWeight);
router.get("/", authenticate, getPreferenceWeights);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updatePreferenceWeight); 
router.delete("/:id", authenticate, deletePreferenceWeight)


export default router;
