import express from "express";
import { 
  createAnnouncement, 
  getAnnouncements, 
  updateAnnouncement, 
  deleteAnnouncement, 
  getAnnouncementsForPublisher,
  markAnnouncementAsRead,
  getAnnouncementReadStats
} from "../controllers/announcementController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), createAnnouncement);
router.get("/", authenticate, getAnnouncements);
router.get("/publisher", authenticate, getAnnouncementsForPublisher);
router.put("/:id", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), updateAnnouncement);
router.delete("/:id", authenticate, authorize(["HeadOfFaculty","ChairHead", "COC"]), deleteAnnouncement);

//routes for mark as read functionality and read statistics
router.post("/:id/read", authenticate, markAnnouncementAsRead);
router.get("/:id/stats", authenticate, authorize(["ChairHead", "HeadOfFaculty", "COC"]), getAnnouncementReadStats);

export default router;