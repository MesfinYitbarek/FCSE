import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import mongoose from "mongoose";
// Submit a complaint
export const submitComplaint = async (req, res) => {
  try {
    const { instructorId, assignmentId, reason } = req.body;
    const newComplaint = new Complaint({
      instructorId,
      assignmentId,
      reason,
      submittedAt: new Date() // Capture the submission date explicitly
    });

    await newComplaint.save();
    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting complaint", error });
  }
};

// Get all complaints
export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate({
      path: "instructorId",
      select: "fullName email chair",
      model: "User", // ✅ Ensure correct reference
    })
    .populate({
      path: "assignmentId",
      populate: {
        path: "assignments.courseId",
        select: "name code",
      },
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints", error });
  }
};

// Resolve a complaint
// Resolve a complaint
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy, status, resolveNote } = req.body; // Include note and status

    if (!["Resolved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'Resolved' or 'Rejected'." });
    }

    // Check if complaint exists
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Ensure only pending complaints can be processed
    if (complaint.status !== "Pending") {
      return res.status(400).json({ message: "Complaint is already resolved or rejected" });
    }

    // Check if resolver (User) exists
    const resolver = await User.findById(resolvedBy);
    if (!resolver) {
      return res.status(404).json({ message: "Resolver not found" });
    }

    // Update the complaint details
    complaint.status = status;
    complaint.resolvedBy = resolvedBy;
    complaint.resolveNote = resolveNote;
    complaint.resolvedAt = new Date();

    await complaint.save();

    res.json({
      message: `Complaint ${status.toLowerCase()} successfully`,
      complaint,
    });
  } catch (error) {
    console.error("Error resolving complaint:", error);
    res.status(500).json({ message: "Error resolving complaint", error });
  }
};



// Fetch complaints submitted by a specific instructor
export const getInstructorComplaints = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // ✅ Check if instructorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Invalid instructorId format" });
    }

    // ✅ Fetch complaints
    const complaints = await Complaint.find({ instructorId })
      .populate({
        path: "instructorId",
        select: "fullName email chair",
        model: "User", // ✅ Ensure correct reference
      })
      .populate({
        path: "assignmentId",
        populate: {
          path: "assignments.courseId",
          select: "name code",
        },
      });

    // ✅ Check if complaints exist
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ message: "No complaints found for this instructor" });
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error.message || error);
    res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
};
