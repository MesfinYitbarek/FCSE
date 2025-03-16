
import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import Report from "../models/Report.js";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { year, semester, program, note } = req.body;
    
    // Build query to find matching assignments
    const query = { year };
    if (semester) query.semester = semester;
    if (program) query.program = program;
    
    // Find all assignments matching the criteria
    const assignments = await Assignment.find(query);
    
    if (assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found for the specified criteria" });
    }
    
    // Create new report
    const report = new Report({
      year,
      semester,
      program,
      note,
      assignments: assignments.map(assignment => assignment._id),
      generatedBy: "COC" ,
    });
    
    await report.save();
    
    res.status(201).json({ 
      message: "Report created successfully", 
      reportId: report._id,
      assignmentCount: assignments.length
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating report", error: error.message });
  }
};

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });
      
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

// Get a specific report with detailed assignments
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate({
        path: "assignments",
        populate: [
          { path: "assignments.instructorId",
            select: "fullName email chair",
            model: "User", },
          { path: "assignments.courseId",
            select: "name code",
            model: "Course", }
        ]
      })
      .populate("generatedBy", "name email");
      
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report", error: error.message });
  }
};

// Get reports by instructor (for individual instructors)
export const getReportsByInstructor = async (req, res) => {
  try {
    const instructorId = req.params.instructorId;

    // Find reports that include assignments for this instructor
    const reports = await Report.find({
      assignments: { 
        $in: await Assignment.find({
          "assignments.instructorId": new mongoose.Types.ObjectId(instructorId)
        }).distinct('_id')
      }
    })
    .populate("generatedBy", "name email")
    .populate({
      path: "assignments",
      populate: {
        path: "assignments.instructorId",
        select: "fullName email chair",
        model: "User", 
      },
      populate: {
        path: "assignments.courseId",
        select: "name code chair",
        model: "Course", 
      },
    });
    

    if (reports.length === 0) {
      return res.status(404).json({ message: "No reports found for this instructor" });
    }

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructor reports", error: error.message });
  }
};

// Update report (only the note)
export const updateReport = async (req, res) => {
  try {
    const { note } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { note },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    res.status(200).json({ message: "Report updated successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Error updating report", error: error.message });
  }
};

// Delete report
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error: error.message });
  }
};