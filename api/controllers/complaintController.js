import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Submit a complaint
export const submitComplaint = async (req, res) => {
  try {
    const { instructorId, year, semester, program, reason } = req.body;
    
    const newComplaint = new Complaint({
      instructorId,
      year,
      semester,
      program,
      reason,
      submittedAt: new Date()
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

// Get all complaints (for admin)
export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate({
        path: "instructorId",
        select: "fullName email chair",
        model: "User",
      })
      .populate({
        path: "resolvedBy",
        select: "fullName email",
        model: "User",
      })
      .sort({ submittedAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints", error });
  }
};

// Resolve a complaint
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy, status, resolveNote } = req.body;

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

// Delete a complaint
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    // Check if complaint exists
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Delete the complaint
    await Complaint.findByIdAndDelete(id);

    res.status(200).json({ 
      message: "Complaint deleted successfully",
      deletedComplaintId: id 
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ message: "Error deleting complaint", error });
  }
};

// Search complaints with filters
export const searchComplaints = async (req, res) => {
  try {
    const { year, semester, program, status, chair, instructorId } = req.query;
    
    if (!year || !semester) {
      return res.status(400).json({ 
        message: "Year and semester are required filter parameters" 
      });
    }
    
    // Build the query
    let query = {
      year: parseInt(year),
      semester: semester
    };
    
    if (program) {
      query.program = program;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (instructorId) {
      query.instructorId = instructorId;
    }
    
    // If chair is provided, need to find instructors from that chair first
    if (chair) {
      const instructorsInChair = await User.find({ chair: chair })
        .select('_id')
        .lean();
      
      const instructorIds = instructorsInChair.map(user => user._id);
      query.instructorId = { $in: instructorIds };
    }
    
    // Execute the final query with population
    const complaints = await Complaint.find(query)
      .populate({
        path: "instructorId",
        select: "fullName email chair",
        model: "User",
      })
      .populate({
        path: "resolvedBy",
        select: "fullName email role chair",
        model: "User",
      })
      .sort({ submittedAt: -1 });  // Most recent first
    
    res.json(complaints);
  } catch (error) {
    console.error("Error searching complaints:", error);
    res.status(500).json({ message: "Error searching complaints", error: error.message });
  }
};

// Get available filter options
export const getFilterOptions = async (req, res) => {
  try {
    // Get unique years, semesters, and programs from Complaint model
    const years = await Complaint
      .distinct("year")
      .sort((a, b) => b - a);  // Sort descending
      
    const semesters = await Complaint
      .distinct("semester");
      
    const programs = await Complaint
      .distinct("program");
    
    res.json({
      years,
      semesters,
      programs
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ message: "Error fetching filter options", error: error.message });
  }
};

// Fetch complaints submitted by a specific instructor
export const getInstructorComplaints = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // Check if instructorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Invalid instructorId format" });
    }

    // Fetch complaints
    const complaints = await Complaint.find({ instructorId })
      .populate({
        path: "instructorId",
        select: "fullName email chair",
        model: "User",
      })
      .populate({
        path: "resolvedBy",
        select: "fullName email role chair",
        model: "User",
      })
      .sort({ submittedAt: -1 });

    // Check if complaints exist
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ message: "No complaints found for this instructor" });
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error.message || error);
    res.status(500).json({ message: "Internal Server Error", error: error.message || error });
  }
};

export const getInstructorComplaintStats = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Invalid instructor ID format" });
    }

    const stats = await Complaint.aggregate([
      {
        $match: { instructorId: new mongoose.Types.ObjectId(instructorId) }
      },
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
          groupedBySemester: {
            $push: {
              year: "$year",
              semester: "$semester",
              program: "$program"
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({ message: "No complaints found for this instructor", data: {} });
    }

    const groupedBySemester = stats[0].groupedBySemester.reduce((acc, item) => {
      const key = `${item.year}-${item.semester}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      totalComplaints: stats[0].totalComplaints,
      pending: stats[0].pending,
      resolved: stats[0].resolved,
      rejected: stats[0].rejected,
      groupedBySemester
    });
  } catch (error) {
    console.error("Error fetching instructor complaint stats:", error);
    res.status(500).json({ message: "Error fetching instructor complaint stats", error });
  }
};

// Complaint statistics
export const getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "instructorId",
          foreignField: "_id",
          as: "instructor"
        }
      },
      {
        $unwind: "$instructor"
      },
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
          byYear: {
            $push: {
              year: "$year",
              semester: "$semester",
              program: "$program",
              complaintId: "$_id"
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({ message: "No complaints found", data: {} });
    }

    // Structure `byYear` for easier consumption
    const groupedByYearSemester = stats[0].byYear.reduce((acc, item) => {
      const key = `${item.year}-${item.semester}`;
      if (!acc[key]) acc[key] = { total: 0, programMap: {} };
      acc[key].total += 1;
      if (!acc[key].programMap[item.program]) {
        acc[key].programMap[item.program] = 1;
      } else {
        acc[key].programMap[item.program]++;
      }
      return acc;
    }, {});

    res.status(200).json({
      totalComplaints: stats[0].totalComplaints,
      pending: stats[0].pending,
      resolved: stats[0].resolved,
      rejected: stats[0].rejected,
      groupedByYearSemester
    });
  } catch (error) {
    console.error("Error getting complaint statistics:", error);
    res.status(500).json({ message: "Error getting complaint statistics", error });
  }
};