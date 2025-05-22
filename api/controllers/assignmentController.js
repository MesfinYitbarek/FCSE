import Assignment from "../models/Assignment.js";
import Preference from "../models/Preference.js";
import Instructor from "../models/Instructor.js";
import Course from "../models/Course.js";
import PreferenceWeight from "../models/PreferenceWeight.js";
import CourseExperienceWeight from "../models/CourseExperienceWeight.js";
import Position from "../models/Position.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import PreferenceForm from "../models/PreferenceForm.js";

export const manualAssignment = async (req, res) => {
  try {
    const { assignments, year, semester, program, assignedBy } = req.body;

    // Validate input
    if (!assignments || assignments.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one assignment is required" });
    }

    // Find existing assignment document with the same year, semester, and program
    let existingAssignment = await Assignment.findOne({
      year,
      semester,
      program
    });

    const bulkAssignments = [];
    const duplicateAssignments = [];

    // Process each assignment
    for (const assignment of assignments) {
      const { instructorId, courseId, section, labDivision, assignmentReason } = assignment;

      // Validate courseId
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res
          .status(400)
          .json({ message: `Invalid courseId: ${courseId}` });
      }

      // Check if the course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ message: `Course not found for ID: ${courseId}` });
      }

      // Check if this assignment already exists in the existing assignment document
      if (existingAssignment) {
        const isDuplicate = existingAssignment.assignments.some(
          existing => 
            existing.instructorId.toString() === instructorId &&
            existing.courseId.toString() === courseId &&
            existing.section === section
        );

        if (isDuplicate) {
          duplicateAssignments.push({
            course: course.name,
            section,
            instructorId
          });
          continue; // Skip this assignment
        }
      }

      // Calculate workload based on course attributes and lab division
      let workload;
      if (labDivision === "Yes") {
        workload =
          course.lecture +
          2 * ((2 / 3) * course.lab) +
          2 * ((2 / 3) * course.tutorial);
      } else {
        workload =
          course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }
      workload = Math.round(workload * 100) / 100; // Round to 2 decimal places

      // Add assignment to bulkAssignments array with assignment reason
      bulkAssignments.push({
        instructorId,
        courseId,
        section,
        labDivision,
        workload,
        assignmentReason: assignmentReason || "", // Include assignment reason
      });

      // Update instructor workload
      const instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) {
        return res
          .status(404)
          .json({ message: `Instructor not found for ID: ${instructorId}` });
      }

      // Check if workload entry already exists for the same year, semester, and program
      const existingWorkloadIndex = instructor.workload.findIndex(
        (entry) =>
          entry.year === year &&
          entry.semester === semester &&
          entry.program === program
      );

      if (existingWorkloadIndex !== -1) {
        // If entry exists, add new workload to existing workload
        instructor.workload[existingWorkloadIndex].value += workload;
      } else {
        // If entry does not exist, create a new one
        instructor.workload.push({
          year,
          semester,
          program,
          value: workload,
        });
      }

      // Save updated instructor workload
      await instructor.save();
    }

    // If no valid assignments to add, return with message about duplicates
    if (bulkAssignments.length === 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    // If existing assignment document found, add to it
    if (existingAssignment) {
      existingAssignment.assignments.push(...bulkAssignments);
      await existingAssignment.save();
    } else {
      // Create a new Assignment document with all assignments
      existingAssignment = new Assignment({
        year,
        semester,
        program,
        assignedBy,
        assignments: bulkAssignments,
      });
      await existingAssignment.save();
    }

    // Send success response with info about duplicates if any
    const response = {
      message: "Courses assigned successfully",
      assignments: bulkAssignments,
    };

    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped because they already exist";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in manual assignment:", error);
    res.status(500).json({ message: "Error in manual assignment", error });
  }
};

export const commonManualAssignment = async (req, res) => {
  try {
    const { assignments, year, semester, program, assignedBy } = req.body;

    // Validate input
    if (!assignments || assignments.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one assignment is required" });
    }

    // Find existing assignment document with the same year, semester, and program
    let existingAssignment = await Assignment.findOne({
      year,
      semester,
      program
    });

    const bulkAssignments = [];
    const duplicateAssignments = [];

    // Process each assignment
    for (const assignment of assignments) {
      const { instructorId, courseId, section, labDivision, assignmentReason } = assignment;

      // Validate courseId
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res
          .status(400)
          .json({ message: `Invalid courseId: ${courseId}` });
      }

      // Check if the course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ message: `Course not found for ID: ${courseId}` });
      }

      // Check if this assignment already exists in the existing assignment document
      if (existingAssignment) {
        const isDuplicate = existingAssignment.assignments.some(
          existing => 
            existing.instructorId.toString() === instructorId &&
            existing.courseId.toString() === courseId &&
            existing.section === section
        );

        if (isDuplicate) {
          duplicateAssignments.push({
            course: course.name,
            section,
            instructorId
          });
          continue; // Skip this assignment
        }
      }

      // Calculate workload based on course attributes and lab division
      let workload;
      if (labDivision === "Yes") {
        workload =
          course.lecture +
          2 * ((2 / 3) * course.lab) +
          2 * ((2 / 3) * course.tutorial);
      } else {
        workload =
          course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }
      workload = Math.round(workload * 100) / 100; // Round to 2 decimal places

      // Add assignment to bulkAssignments array with assignment reason
      bulkAssignments.push({
        instructorId,
        courseId,
        section,
        labDivision,
        workload,
        assignmentReason: assignmentReason || "", // Include assignment reason
      });

      // Update instructor workload
      const instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) {
        return res
          .status(404)
          .json({ message: `Instructor not found for ID: ${instructorId}` });
      }

      // Check if workload entry already exists for the same year, semester, and program
      const existingWorkloadIndex = instructor.workload.findIndex(
        (entry) =>
          entry.year === year &&
          entry.semester === semester &&
          entry.program === program
      );

      if (existingWorkloadIndex !== -1) {
        // If entry exists, add new workload to existing workload
        instructor.workload[existingWorkloadIndex].value += workload;
      } else {
        // If entry does not exist, create a new one
        instructor.workload.push({
          year,
          semester,
          program,
          value: workload,
        });
      }

      // Save updated instructor workload
      await instructor.save();
    }

    // If no valid assignments to add, return with message about duplicates
    if (bulkAssignments.length === 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    // If existing assignment document found, add to it
    if (existingAssignment) {
      existingAssignment.assignments.push(...bulkAssignments);
      await existingAssignment.save();
    } else {
      // Create a new Assignment document with all assignments
      existingAssignment = new Assignment({
        year,
        semester,
        program,
        assignedBy,
        assignments: bulkAssignments,
      });
      await existingAssignment.save();
    }

    // Send success response with info about duplicates if any
    const response = {
      message: "Courses assigned successfully",
      assignments: bulkAssignments,
    };

    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped because they already exist";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in manual assignment:", error);
    res.status(500).json({ message: "Error in manual assignment", error });
  }
};

// Update an Assignment
export const updateAssignment = async (req, res) => {
  try {
    const { parentId, subId } = req.params;
    const { instructorId, courseId, labDivision, assignmentReason } = req.body;
    
    console.log("Update request received:", {
      parentId,
      subId,
      instructorId,
      courseId,
      labDivision,
      assignmentReason
    });

    // Validate both IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(subId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    // Step 1: Get the current assignment data
    const parentAssignment = await Assignment.findById(parentId);
    if (!parentAssignment) {
      return res.status(404).json({ message: "Parent assignment not found" });
    }

    // Find the specific sub-assignment
    const subAssignmentIndex = parentAssignment.assignments.findIndex(
      (sub) => sub._id.toString() === subId
    );

    if (subAssignmentIndex === -1) {
      return res.status(404).json({ message: "Sub-assignment not found" });
    }

    // Store the old values for later comparison
    const oldAssignment = parentAssignment.assignments[subAssignmentIndex];
    const oldInstructorId = oldAssignment.instructorId;
    const oldWorkload = oldAssignment.workload;
    
    // Convert values to strings for comparison
    const oldLabDivision = String(oldAssignment.labDivision || 'No');
    const newLabDivision = String(labDivision || oldLabDivision);
    
    console.log("Current assignment data:", {
      oldInstructorId: oldInstructorId.toString(),
      oldWorkload,
      oldLabDivision
    });
    
    // Check if lab division is changing
    const isLabDivisionChanging = newLabDivision !== oldLabDivision;
    
    console.log("Is lab division changing?", isLabDivisionChanging, {
      oldLabDivision,
      newLabDivision
    });

    // Step 2: Calculate the new workload if needed
    let newWorkload = oldWorkload;
    
    // If course is changing or lab division is changing, recalculate workload
    const targetCourseId = courseId || oldAssignment.courseId;
    if (isLabDivisionChanging || (courseId && courseId !== oldAssignment.courseId.toString())) {
      const course = await Course.findById(targetCourseId);
      if (!course) {
        return res.status(404).json({ message: `Course not found for ID: ${targetCourseId}` });
      }
      
      console.log("Course found for workload calculation:", {
        courseId: course._id.toString(),
        lecture: course.lecture,
        lab: course.lab,
        tutorial: course.tutorial
      });

      // Calculate new workload based on lab division
      if (newLabDivision === 'Yes') {
        newWorkload = course.lecture + 2 * ((2 / 3) * course.lab) + 2 * ((2 / 3) * course.tutorial);
      } else {
        newWorkload = course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }
      newWorkload = Math.round(newWorkload * 100) / 100;
      
      console.log("New workload calculated:", {
        newWorkload,
        oldWorkload,
        difference: newWorkload - oldWorkload
      });
    }
    
    // Step 3: Update the assignment
    const updatedAssignment = { ...oldAssignment.toObject() };
    
    // Only update fields that are provided in the request
    if (instructorId) updatedAssignment.instructorId = instructorId;
    if (courseId) updatedAssignment.courseId = courseId;
    if (labDivision !== undefined) updatedAssignment.labDivision = labDivision;
    if (assignmentReason !== undefined) updatedAssignment.assignmentReason = assignmentReason;
    
    // Always update the workload
    updatedAssignment.workload = newWorkload;
    
    // Keep the original ID
    updatedAssignment._id = subId;
    
    console.log("Updated assignment object:", updatedAssignment);
    
    // Apply the update to the parent document
    parentAssignment.assignments[subAssignmentIndex] = updatedAssignment;
    
    // Step 4: Determine if instructor workload needs to be updated
    const isWorkloadChanging = newWorkload !== oldWorkload;
    const isInstructorChanging = instructorId && oldInstructorId.toString() !== instructorId;
    
    console.log("Change detection:", {
      isWorkloadChanging,
      isInstructorChanging,
      workloadDifference: isWorkloadChanging ? newWorkload - oldWorkload : 0
    });
    
    // Save the parent assignment first
    await parentAssignment.save();
    console.log("Parent assignment saved successfully");
    
    // Step 5: Handle instructor workload updates
    if (isInstructorChanging) {
      // Case 1: Instructor is changing - update both old and new instructor
      console.log("Updating workload for instructor change scenario");
      
      // Remove workload from old instructor
      if (oldInstructorId) {
        try {
          const oldInstructor = await Instructor.findById(oldInstructorId);
          if (oldInstructor) {
            console.log("Found old instructor:", oldInstructor._id.toString());
            
            const oldWorkloadIndex = oldInstructor.workload.findIndex(
              w => 
                w.year == parentAssignment.year && 
                w.semester === parentAssignment.semester && 
                w.program === parentAssignment.program
            );
            
            if (oldWorkloadIndex !== -1) {
              console.log("Old instructor current workload:", oldInstructor.workload[oldWorkloadIndex].value);
              
              oldInstructor.workload[oldWorkloadIndex].value -= oldWorkload;
              if (oldInstructor.workload[oldWorkloadIndex].value < 0) {
                oldInstructor.workload[oldWorkloadIndex].value = 0;
              }
              
              console.log("Removed workload from old instructor:", {
                removed: oldWorkload,
                newTotal: oldInstructor.workload[oldWorkloadIndex].value
              });
              
              await oldInstructor.save();
              console.log("Old instructor workload updated successfully");
            }
          }
        } catch (error) {
          console.error("Error updating old instructor workload:", error);
        }
      }
      
      // Add workload to new instructor
      if (instructorId) {
        try {
          const newInstructor = await Instructor.findById(instructorId);
          if (newInstructor) {
            console.log("Found new instructor:", newInstructor._id.toString());
            
            const newWorkloadIndex = newInstructor.workload.findIndex(
              w => 
                w.year == parentAssignment.year && 
                w.semester === parentAssignment.semester && 
                w.program === parentAssignment.program
            );
            
            if (newWorkloadIndex !== -1) {
              console.log("New instructor current workload:", newInstructor.workload[newWorkloadIndex].value);
              
              newInstructor.workload[newWorkloadIndex].value += newWorkload;
              
              console.log("Added workload to new instructor:", {
                added: newWorkload,
                newTotal: newInstructor.workload[newWorkloadIndex].value
              });
            } else {
              console.log("Creating new workload entry for instructor");
              
              newInstructor.workload.push({
                year: parentAssignment.year,
                semester: parentAssignment.semester,
                program: parentAssignment.program,
                value: newWorkload
              });
            }
            
            await newInstructor.save();
            console.log("New instructor workload updated successfully");
          }
        } catch (error) {
          console.error("Error updating new instructor workload:", error);
        }
      }
    } 
    // Case 2: Same instructor but workload is changing
    else if (isWorkloadChanging && oldInstructorId) {
      console.log("Updating workload for same instructor scenario");
      
      try {
        const instructor = await Instructor.findById(oldInstructorId);
        if (instructor) {
          console.log("Found instructor for workload update:", instructor._id.toString());
          
          const workloadIndex = instructor.workload.findIndex(
            w => 
              w.year == parentAssignment.year && 
              w.semester === parentAssignment.semester && 
              w.program === parentAssignment.program
          );
          
          if (workloadIndex !== -1) {
            console.log("Instructor current workload:", instructor.workload[workloadIndex].value);
            
            // Calculate the workload difference
            const workloadDifference = newWorkload - oldWorkload;
            
            // Update the instructor's workload
            instructor.workload[workloadIndex].value += workloadDifference;
            
            // Ensure workload doesn't go below 0
            if (instructor.workload[workloadIndex].value < 0) {
              instructor.workload[workloadIndex].value = 0;
            }
            
            console.log("Adjusted instructor workload:", {
              difference: workloadDifference,
              newTotal: instructor.workload[workloadIndex].value
            });
            
            // Use direct MongoDB update to ensure changes are saved
            await Instructor.updateOne(
              { 
                _id: instructor._id,
                "workload._id": instructor.workload[workloadIndex]._id
              },
              {
                $set: {
                  [`workload.$.value`]: instructor.workload[workloadIndex].value
                }
              }
            );
            
            console.log("Instructor workload updated successfully with MongoDB update");
          }
        }
      } catch (error) {
        console.error("Error updating instructor workload:", error);
      }
    } else {
      console.log("No workload or instructor changes needed");
    }

    // Fetch the updated assignment with populated data
    const updatedParentAssignment = await Assignment.findById(parentId).populate(
      "assignments.instructorId assignments.courseId"
    );
    
    // Find the updated sub-assignment
    const updatedSubAssignment = updatedParentAssignment.assignments.find(
      sub => sub._id.toString() === subId
    );

    res.json({
      message: "Assignment updated successfully",
      assignment: updatedSubAssignment,
      workloadChanged: isWorkloadChanging ? {
        old: oldWorkload,
        new: newWorkload,
        difference: newWorkload - oldWorkload
      } : null
    });
  } catch (error) {
    console.error("Error updating sub-assignment:", error);
    res.status(500).json({ message: "Error updating sub-assignment", error: error.message });
  }
};

// Delete an Assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { parentId, subId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(parentId) ||
      !mongoose.Types.ObjectId.isValid(subId)
    ) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const parentAssignment = await Assignment.findById(parentId);
    if (!parentAssignment) {
      return res.status(404).json({ message: "Parent assignment not found" });
    }

    const subAssignmentIndex = parentAssignment.assignments.findIndex(
      (sub) => sub._id.toString() === subId
    );

    if (subAssignmentIndex === -1) {
      return res.status(404).json({ message: "Sub-assignment not found" });
    }

    const subAssignment = parentAssignment.assignments[subAssignmentIndex];

    // Extract context
    const { instructorId, workload } = subAssignment;
    const { year, semester, program } = parentAssignment;

    // Remove the sub-assignment
    parentAssignment.assignments.splice(subAssignmentIndex, 1);

    if (parentAssignment.assignments.length === 0) {
      await Assignment.findByIdAndDelete(parentId);
    } else {
      await parentAssignment.save();
    }

    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
      const instructor = await Instructor.findOne({ userId: instructorId });

      if (instructor) {
        // Decrease workload for the same year, semester, and program
        const index = instructor.workload.findIndex(
          (entry) =>
            entry.year === year &&
            entry.semester === semester &&
            entry.program === program
        );

        if (index !== -1) {
          instructor.workload[index].value -= workload;
          if (instructor.workload[index].value <= 0) {
            instructor.workload.splice(index, 1);
          }
        }

        await instructor.save();
      }
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting sub-assignment:", error);
    res
      .status(500)
      .json({ message: "Error deleting sub-assignment", error: error.message });
  }
};

// Get All Assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate({
        path: "assignments.instructorId",
        select: "fullName email chair", // ✅ Select correct fields
        model: "User", // ✅ Ensure instructorId references User, not Instructor
      })
      .populate({
        path: "assignments.courseId",
        select: "name code",
        model: "Course",
      });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Error fetching assignments", error });
  }
};

// get assignments using filtering
export const getAutomaticAssignments = async (req, res) => {
  try {
    console.log("Received Query Params:", req.query);

    const { year, semester, program, assignedBy } = req.query;

    let assignedByFilter = assignedBy;
    if (assignedBy === "COC") {
      assignedByFilter = {
        $in: ["Programming", "Software", "Database", "Networking", "COC"],
      };
    }

    const assignments = await Assignment.find({
      year: Number(year),
      semester,
      program,
      assignedBy: assignedByFilter,
    })
      .populate({
        path: "assignments.instructorId",
        select: "fullName email chair",
        model: "User", // ✅ Ensure correct reference
      })
      .populate({
        path: "assignments.courseId",
        select: "name code",
        model: "Course",
      });

    console.log(
      "Fetched Assignments from DB:",
      JSON.stringify(assignments, null, 2)
    );

    // Create plain objects and ensure every assignment has a reason (use the stored one or generate a fallback)
    const assignmentsWithReasons = assignments.map((assignment) => {
      const updatedAssignments = assignment.assignments.map((a) => {
        // Convert to a plain object
        const assignmentObj = a.toObject ? a.toObject() : a;

        // If the assignment already has a stored reason, use it
        if (assignmentObj.assignmentReason) {
          return assignmentObj;
        }

        // Otherwise, generate a fallback reason based on available data
        let reasonText = "";

        // Add preference reasoning
        if (a.preferenceRank) {
          if (a.preferenceRank <= 3) {
            reasonText += `This course was listed as preference #${a.preferenceRank} by the instructor. `;
          } else {
            reasonText += `This course was listed as preference #${a.preferenceRank} (lower priority) by the instructor. `;
          }
        }

        // Add experience reasoning
        if (a.experienceYears > 0) {
          reasonText += `The instructor has ${a.experienceYears} year${
            a.experienceYears > 1 ? "s" : ""
          } of experience teaching this course. `;
        } else {
          reasonText += `The instructor has no previous experience teaching this course. `;
        }

        // Add score reasoning
        if (a.score) {
          reasonText += `Final assignment score: ${a.score.toFixed(2)}`;
        }

        // If no reason information is available
        if (!reasonText) {
          reasonText = "Assignment information not available";
        }

        return {
          ...assignmentObj,
          assignmentReason: reasonText,
        };
      });

      // Create a modified assignment object
      const assignmentObj = assignment.toObject
        ? assignment.toObject()
        : assignment;
      return {
        ...assignmentObj,
        assignments: updatedAssignments,
      };
    });

    res.status(200).json({ assignments: assignmentsWithReasons });
  } catch (error) {
    console.error("Error fetching automatic assignments:", error);
    res.status(500).json({ message: "Error fetching automatic assignments" });
  }
};

// Get Assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.find({ instructorId: id })
      .populate("instructorId")
      .populate("courseId");
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignment", error });
  }
};

// Automatic Assignment for Regular Courses
export const runAutomaticAssignment = async (req, res) => {
  try {
    const { year, semester, program, assignedBy } = req.body;

    if (!year || !semester || !program || !assignedBy) {
      console.log("Missing required parameters in request body");
      return res.status(400).json({
        message: "Year, semester, program, and assignedBy are required.",
      });
    }

    console.log(
      `Starting automatic assignment for ${year} ${semester} ${program} by ${assignedBy}`
    );

    // Check if an assignment document already exists for this year, semester, and program
    const existingAssignment = await Assignment.findOne({
      year,
      semester,
      program
    });

    console.log(existingAssignment ? 
      `Found existing assignment document for ${year} ${semester} ${program}` : 
      `No existing assignment document for ${year} ${semester} ${program}`);

    const preferenceForm = await PreferenceForm.findOne({
      chair: assignedBy,
      year,
      semester,
    }).populate("courses.course");

    if (!preferenceForm) {
      console.log(
        `No preference form found for chair ${assignedBy}, ${year} ${semester}`
      );
      return res.status(404).json({
        message:
          "No preference form found for the specified chair, year, and semester.",
      });
    }

    const allowedCourses = preferenceForm.courses.map((c) => ({
      courseId: c.course._id.toString(),
      section: c.section,
      NoOfSections: c.NoOfSections,
      labDivision: c.labDivision,
    }));

    console.log(
      "Allowed Courses with metadata:",
      JSON.stringify(allowedCourses, null, 2)
    );

    const getCourseMeta = (courseId) => {
      return allowedCourses.find((c) => c.courseId === courseId.toString());
    };

    const preferences = await Preference.find({
      preferenceFormId: preferenceForm._id,
    })
      .populate("instructorId")
      .populate("preferences.courseId");

    console.log(`Found ${preferences.length} preference submissions`);

    const preferenceWeights = await PreferenceWeight.findOne();
    const experienceWeights = await CourseExperienceWeight.findOne();
    let assignedCourses = [];
    let instructorAssigned = new Set();
    // Track which courses are already assigned in the existing assignment document
    const existingCourseAssignments = new Map();
    let duplicateAssignments = [];

    // If there's an existing assignment document, map out the courses, sections, and instructors
    if (existingAssignment) {
      existingAssignment.assignments.forEach(assignment => {
        const key = `${assignment.courseId}-${assignment.section}-${assignment.instructorId}`;
        existingCourseAssignments.set(key, true);
      });
      console.log(`Found ${existingCourseAssignments.size} existing course assignments`);
    }

    console.log(
      "Preference Weights:",
      JSON.stringify(preferenceWeights, null, 2)
    );
    console.log(
      "Experience Weights:",
      JSON.stringify(experienceWeights, null, 2)
    );

    const calculateScore = (preferenceRank, yearsExperience) => {
      let preferenceScore =
        preferenceWeights?.weights?.find((w) => w.rank === preferenceRank)
          ?.weight || 0;
      let experienceScore =
        experienceWeights?.yearsExperience?.find(
          (y) => y.years === yearsExperience
        )?.weight || 0;
      const totalScore = preferenceScore + experienceScore;

      console.log(`Calculating score for rank ${preferenceRank} and ${yearsExperience} years experience: 
        Preference Score = ${preferenceScore}, 
        Experience Score = ${experienceScore}, 
        Total Score = ${totalScore}`);

      return totalScore;
    };

    // Function to get course experience from assigned courses
    const getInstructorCourseExperience = async (instructorId, courseId) => {
      const instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) return 0;

      // Count how many times this instructor has taught this course before
      const experience = instructor.assignedCourses.filter(
        (c) => c.course.toString() === courseId.toString()
      ).length;

      console.log(
        `Instructor ${instructorId} has ${experience} years of experience teaching course ${courseId}`
      );
      return experience;
    };

    let courseAssignments = {};
    console.log("Processing instructor preferences...");
    for (let preference of preferences) {
      console.log(
        `Processing preferences for instructor ${preference.instructorId.name} (${preference.instructorId._id})`
      );

      for (let { courseId, rank } of preference.preferences) {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          console.log(`Skipping invalid course ID: ${courseId}`);
          continue;
        }

        courseId = new mongoose.Types.ObjectId(courseId);
        const meta = getCourseMeta(courseId);
        if (!meta) {
          console.log(
            `Course ${courseId} not found in allowed courses, skipping`
          );
          continue;
        }

        if (!courseAssignments[courseId]) courseAssignments[courseId] = [];
        const instructorId = preference.instructorId._id;

        // Get years of experience teaching this course
        const experienceYears = await getInstructorCourseExperience(
          instructorId,
          courseId
        );

        let score = calculateScore(rank, experienceYears);

        console.log(`Instructor ${preference.instructorId.name} (${instructorId}) for course ${courseId}:
          - Preference Rank: ${rank}
          - Years Experience: ${experienceYears}
          - Calculated Score: ${score}
          - Submitted At: ${preference.submittedAt}`);

        courseAssignments[courseId].push({
          instructorId,
          score,
          submittedAt: preference.submittedAt,
          instructorName: preference.instructorId.name,
          preferenceRank: rank,
          experienceYears,
        });
      }
    }

    console.log("\nSorting candidates for each course...");
    for (let courseId in courseAssignments) {
      console.log(`\nCourse ${courseId} candidates before sorting:`);
      console.table(courseAssignments[courseId]);

      courseAssignments[courseId].sort(
        (a, b) => b.score - a.score || a.submittedAt - b.submittedAt
      );

      console.log(`Course ${courseId} candidates after sorting:`);
      console.table(courseAssignments[courseId]);
    }

    console.log("\nAssigning courses to instructors...");
    for (let courseId in courseAssignments) {
      console.log(`\nProcessing assignments for course ${courseId}`);

      for (let candidate of courseAssignments[courseId]) {
        if (!instructorAssigned.has(candidate.instructorId)) {
          console.log(
            `Assigning course ${courseId} to ${candidate.instructorName} (score: ${candidate.score})`
          );

          assignedCourses.push({
            instructorId: candidate.instructorId,
            courseId,
            instructorName: candidate.instructorName,
            score: candidate.score,
            preferenceRank: candidate.preferenceRank,
            experienceYears: candidate.experienceYears,
          });

          instructorAssigned.add(candidate.instructorId);
          break;
        } else {
          console.log(
            `Instructor ${candidate.instructorName} already assigned to another course`
          );
        }
      }
    }

    console.log("\nHandling unassigned courses...");
    for (let courseId in courseAssignments) {
      if (!assignedCourses.some((a) => a.courseId.toString() === courseId)) {
        let selectedInstructor = courseAssignments[courseId][0]?.instructorId;
        if (selectedInstructor) {
          const instructor = courseAssignments[courseId][0];
          console.log(
            `Force assigning unassigned course ${courseId} to ${instructor.instructorName} (top candidate)`
          );

          assignedCourses.push({
            instructorId: selectedInstructor,
            courseId,
            instructorName: instructor.instructorName,
            score: instructor.score,
            preferenceRank: instructor.preferenceRank,
            experienceYears: instructor.experienceYears,
          });
        } else {
          console.log(`No available instructors for course ${courseId}`);
        }
      }
    }

    console.log("\nFinal assignments before saving:");
    console.table(
      assignedCourses.map((a) => ({
        course: a.courseId,
        instructor: a.instructorName,
        score: a.score,
        preference: a.preferenceRank,
        experience: a.experienceYears,
      }))
    );

    let finalAssignments = [];
    
    console.log(
      "\nProcessing workload calculations and updating instructor records..."
    );
    for (const assignment of assignedCourses) {
      const { instructorId, courseId, score, preferenceRank, experienceYears } =
        assignment;
      const course = await Course.findById(courseId);
      if (!course) {
        console.log(`Course ${courseId} not found, skipping`);
        continue;
      }

      const meta = getCourseMeta(courseId);
      if (!meta) {
        console.log(`Metadata not found for course ${courseId}, skipping`);
        continue;
      }

      // Check if this assignment already exists in the existing assignment document
      const assignmentKey = `${courseId}-${meta.section}-${instructorId}`;
      if (existingCourseAssignments.has(assignmentKey)) {
        console.log(`Assignment ${assignmentKey} already exists, skipping`);
        duplicateAssignments.push({
          course: course.name,
          section: meta.section,
          instructor: assignment.instructorName
        });
        continue;
      }

      const workload =
        Math.round(
          (course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial) *
            100
        ) / 100;

      console.log(
        `Calculated workload for course ${courseId}: ${workload} (lecture: ${course.lecture}, lab: ${course.lab}, tutorial: ${course.tutorial})`
      );

      // Generate human-readable assignment reason
      // Find all candidates for this course for comparison
      const allCandidates = courseAssignments[courseId.toString()];
      const higherScoringCandidates = allCandidates.filter(
        (c) =>
          c.instructorId.toString() !== instructorId.toString() &&
          c.score > score
      );
      const currentInstructor = allCandidates.find(
        (c) => c.instructorId.toString() === instructorId.toString()
      );
      
      const sameScoreEarlierSubmission = allCandidates.filter(
        (c) =>
          c.score === score &&
          c.submittedAt < (currentInstructor?.submittedAt || new Date())
      );
      

      // Start building the reason text
      let reasonText = `Reason:`;

      // Add preference explanation
      reasonText += `\n- They listed this course as preference #${preferenceRank}.`;

      // Add experience explanation
      reasonText += `\n- They have ${experienceYears} year${
        experienceYears !== 1 ? "s" : ""
      } of experience teaching it.`;

      // Add score explanation
      reasonText += `\n- Their combined score was ${score.toFixed(2)}.`;

      // Justify the selection over others
      if (higherScoringCandidates.length > 0) {
        reasonText += `\n- Although there were ${higherScoringCandidates.length} instructor(s) with a higher score, they were already assigned to other courses.`;
      } else if (sameScoreEarlierSubmission.length > 0) {
        reasonText += `\n- Their score was equal to others, but they submitted their preference form later.`;
      } else {
        reasonText += `\n- They had the highest score among available instructors for this course.`;
      }

      // Create the assignment object
      const assignmentObject = {
        instructorId,
        courseId,
        section: meta.section || "",
        NoOfSections: meta.NoOfSections || 1,
        labDivision: meta.labDivision || "No",
        workload,
        // Assignment reasoning data
        score,
        preferenceRank,
        experienceYears,
        assignmentReason: reasonText,
      };

      // Add to final assignments
      finalAssignments.push(assignmentObject);

      let instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) {
        console.log(
          `Instructor ${assignment.instructorName} (${instructorId}) not found, skipping workload update`
        );
        continue;
      }

      // Update instructor workload
      const existingWorkloadIndex = instructor.workload.findIndex(
        (entry) =>
          entry.year === year &&
          entry.semester === semester &&
          entry.program === program
      );

      if (existingWorkloadIndex !== -1) {
        console.log(
          `Updating existing workload entry for ${assignment.instructorName} (${year} ${semester} ${program})`
        );
        instructor.workload[existingWorkloadIndex].value += workload;
      } else {
        console.log(
          `Creating new workload entry for ${assignment.instructorName} (${year} ${semester} ${program})`
        );
        instructor.workload.push({ year, semester, program, value: workload });
      }

      await instructor.save();
      console.log(`Instructor ${assignment.instructorName} workload updated`);
    }

    // If no valid assignments to add, return with message about duplicates
    if (finalAssignments.length === 0 && duplicateAssignments.length > 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    // Save assignments - either create new document or update existing one
    let savedAssignment;
    if (existingAssignment) {
      console.log(`Adding ${finalAssignments.length} assignments to existing document`);
      existingAssignment.assignments.push(...finalAssignments);
      savedAssignment = await existingAssignment.save();
    } else {
      console.log(`Creating new assignment document with ${finalAssignments.length} assignments`);
      savedAssignment = await Assignment.create({
        year,
        semester,
        program,
        assignments: finalAssignments,
        assignedBy,
      });
    }

    console.log("\nAssignment saved successfully:", savedAssignment._id);

    // Prepare response
    const response = {
      message: "Courses assigned successfully",
      assignment: {
        year,
        semester, 
        program,
        assignedBy,
        assignments: finalAssignments
      }
    };

    // Add warning if duplicates were found
    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped because they already exist";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.json(response);
  } catch (error) {
    console.error("Error in automatic assignment:", error);
    res.status(500).json({ message: "Error in automatic assignment", error });
  }
}; 

// Automatic Assignment for Common Courses
export const autoAssignCommonCourses = async (req, res) => {
  try {
    console.log("Starting auto assignment process...");
    const {
      year,
      semester,
      assignedBy,
      instructors: instructorIds,
      courses: frontendCourses,
    } = req.body;

    if (
      !year ||
      !semester ||
      !assignedBy ||
      !instructorIds?.length ||
      !frontendCourses?.length
    ) {
      return res.status(400).json({
        message:
          "Year, semester, assignedBy, instructors, and courses are required.",
      });
    }

    // Check for existing assignment document
    const existingAssignment = await Assignment.findOne({
      year: parseInt(year),
      semester,
      program: "Regular",
    });

    console.log(
      existingAssignment
        ? `Found existing assignment for ${year} ${semester} Regular`
        : `No existing assignment found for ${year} ${semester} Regular`
    );

    // Track existing assignments to avoid duplicates
    const existingCourseAssignments = new Map();
    const duplicateAssignments = [];

    if (existingAssignment) {
      existingAssignment.assignments.forEach(assignment => {
        const key = `${assignment.courseId}-${assignment.section}-${assignment.instructorId}`;
        existingCourseAssignments.set(key, true);
      });
      console.log(`Found ${existingCourseAssignments.size} existing course assignments`);
    }

    const courseIds = frontendCourses.map((course) => course.courseId);
    const courseObjectIds = courseIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const instructors = await User.find({
      _id: { $in: instructorIds },
      role: "Instructor",
    });
    const courses = await Course.find({ _id: { $in: courseObjectIds } });

    if (courses.length === 0) {
      return res.status(404).json({ message: "No valid courses found." });
    }
    if (instructors.length === 0) {
      return res.status(404).json({ message: "No valid instructors found." });
    }

    const instructorRecords = await Instructor.find({
      userId: { $in: instructors.map((i) => i._id) },
    });

    let assignments = [];

    for (const frontendCourse of frontendCourses) {
      const { courseId, section, labDivision } = frontendCourse;
      const course = courses.find((c) => c._id.toString() === courseId);
      if (!course) continue;

      // Check if this course-section assignment already exists
      for (const instructor of instructors) {
        const assignmentKey = `${courseId}-${section}-${instructor._id}`;
        if (existingCourseAssignments.has(assignmentKey)) {
          console.log(`Assignment ${assignmentKey} already exists, skipping`);
          duplicateAssignments.push({
            course: course.name,
            section,
            instructor: instructor.fullName || instructor.name
          });
          // Don't break - we want to collect all duplicates for reporting
        }
      }

      const instructorWorkloads = await Promise.all(
        instructors.map(async (instructor) => {
          const record =
            instructorRecords.find(
              (r) => r.userId.toString() === instructor._id.toString()
            ) || {};

          const workloadEntry =
            record.workload?.find(
              (w) =>
                w.year === parseInt(year) &&
                w.semester === semester &&
                w.program === "Regular"
            ) || {};

          return {
            instructor,
            workload: workloadEntry.value || 0,
            locationPriority: instructor.location === course.location ? -1 : 1,
            record,
          };
        })
      );

      const workloadGroups = {};
      instructorWorkloads.forEach((iw) => {
        const workload = iw.workload;
        if (!workloadGroups[workload]) {
          workloadGroups[workload] = [];
        }
        workloadGroups[workload].push(iw);
      });

      const sortedWorkloads = Object.keys(workloadGroups)
        .map(Number)
        .sort((a, b) => a - b);

      let selectedInstructor = null;

      if (sortedWorkloads.length > 0) {
        const lowestWorkload = sortedWorkloads[0];
        const lowestWorkloadGroup = workloadGroups[lowestWorkload];

        const locationMatches = lowestWorkloadGroup.filter(
          (iw) => iw.instructor.location === course.location
        );

        if (locationMatches.length === 1) {
          selectedInstructor = locationMatches[0];
        } else if (locationMatches.length > 1) {
          selectedInstructor =
            locationMatches[Math.floor(Math.random() * locationMatches.length)];
        } else {
          selectedInstructor =
            lowestWorkloadGroup[
              Math.floor(Math.random() * lowestWorkloadGroup.length)
            ];
        }
      }

      if (!selectedInstructor) continue;

      const bestInstructor = selectedInstructor.instructor;
      const assignmentKey = `${courseId}-${section}-${bestInstructor._id}`;

      // Check again if this specific assignment is a duplicate
      if (existingCourseAssignments.has(assignmentKey)) {
        console.log(`Assignment ${assignmentKey} is a duplicate, skipping`);
        continue;
      }

      let instructorRecord = selectedInstructor.record;

      if (!instructorRecord) {
        instructorRecord = new Instructor({
          userId: bestInstructor._id,
          assignedCourses: [],
          workload: [],
        });
        instructorRecords.push(instructorRecord);
      }

      let workload =
        course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      if (labDivision === "Yes") {
        workload += (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }

      const existingWorkload = instructorRecord.workload.find(
        (w) =>
          w.year === parseInt(year) &&
          w.semester === semester &&
          w.program === "Regular"
      );

      if (existingWorkload) {
        existingWorkload.value += workload;
      } else {
        instructorRecord.workload.push({
          year: parseInt(year),
          semester,
          program: "Regular",
          value: workload,
        });
      }

      instructorRecord.assignedCourses.push({
        course: course._id,
        year: parseInt(year),
        semester,
        program: "Regular",
      });

      await instructorRecord.save();

      const locationMatch = bestInstructor.location === course.location;
      const currentWorkload = selectedInstructor.workload;

      let assignmentReason;
      if (selectedInstructor.randomlySelected) {
        assignmentReason =
          `Instructor selected through a random draw from equally qualified candidates. ` +
          `Workload: ${currentWorkload.toFixed(1)} hrs. ` +
          `${locationMatch ? "Location matched the course." : ""}`;
      } else {
        assignmentReason =
          `Instructor selected based on lowest workload (${currentWorkload.toFixed(
            1
          )} hrs). ` +
          `${locationMatch ? "Location matched the course." : ""}`;
      }

      assignments.push({
        instructorId: bestInstructor._id,
        courseId: course._id,
        section,
        labDivision,
        workload,
        score: 10 - currentWorkload / 2 - (locationMatch ? 0 : 1),
        assignmentReason,
      });

      // Add to map to prevent duplicate assignments in the same batch
      existingCourseAssignments.set(assignmentKey, true);
    }

    // If no valid assignments to add, return with message about duplicates
    if (assignments.length === 0 && duplicateAssignments.length > 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    // Save assignments - either create new document or update existing one
    if (assignments.length > 0) {
      if (existingAssignment) {
        existingAssignment.assignments.push(...assignments);
        await existingAssignment.save();
        console.log(`Updated existing assignment with ${assignments.length} new assignments`);
      } else {
        const newAssignment = new Assignment({
          year: parseInt(year),
          semester,
          program: "Regular",
          assignedBy,
          assignments,
        });
        await newAssignment.save();
        console.log(`Created new assignment with ${assignments.length} assignments`);
      }
    }

    // Prepare response
    const response = {
      message: "Automatic assignment for common courses completed successfully.",
      assignments,
    };

    // Add warning if duplicates were found
    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped because they already exist";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in auto assignment:", error);
    res
      .status(500)
      .json({ message: "Error in auto assignment", error: error.message });
  }
};

// Automatic Assignment for Extension Courses
export const autoAssignExtensionCourses = async (req, res) => {
  try {
    const {
      year,
      semester,
      assignedBy,
      instructors: instructorIds,
      courses: frontendCourses,
    } = req.body;

    if (
      !year ||
      !semester ||
      !assignedBy ||
      !instructorIds?.length ||
      !frontendCourses?.length
    ) {
      return res.status(400).json({
        message:
          "Year, semester, assignedBy, instructors, and courses are required.",
      });
    }

    // Check for existing assignment document
    const existingAssignment = await Assignment.findOne({
      year: parseInt(year),
      semester,
      program: "Extension",
    });

    console.log(
      existingAssignment
        ? `Found existing assignment for ${year} ${semester} Extension`
        : `No existing assignment found for ${year} ${semester} Extension`
    );

    // Track existing assignments to avoid duplicates
    const existingCourseAssignments = new Map();
    const duplicateAssignments = [];

    if (existingAssignment) {
      existingAssignment.assignments.forEach(assignment => {
        const key = `${assignment.courseId}-${assignment.section}-${assignment.instructorId}`;
        existingCourseAssignments.set(key, true);
      });
      console.log(`Found ${existingCourseAssignments.size} existing course assignments`);
    }

    const courseIds = frontendCourses.map((course) => course.courseId);
    const courseObjectIds = courseIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (courseObjectIds.length === 0) {
      return res.status(400).json({ message: "No valid course IDs provided." });
    }

    const instructors = await User.find({
      _id: { $in: instructorIds },
      role: "Instructor",
    });
    const courses = await Course.find({ _id: { $in: courseObjectIds } });
    if (!instructors.length)
      return res.status(404).json({ message: "No valid instructors found." });
    if (!courses.length)
      return res.status(404).json({ message: "No valid courses found." });

    let finalAssignments = [];

    const equivalentSemester =
      semester === "Extension 1"
        ? "Regular 1"
        : semester === "Extension 2"
        ? "Regular 2"
        : semester;

    console.log("\n===== STARTING AUTO ASSIGNMENT =====\n");

    for (const frontendCourse of frontendCourses) {
      const { courseId, section, labDivision } = frontendCourse;
      const course = courses.find((c) => c._id.toString() === courseId);
      if (!course) continue;

      // Check if this course-section assignment already exists for any instructor
      let isDuplicate = false;
      for (const instructor of instructors) {
        const assignmentKey = `${courseId}-${section}-${instructor._id}`;
        if (existingCourseAssignments.has(assignmentKey)) {
          console.log(`Assignment ${assignmentKey} already exists, skipping entire course`);
          duplicateAssignments.push({
            course: course.name,
            section,
            instructor: instructor.fullName || instructor.name
          });
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) continue;

      let instructorBenefits = [];

      for (let instructor of instructors) {
        let instructorRecord =
          (await Instructor.findOne({ userId: instructor._id })) ||
          new Instructor({
            userId: instructor._id,
            assignedCourses: [],
            workload: [],
          });

        let position = await Position.findOne({ name: instructor.position });
        let exemption = position ? position.exemption : 0;
        let expectedLoad = 12 - exemption;

        let creditHour =
          course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
        if (course.numberOfStudents > 25) {
          creditHour =
            course.lecture +
            2 * ((2 / 3) * course.lab) +
            2 * ((2 / 3) * course.tutorial);
        }
        let workload = creditHour * (labDivision === "Yes" ? 2 : 1);

        let existingRegularWorkload = instructorRecord.workload.find(
          (w) => w.year === year && w.semester === equivalentSemester
        );

        let existingExtensionWorkload = instructorRecord.workload.find(
          (w) =>
            w.year === year &&
            w.semester === semester &&
            w.program === "Extension"
        );

        let totalExistingWorkload = existingRegularWorkload?.value || 0;
        let totalWorkload = totalExistingWorkload + workload;
        let overload = totalWorkload - expectedLoad;
        let benefit =
          (overload <= 3 ? 0 : (overload - 3) * 0.942) +
          (existingExtensionWorkload?.value || 0);

        // Count instructor's experience with this course
        const experienceYears = instructorRecord.assignedCourses.filter(
          (ac) => ac.course.toString() === course._id.toString()
        ).length;

        console.log(
          `Instructor: ${instructor.fullName} (ID: ${instructor._id})`
        );
        console.log(`  - Expected Load: ${expectedLoad}`);
        console.log(`  - Current Workload: ${totalWorkload}`);
        console.log(`  - Overload: ${overload}`);
        console.log(`  - Benefit: ${benefit.toFixed(3)}\n`);
        instructorBenefits.push({
          instructorId: instructor._id,
          instructorRecord,
          courseId: course._id,
          section,
          labDivision,
          workload,
          benefit,
          experienceYears,
          existingExtensionWorkload,
          expectedLoad,
          totalWorkload,
          overload,
        });
      }

      const minBenefit = Math.min(
        ...instructorBenefits.map((ib) => ib.benefit)
      );
      const bestInstructors = instructorBenefits.filter(
        (ib) => ib.benefit === minBenefit
      );

      let selectedInstructor =
        bestInstructors.length > 1
          ? bestInstructors[Math.floor(Math.random() * bestInstructors.length)]
          : bestInstructors[0];

      // Check if this specific instructor assignment is a duplicate
      const assignmentKey = `${courseId}-${section}-${selectedInstructor.instructorId}`;
      if (existingCourseAssignments.has(assignmentKey)) {
        console.log(`Selected assignment ${assignmentKey} is a duplicate, skipping`);
        continue;
      }

      if (selectedInstructor.existingExtensionWorkload) {
        selectedInstructor.existingExtensionWorkload.value +=
          selectedInstructor.workload;
      } else {
        selectedInstructor.instructorRecord.workload.push({
          year,
          semester,
          program: "Extension",
          value: selectedInstructor.workload,
        });
      }

      await selectedInstructor.instructorRecord.save();

      // Generate assignment reason
      const assignmentReason =
        `Assigned based on minimum benefit value (${selectedInstructor.benefit.toFixed(
          2
        )}). ` +
        `Expected workload: ${selectedInstructor.expectedLoad} hrs. ` +
        `Current workload: ${selectedInstructor.totalWorkload.toFixed(
          1
        )} hrs. ` +
        `Overload: ${selectedInstructor.overload.toFixed(1)} hrs. ` +
        `${
          selectedInstructor.experienceYears > 0
            ? `Instructor has ${selectedInstructor.experienceYears} year${
                selectedInstructor.experienceYears !== 1 ? "s" : ""
              } of experience teaching this course. `
            : ""
        }` +
        `${
          bestInstructors.length > 1
            ? "Selected randomly from multiple instructors with equal benefit value."
            : ""
        }`;

      finalAssignments.push({
        instructorId: selectedInstructor.instructorId,
        courseId: selectedInstructor.courseId,
        section: selectedInstructor.section,
        labDivision: selectedInstructor.labDivision,
        workload: selectedInstructor.workload,
        // Assignment reasoning data
        score: -selectedInstructor.benefit, // Negative since lower benefit is better
        experienceYears: selectedInstructor.experienceYears,
        assignmentReason,
      });

      // Add to map to prevent duplicate assignments in the same batch
      existingCourseAssignments.set(assignmentKey, true);
    }

    // If no valid assignments to add, return with message about duplicates
    if (finalAssignments.length === 0 && duplicateAssignments.length > 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    // Save assignments - either create new document or update existing one
    if (finalAssignments.length > 0) {
      if (existingAssignment) {
        existingAssignment.assignments.push(...finalAssignments);
        await existingAssignment.save();
        console.log(`Updated existing assignment with ${finalAssignments.length} new assignments`);
      } else {
        await Assignment.create({
          year,
          semester,
          program: "Extension",
          assignedBy,
          assignments: finalAssignments,
        });
        console.log(`Created new assignment with ${finalAssignments.length} assignments`);
      }
    }

    console.log("\n===== ASSIGNMENT COMPLETED SUCCESSFULLY =====\n");

    // Prepare response
    const response = {
      message: "Automatic assignment completed successfully!",
      assignments: finalAssignments,
    };

    // Add warning if duplicates were found
    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped because they already exist";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in auto assignment:", error);
    res.status(500).json({ message: "Error in auto assignment", error });
  }
};

// Automatic Assignment for Summer Courses
export const autoAssignSummerCourses = async (req, res) => {
  try {
    const {
      year,
      assignedBy,
      instructors: instructorIds,
      courses: frontendCourses,
    } = req.body;

    if (
      !year ||
      !assignedBy ||
      !instructorIds?.length ||
      !frontendCourses?.length
    ) {
      return res.status(400).json({
        message: "Year, assignedBy, instructors, and courses are required.",
      });
    }

    // Check for existing assignment document
    const existingAssignment = await Assignment.findOne({
      year: parseInt(year),
      semester: "Summer",
      program: "Summer",
    });

    console.log(
      existingAssignment
        ? `Found existing assignment for ${year} Summer`
        : `No existing assignment found for ${year} Summer`
    );

    // Track existing assignments to avoid duplicates
    const existingCourseAssignments = new Map();
    const duplicateAssignments = [];

    if (existingAssignment) {
      existingAssignment.assignments.forEach(assignment => {
        const key = `${assignment.courseId}-${assignment.section}-${assignment.instructorId}`;
        existingCourseAssignments.set(key, true);
      });
      console.log(`Found ${existingCourseAssignments.size} existing course assignments`);
    }

    const courseIds = frontendCourses.map((course) => course.courseId);
    const courseObjectIds = courseIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (courseObjectIds.length === 0) {
      return res.status(400).json({ message: "No valid course IDs provided." });
    }

    const instructors = await User.find({
      _id: { $in: instructorIds },
      role: "Instructor",
    });
    const courses = await Course.find({ _id: { $in: courseObjectIds } });
    if (!instructors.length)
      return res.status(404).json({ message: "No valid instructors found." });
    if (!courses.length)
      return res.status(404).json({ message: "No valid courses found." });

    let assignments = [];
    let benefitMap = new Map();

    for (const frontendCourse of frontendCourses) {
      const { courseId, section, labDivision } = frontendCourse;
      const course = courses.find((c) => c._id.toString() === courseId);
      if (!course) continue;

      // Check if this course-section assignment already exists for any instructor
      let isDuplicate = false;
      for (const instructor of instructors) {
        const assignmentKey = `${courseId}-${section}-${instructor._id}`;
        if (existingCourseAssignments.has(assignmentKey)) {
          console.log(`Assignment ${assignmentKey} already exists, skipping entire course`);
          duplicateAssignments.push({
            course: course.name,
            section,
            instructor: instructor.fullName || instructor.name
          });
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) continue;

      for (let instructor of instructors) {
        let instructorRecord = await Instructor.findOne({
          userId: instructor._id,
        });
        if (!instructorRecord) {
          instructorRecord = new Instructor({
            userId: instructor._id,
            assignedCourses: [],
            workload: [],
          });
        }

        let position = await Position.findOne({ name: instructor.position });
        let exemption = position ? position.exemption : 0;
        let expectedLoad = 12 - exemption;

        let creditHour =
          course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
        if (course.numberOfStudents > 25) {
          creditHour =
            course.lecture +
            2 * ((2 / 3) * course.lab) +
            2 * ((2 / 3) * course.tutorial);
        }
        let workload = creditHour * (labDivision === "Yes" ? 2 : 1);

        let existingWorkloads = instructorRecord.workload.filter((w) =>
          ["Regular 1", "Regular 2"].includes(w.semester)
        );
        let totalExistingWorkload = existingWorkloads.reduce(
          (sum, w) => sum + w.value,
          0
        );

        let extensionWorkloads = instructorRecord.workload.filter((w) =>
          ["Extension 1", "Extension 2", "Summer"].includes(w.semester)
        );
        let totalExtensionWorkload = extensionWorkloads.reduce(
          (sum, w) => sum + w.value,
          0
        );

        let existingSummerWorkload = instructorRecord.workload.find(
          (w) => w.year === year && w.program === "Summer"
        );
        let totalWorkload =
          totalExistingWorkload +
          (existingSummerWorkload
            ? existingSummerWorkload.value + workload
            : workload);
        let overload = totalWorkload - expectedLoad;
        let benefit =
          ["Regular 1", "Regular 2"].includes(course.semester) && overload > 3
            ? (overload - 3) * 0.942
            : 0;

        // Add extension and summer workload to benefit
        let totalBenefit = benefit + totalExtensionWorkload;
        let isChair = false;
        if (course.chair === instructor._id.toString()) {
          totalBenefit += 2; // Bonus for being chair
          isChair = true;
        }

        // Count instructor's experience with this course
        const experienceYears = instructorRecord.assignedCourses.filter(
          (ac) => ac.course.toString() === course._id.toString()
        ).length;

        console.log(
          `Instructor: ${instructor.fullName} (ID: ${instructor._id})`
        );
        console.log(`  - Expected Load: ${expectedLoad}`);
        console.log(`  - Current Workload: ${totalWorkload}`);
        console.log(`  - Overload: ${overload}`);
        console.log(`  - Benefit: ${totalBenefit.toFixed(3)}\n`);

        instructorRecord.workload.push({
          year,
          semester: "Summer",
          program: "Summer",
          value: workload,
        });
        await instructorRecord.save();

        // Store course-instructor pairing with the benefit value and additional information
        if (!benefitMap.has(courseId)) {
          benefitMap.set(courseId, []);
        }
        benefitMap.get(courseId).push({
          instructorId: instructor._id,
          courseId: course._id,
          section,
          labDivision,
          workload,
          benefit: totalBenefit,
          expectedLoad,
          totalWorkload,
          overload,
          experienceYears,
          isChair,
        });
      }
    }

    // For each course, assign to the instructor with the minimum benefit
    // If multiple instructors have the same benefit, randomly select one
    for (const [courseId, instructorList] of benefitMap.entries()) {
      // Sort by benefit in ascending order
      instructorList.sort((a, b) => a.benefit - b.benefit);

      // Get the minimum benefit value
      const minBenefit = instructorList[0].benefit;

      // Filter all instructors who have this minimum benefit
      const instructorsWithMinBenefit = instructorList.filter(
        (instructor) => instructor.benefit === minBenefit
      );

      // Randomly select one instructor from those with min benefit
      const selectedIndex = Math.floor(
        Math.random() * instructorsWithMinBenefit.length
      );
      const selectedInstructor = instructorsWithMinBenefit[selectedIndex];

      // Check if this specific instructor assignment is a duplicate
      const assignmentKey = `${selectedInstructor.courseId}-${selectedInstructor.section}-${selectedInstructor.instructorId}`;
      if (existingCourseAssignments.has(assignmentKey)) {
        console.log(`Selected assignment ${assignmentKey} is a duplicate, skipping`);
        continue;
      }

      // Generate assignment reason
      const assignmentReason =
        `Assigned based on minimum benefit value (${selectedInstructor.benefit.toFixed(
          2
        )}). ` +
        `Expected workload: ${selectedInstructor.expectedLoad} hrs. ` +
        `Current workload: ${selectedInstructor.totalWorkload.toFixed(
          1
        )} hrs. ` +
        `Overload: ${selectedInstructor.overload.toFixed(1)} hrs. ` +
        `${
          selectedInstructor.experienceYears > 0
            ? `Instructor has ${selectedInstructor.experienceYears} year${
                selectedInstructor.experienceYears !== 1 ? "s" : ""
              } of experience teaching this course. `
            : ""
        }` +
        `${
          selectedInstructor.isChair
            ? "Instructor is the chair of this course (additional consideration). "
            : ""
        }` +
        `${
          instructorsWithMinBenefit.length > 1
            ? "Selected randomly from " +
              instructorsWithMinBenefit.length +
              " instructors with equal benefit value."
            : ""
        }`;

      // Add the assignment reason to the selected instructor
      selectedInstructor.assignmentReason = assignmentReason;

      // Add score data
      selectedInstructor.score = -selectedInstructor.benefit; // Negative since lower benefit is better

      assignments.push(selectedInstructor);

      // Add to map to prevent duplicate assignments in the same batch
      existingCourseAssignments.set(assignmentKey, true);
    }

    // If no valid assignments to add, return with message about duplicates
    if (assignments.length === 0 && duplicateAssignments.length > 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    // Save assignments - either create new document or update existing one
    if (assignments.length > 0) {
      if (existingAssignment) {
        existingAssignment.assignments.push(...assignments);
        await existingAssignment.save();
        console.log(`Updated existing assignment with ${assignments.length} new assignments`);
      } else {
        await Assignment.create({
          year,
          semester: "Summer",
          program: "Summer",
          assignedBy,
          assignments,
        });
        console.log(`Created new assignment with ${assignments.length} assignments`);
      }
    }

    // Prepare response
    const response = {
      message: "Automatic assignment completed successfully!",
      assignments,
    };

    // Add warning if duplicates were found
    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped because they already exist";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in auto assignment:", error);
    res.status(500).json({ message: "Error in auto assignment", error });
  }
};
