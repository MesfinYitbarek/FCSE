
import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import Report from "../models/Report.js";
import Instructor from "../models/Instructor.js"

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { year, semester, program, note } = req.body;

    // Check for existing report with the same criteria
    const existingReport = await Report.findOne({ year, semester, program });
    if (existingReport) {
      return res.status(409).json({
        message: "A report already exists for the specified year, semester, and program",
      });
    }

    // Build query to find matching assignments
    const query = { year };
    if (semester) query.semester = semester;
    if (program) query.program = program;

    const assignments = await Assignment.find(query).populate("assignments.courseId");

    if (!assignments.length) {
      return res.status(404).json({ message: "No assignments found for the specified criteria" });
    }

    // Create new report
    const report = new Report({
      year,
      semester,
      program,
      note,
      assignments: assignments.map(a => a._id),
      generatedBy: "COC",
    });

    await report.save();

    // Update instructors' assignedCourses
    for (const assignment of assignments) {
      for (const item of assignment.assignments) {
        const instructor = await Instructor.findOne({userId: item.instructorId});
        if (!instructor) continue;

        const alreadyAssigned = instructor.assignedCourses.some(course =>
          course.course.toString() === item.courseId._id.toString() &&
          course.year === year &&
          course.semester === semester &&
          course.program === program
        );

        if (!alreadyAssigned) {
          instructor.assignedCourses.push({
            course: item.courseId._id,
            year,
            semester,
            program,
          });
          await instructor.save();
        }
      }
    }

    res.status(201).json({
      message: "Report created successfully",
      reportId: report._id,
      assignmentCount: assignments.length,
    });

  } catch (error) {
    console.error("Error creating report:", error);
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
    const report = await Report.findById(req.params.id).populate({
      path: "assignments",
      populate: {
        path: "assignments.courseId",
      },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const { year, semester, program } = report;

    // Remove assigned courses from instructors
    for (const assignment of report.assignments) {
      for (const item of assignment.assignments) {
        const instructor = await Instructor.findOne({ userId: item.instructorId });
        if (!instructor) continue;

        // Filter out the assignedCourse that matches this report's info
        instructor.assignedCourses = instructor.assignedCourses.filter(course =>
          !(
            course.course.toString() === item.courseId._id.toString() &&
            course.year === year &&
            course.semester === semester &&
            course.program === program
          )
        );

        await instructor.save();
      }
    }

    // Delete the report
    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Report and associated instructor data deleted successfully" });

  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Error deleting report", error: error.message });
  }
};
