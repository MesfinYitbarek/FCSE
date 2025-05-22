import Course from "../models/Course.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { 
      name, 
      code, 
      department, 
      category, 
      year, 
      semester, 
      creditHour, 
      lecture, 
      lab, 
      tutorial, 
      chair, 
      likeness, 
      location,
      status
    } = req.body;
    
    // Validate required fields
    if (!name || !code || !department || !category || !year || !semester || !creditHour) {
      return res.status(400).json({ 
        message: "Missing required fields. Please provide: name, code, department, category, year, semester, and credit hour." 
      });
    }

    // Validate credit hour is a number
    if (isNaN(creditHour) || creditHour <= 0) {
      return res.status(400).json({ 
        message: "Credit hour must be a positive number." 
      });
    }

    const newCourse = new Course({ 
      name, 
      code, 
      department, 
      category, 
      year, 
      semester, 
      creditHour, 
      lecture, 
      lab, 
      tutorial, 
      chair, 
      likeness, 
      location,
      status: status || "draft",
      createdBy: req.user._id
    });
    
    await newCourse.save();
    res.status(201).json({ 
      success: true,
      message: "Course created successfully", 
      course: newCourse 
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (likely duplicate course code)
      return res.status(400).json({ 
        message: "A course with this code already exists. Please use a unique course code." 
      });
    }
    res.status(500).json({ 
      message: "Failed to create course. Please check your input and try again.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    if (!courses.length) {
      return res.status(200).json({ 
        message: "No courses found. Create a course to get started.", 
        courses: [] 
      });
    }
    res.json({ 
      success: true,
      count: courses.length,
      courses 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to retrieve courses. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get course by chair
export const getCourseByChair = async (req, res) => { 
  try {
    if (!req.params.chair) {
      return res.status(400).json({ 
        message: "Chair identifier is required in the request parameters." 
      });
    }

    const courses = await Course.find({ chair: req.params.chair }); 
    if (!courses || courses.length === 0) {
      return res.status(200).json({ 
        message: "No courses currently assigned to this chair.", 
        courses: [] 
      });
    }
    res.json({ 
      success: true,
      count: courses.length,
      courses 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch courses for this chair. Please try again.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get courses assigned to a specific chair or CoC
export const getAssignedCourses = async (req, res) => {
  try {
    if (!req.params.chair) {
      return res.status(400).json({ 
        message: "Chair identifier is required in the request parameters." 
      });
    }

    const assignedTo = req.params.chair;
    // Create a query condition that checks for status first
    const query = {
      status: { $in: ["active", "assigned"] }
    };
    
    // Only add assignedTo to the query if it's not "COC"
    if (assignedTo !== "COC") {
      query.assignedTo = assignedTo;
    }
    
    const courses = await Course.find(query).sort({ createdAt: -1 });
    
    if (!courses.length) {
      return res.status(200).json({ 
        message: "No currently assigned courses found for this chair.", 
        courses: [] 
      });
    }
    
    res.json({ 
      success: true,
      count: courses.length,
      courses 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to retrieve assigned courses. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const unassignCourses = async (req, res) => {
  try {
    const { courseIds, unassignedBy, status } = req.body;

    // Validate input
    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ 
        message: 'Please provide an array of course IDs to unassign.' 
      });
    }

    if (courseIds.length === 0) {
      return res.status(400).json({ 
        message: 'No course IDs provided. Please select at least one course to unassign.' 
      });
    }

    // Verify all course IDs are valid ObjectIds
    const invalidIds = courseIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: `The following course IDs are invalid: ${invalidIds.join(', ')}` 
      });
    }

    // Update multiple courses at once
    const result = await Course.updateMany(
      { _id: { $in: courseIds } },
      { 
        $set: { 
          status: status || 'draft',
          updatedAt: new Date(),
          updatedBy: unassignedBy
        },
        $unset: { assignedTo: "" },
        $push: { 
          history: { 
            action: 'unassigned',
            performedBy: unassignedBy,
            timestamp: new Date()
          } 
        }
      }
    );

    // Check if any courses were updated
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        message: 'No courses found with the provided IDs. They may have been already unassigned or deleted.' 
      });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ 
        message: 'No changes made. The selected courses may have already been unassigned.', 
        modifiedCount: 0 
      });
    }

    res.json({ 
      success: true, 
      message: `Successfully unassigned ${result.modifiedCount} course(s)`,
      modifiedCount: result.modifiedCount
    });

  } catch (err) {
    console.error('Error unassigning courses:', err);
    res.status(500).json({ 
      message: 'An unexpected error occurred while unassigning courses. Please try again.', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Assign courses to chair or CoC
export const assignCourses = async (req, res) => {
  try {
    const { courseIds, assignedTo, assignedBy, status } = req.body;

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ 
        message: "Please provide an array of course IDs to assign." 
      });
    }

    if (courseIds.length === 0) {
      return res.status(400).json({ 
        message: "No courses selected. Please select at least one course to assign." 
      });
    }

    if (!assignedTo) {
      return res.status(400).json({ 
        message: "Please specify a chair or COC to assign these courses to." 
      });
    }

    // Verify all course IDs are valid ObjectIds
    const invalidIds = courseIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: `The following course IDs are invalid: ${invalidIds.join(', ')}` 
      });
    }

    // Update all selected courses
    const updateResult = await Course.updateMany(
      { _id: { $in: courseIds } },
      { 
        $set: { 
          assignedTo, 
          assignedBy, 
          status: status || "active",
          assignedAt: new Date(),
          updatedAt: new Date()
        },
        $push: {
          history: {
            action: 'assigned',
            performedBy: assignedBy,
            timestamp: new Date(),
            assignedTo
          }
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ 
        message: "No courses found with the provided IDs. They may have been deleted." 
      });
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(200).json({ 
        message: "No changes made. The selected courses may have already been assigned to this chair.", 
        modifiedCount: 0 
      });
    }

    res.json({ 
      success: true,
      message: `Successfully assigned ${updateResult.modifiedCount} course(s) to ${assignedTo}`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to assign courses. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all chair heads (for assignment dropdown)
export const getChairHeads = async (req, res) => {
  try {
    const chairHeads = await User.find({ 
      role: "ChairHead" 
    }).select('_id name chair email');
    
    if (!chairHeads.length) {
      return res.status(200).json({ 
        message: "No chair heads found in the system.", 
        chairHeads: [] 
      });
    }
    
    res.json({ 
      success: true,
      count: chairHeads.length,
      chairHeads 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to retrieve chair heads. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update course details
export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        message: "Invalid course ID format." 
      });
    }

    // Check if course exists
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ 
        message: "Course not found. It may have been deleted or never existed." 
      });
    }
    
    // Validate credit hour if provided
    if (req.body.creditHour && (isNaN(req.body.creditHour) || req.body.creditHour <= 0)) {
      return res.status(400).json({ 
        message: "Credit hour must be a positive number." 
      });
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId, 
      { 
        ...req.body,
        lastUpdatedBy: req.user ? req.user._id : undefined,
        lastUpdatedAt: new Date()
      }, 
      { new: true, runValidators: true }
    );
    
    res.json({ 
      success: true,
      message: "Course updated successfully", 
      course: updatedCourse 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "A course with this code already exists. Please use a unique course code." 
      });
    }
    res.status(500).json({ 
      message: "Failed to update course. Please check your input and try again.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        message: "Invalid course ID format." 
      });
    }

    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      return res.status(404).json({ 
        message: "Course not found. It may have already been deleted." 
      });
    }
    
    res.json({ 
      success: true,
      message: "Course deleted successfully",
      deletedCourseId: courseId 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete course. Please try again later.", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const bulkUpdateCourses = async (req, res) => {
  const { courseIds, updates, actionBy } = req.body;

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ message: "No course IDs provided." });
  }

  try {
    // Update courses in bulk
    const result = await Course.updateMany(
      { _id: { $in: courseIds } },
      {
        $set: {
          ...updates,
          assignedBy: updates.status === "active" ? actionBy : null,
          assignedAt: updates.status === "active" ? new Date() : null
        }
      }
    );

    res.status(200).json({
      message: `Successfully updated ${result.modifiedCount} courses.`,
      updated: result.modifiedCount
    });
  } catch (error) {
    console.error("Bulk course update error:", error);
    res.status(500).json({ message: "Failed to update courses." });
  }
};