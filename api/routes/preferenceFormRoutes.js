import express from "express";
import { createPreferenceForm, updatePreferenceForm, getActivePreferenceForm, getChairPreferenceForm, getFilteredPreferenceForms, deletePreferenceForm } from "../controllers/preferenceFormController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Chair Head creates a new preference form
router.post("/", authenticate, authorize(["ChairHead"]), createPreferenceForm);

// Chair Head updates an existing preference form
router.put("/:formId", authenticate, authorize(["ChairHead"]), updatePreferenceForm);

router.delete("/:id", authenticate,authorize(["ChairHead"]), deletePreferenceForm)
// Get the active preference form (for instructors)
router.get("/active", authenticate, getActivePreferenceForm);

// Get the preference form of a specific chair head

router.get("/chair/:chair", authenticate, authorize(["ChairHead"]), getChairPreferenceForm);
router.get('/filter', getFilteredPreferenceForms);

export default router;
