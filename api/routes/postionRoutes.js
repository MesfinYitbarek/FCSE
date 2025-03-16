import express from "express";
import { createPosition, getPositions, updatePosition } from "../controllers/positionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Position Routes (Only Faculty Heads can manage positions)
router.post("/", authenticate, authorize(["HeadOfFaculty"]), createPosition);
router.get("/", authenticate, getPositions);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updatePosition);

export default router;
