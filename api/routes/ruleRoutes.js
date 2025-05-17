import express from "express";
import { createRule, getRules, updateRule, deleteRule } from "../controllers/ruleController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["HeadOfFaculty"]), createRule);
router.get("/", authenticate, getRules);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updateRule);
router.delete("/:id", authenticate, authorize(["HeadOfFaculty"]), deleteRule);

export default router;