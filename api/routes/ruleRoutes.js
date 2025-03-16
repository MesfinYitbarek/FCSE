import express from "express";
import { createRule, getRules } from "../controllers/ruleController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rule Routes (Only Faculty Heads can manage rules)
router.post("/", authenticate, authorize(["HeadOfFaculty"]), createRule);
router.get("/", authenticate, getRules);

export default router;
