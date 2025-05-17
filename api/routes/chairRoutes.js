import express from "express";
import { createChair, getChairs, updateChair, deleteChair, getChairStatistics } from "../controllers/chairController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticate, authorize(["HeadOfFaculty"]), createChair);
router.get("/", authenticate,authorize(["HeadOfFaculty","COC", "ChairHead"]), getChairs);
router.get("/statics", authenticate, authorize(["HeadOfFaculty"]), getChairStatistics);
router.put("/:id", authenticate, authorize(["HeadOfFaculty"]), updateChair);
router.delete("/:id", authenticate, authorize(["HeadOfFaculty"]), deleteChair);

export default router;
