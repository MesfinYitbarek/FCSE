
import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import Report from "../models/Report.js";
import Instructor from "../models/Instructor.js"
// Create a new report
// Create a new report
export const createReport = async (req, res) => {
  try {
    const { year, semester, program, note } = req.body;

    // Build query to find matching assignments
    const query = { year };
    if (semester) query.semester = semester;
    if (program) query.program = program;

    // Find all assignments matching the criteria
    const assignments = await Assignment.find(query).populate('assignments.courseId');

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
      generatedBy: "COC",
    });

    await report.save();

    // Update instructors' assignedCourses for this report's criteria
    const instructorUpdates = [];
    
    // Get all unique instructor IDs from all assignments
    const instructorIds = new Set();
    const instructorCourseMap = new Map(); // To store instructor's courses for this report

    // First, collect all course assignments for each instructor
    assignments.forEach(assignment => {
      assignment.assignments.forEach(item => {
        instructorIds.add(item.instructorId.toString());
        
        if (!instructorCourseMap.has(item.instructorId.toString())) {
          instructorCourseMap.set(item.instructorId.toString(), new Set());
        }
        
        // Add course ID to the instructor's set
        instructorCourseMap.get(item.instructorId.toString()).add(item.courseId._id.toString());
      });
    });

    // For each instructor, update their assignedCourses
    for (const [instructorId, courseIds] of instructorCourseMap) {
      const update = Instructor.findByIdAndUpdate(
        instructorId,
        {
          $addToSet: {
            assignedCourses: {
              $each: Array.from(courseIds).map(courseId => ({
                course: courseId,
                year,
                semester,
                program
              }))
            }
          }
        }
      );
      instructorUpdates.push(update);
    }

    // Wait for all instructor updates to complete
    await Promise.all(instructorUpdates);

    res.status(201).json({ 
      message: "Report created successfully", 
      reportId: report._id,
      assignmentCount: assignments.length,
      instructorCount: instructorIds.size
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating report", error: error.message });
  }
};

// Get all reports
// Updated getAllReports to filter by year, semester, and program
export const getAllReports = async (req, res) => {
  try {
    const { year, semester, program } = req.query;
    
    // Build filter object based on provided query parameters
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = semester;
    if (program) filter.program = program;
    
    const reports = await Report.find(filter)
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

// Get reports by instructor (for individual instructors) with filtering
export const getReportsByInstructor = async (req, res) => {
  try {
    const instructorId = req.params.instructorId;
    const { year, semester, program } = req.query; // Get filter parameters from query
    
    // Base query to find assignments for this instructor
    let assignmentsQuery = {
      "assignments.instructorId": new mongoose.Types.ObjectId(instructorId)
    };
    
    // Add filters if they are provided
    if (year) assignmentsQuery.year = parseInt(year);
    if (semester) assignmentsQuery.semester = semester;
    if (program) assignmentsQuery.program = program;
    
    // Get the IDs of assignments matching our criteria
    const assignmentIds = await Assignment.find(assignmentsQuery).distinct('_id');
    
    // Find reports that include these filtered assignments
    const reports = await Report.find({
      assignments: { $in: assignmentIds }
    })
    .populate("generatedBy", "name email")
    .populate({
      path: "assignments",
      populate: [
        {
          path: "assignments.instructorId",
          select: "fullName email chair",
          model: "User",
        },
        {
          path: "assignments.courseId",
          select: "name code chair",
          model: "Course", 
        }
      ]
    });
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        message: "No reports found for this instructor with the provided filters" 
      });
    }

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching instructor reports", 
      error: error.message 
    });
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