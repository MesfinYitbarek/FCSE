import express from "express";
import {
  createReport,
  deleteReport,
  getAllReports,
  getReportById,
  getReportsByInstructor,
  updateReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Create and get all reports
router.route("/").post(createReport).get(getAllReports);

// Get reports for a specific instructor
router.get("/instructor/:instructorId", getReportsByInstructor);

// Get, update and delete specific report
router
  .route("/:id")
  .get(getReportById)
  .patch(updateReport)
  .delete(deleteReport);

export default router;
