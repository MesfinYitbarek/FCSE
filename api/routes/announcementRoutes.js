import express from "express";
import { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, getAnnouncementsForPublisher } from "../controllers/announcementController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Announcement Routes (Only Chair Heads and Faculty Heads can create)
router.post("/", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), createAnnouncement);
router.get("/", authenticate, getAnnouncements);
router.get("/publisher", authenticate, getAnnouncementsForPublisher);
router.put("/:id", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), updateAnnouncement);
router.delete("/:id", authenticate, authorize(["HeadOfFaculty","ChairHead", "COC"]), deleteAnnouncement);

export default router;
