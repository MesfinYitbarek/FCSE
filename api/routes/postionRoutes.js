import express from "express";
import { createPosition, getPositions, updatePosition, deletePosition } from "../controllers/positionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["HeadOfFaculty"]), createPosition);
router.get("/", authenticate, getPositions);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updatePosition);
router.delete("/:id", authenticate, authorize(["HeadOfFaculty"]), deletePosition); 
export default router;
