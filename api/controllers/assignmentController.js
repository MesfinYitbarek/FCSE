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

    const bulkAssignments = [];

    // Process each assignment
    for (const assignment of assignments) {
      const { instructorId, courseId, section, labDivision } = assignment;

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

      // Add assignment to bulkAssignments array
      bulkAssignments.push({
        instructorId,
        courseId,
        section,
        labDivision,
        workload,
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

    // Create a new Assignment document with all assignments
    const newAssignment = new Assignment({
      year,
      semester,
      program,
      assignedBy,
      assignments: bulkAssignments,
    });

    // Save the new Assignment document
    await newAssignment.save();

    // Send success response
    res.status(201).json({
      message: "Courses assigned successfully",
      assignments: bulkAssignments,
    });
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

    const bulkAssignments = [];

    // Process each assignment
    for (const assignment of assignments) {
      const { instructorId, courseId, section, labDivision } = assignment;

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

      // Add assignment to bulkAssignments array
      bulkAssignments.push({
        instructorId,
        courseId,
        section,
        labDivision,
        workload,
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

    // Create a new Assignment document with all assignments
    const newAssignment = new Assignment({
      year,
      semester,
      program,
      assignedBy,
      assignments: bulkAssignments,
    });

    // Save the new Assignment document
    await newAssignment.save();

    // Send success response
    res.status(201).json({
      message: "Courses assigned successfully",
      assignments: bulkAssignments,
    });
  } catch (error) {
    console.error("Error in manual assignment:", error);
    res.status(500).json({ message: "Error in manual assignment", error });
  }
};

// Automatic Assignment for Common Courses
export const autoAssignCommonCourses = async (req, res) => {
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

    if (courses.length === 0)
      return res.status(404).json({ message: "No valid courses found." });
    if (instructors.length === 0)
      return res.status(404).json({ message: "No valid instructors found." });

    // Fetch all instructor workload records at once
    const instructorRecords = await Instructor.find({
      userId: { $in: instructors.map((i) => i._id) },
    });

    let assignments = [];

    for (const frontendCourse of frontendCourses) {
      const { courseId, section, labDivision } = frontendCourse;
      const course = courses.find((c) => c._id.toString() === courseId);
      if (!course) continue;

      // Get workloads for all instructors and sort
      const instructorWorkloads = await Promise.all(
        instructors.map(async (instructor) => {
          const record =
            instructorRecords.find(
              (r) => r.userId.toString() === instructor._id.toString()
            ) || {};
          const workloadEntry =
            record.workload?.find(
              (w) => w.year === year && w.semester === semester
            ) || {};
          return {
            instructor,
            workload: workloadEntry.value || 0,
            locationPriority: instructor.location === course.location ? -1 : 1,
          };
        })
      );
   console.log(instructorWorkloads)
      instructorWorkloads.sort(
        (a, b) =>
          a.workload + a.locationPriority - (b.workload + b.locationPriority)
      );

      // Pick the best instructor
      const bestInstructorData = instructorWorkloads[0];
      if (!bestInstructorData) continue;
      const bestInstructor = bestInstructorData.instructor;

      // Fetch or create the instructor's workload record
      let instructorRecord = instructorRecords.find(
        (r) => r.userId.toString() === bestInstructor._id.toString()
      );

      if (!instructorRecord) {
        instructorRecord = new Instructor({
          userId: bestInstructor._id,
          assignedCourses: [],
          workload: [],
        });
        instructorRecords.push(instructorRecord); // Add to array to avoid re-fetching
      }

      // Calculate workload
      let workload =
        course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      if (labDivision === "Yes") {
        workload += (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }

      // Update workload for the instructor
      const existingWorkload = instructorRecord.workload.find(
        (w) =>
          w.year === year && w.semester === semester && w.program === "Regular"
      );

      if (existingWorkload) {
        existingWorkload.value += workload;
      } else {
        instructorRecord.workload.push({
          year,
          semester,
          program: "Regular",
          value: workload,
        });
      }

      await instructorRecord.save();

      // Save assignment details
      assignments.push({
        instructorId: bestInstructor._id,
        courseId: course._id,
        section,
        labDivision,
        workload,
      });
    }

    if (assignments.length > 0) {
      const newAssignment = new Assignment({
        year,
        semester,
        program: "Regular",
        assignedBy,
        assignments,
      });

      await newAssignment.save();
    }

    res.status(201).json({
      message:
        "Automatic assignment for common courses completed successfully.",
      assignments,
    });
  } catch (error) {
    console.error("Error in auto assignment:", error);
    res.status(500).json({ message: "Error in auto assignment", error });
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
          (overload <= 3
            ? 0
            : (overload - 3) * 0.942) + (existingExtensionWorkload?.value || 0);
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
          existingExtensionWorkload,
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

      finalAssignments.push({
        instructorId: selectedInstructor.instructorId,
        courseId: selectedInstructor.courseId,
        section: selectedInstructor.section,
        labDivision: selectedInstructor.labDivision,
        workload: selectedInstructor.workload,
      });
    }

    const existingAssignment = await Assignment.findOne({
      year,
      semester,
      program: "Extension",
    });

    if (existingAssignment) {
      existingAssignment.assignments.push(...finalAssignments);
      await existingAssignment.save();
    } else {
      await Assignment.create({
        year,
        semester,
        program: "Extension",
        assignedBy,
        assignments: finalAssignments,
      });
    }

    console.log("\n===== ASSIGNMENT COMPLETED SUCCESSFULLY =====\n");

    res.status(201).json({
      message: "Automatic assignment completed successfully!",
      assignments: finalAssignments,
    });
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
        let totalExistingWorkload = existingWorkloads.reduce((sum, w) => sum + w.value, 0);

        let extensionWorkloads = instructorRecord.workload.filter((w) =>
          ["Extension 1", "Extension 2", "Summer"].includes(w.semester)
        );
        let totalExtensionWorkload = extensionWorkloads.reduce((sum, w) => sum + w.value, 0);

        let existingSummerWorkload = instructorRecord.workload.find(
          (w) => w.year === year && w.program === "Summer"
        );
        let totalWorkload = totalExistingWorkload + (existingSummerWorkload ? existingSummerWorkload.value + workload : workload);
        let overload = totalWorkload - expectedLoad;
        let benefit = ["Regular 1", "Regular 2"].includes(course.semester) && overload > 3 ? (overload - 3) * 0.942 : 0;

        // Add extension and summer workload to benefit
        let totalBenefit = benefit + totalExtensionWorkload;
        if (course.chair === instructor._id.toString()) {
          totalBenefit += 2; // Bonus for being chair
        }
        console.log(`Instructor: ${instructor.fullName} (ID: ${instructor._id})`);
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

        // Store course-instructor pairing with the benefit value
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
        instructor => instructor.benefit === minBenefit
      );
      
      // Randomly select one instructor from those with min benefit
      const selectedInstructor = 
        instructorsWithMinBenefit[Math.floor(Math.random() * instructorsWithMinBenefit.length)];
      
      assignments.push(selectedInstructor);
    }

    if (assignments.length > 0) {
      await Assignment.create({
        year,
        semester: "Summer",
        program: "Summer",
        assignedBy,
        assignments,
      });
    }

    res.status(201).json({
      message: "Automatic assignment completed successfully!",
      assignments,
    });
  } catch (error) {
    console.error("Error in auto assignment:", error);
    res.status(500).json({ message: "Error in auto assignment", error });
  }
};


// Update an Assignment
// PUT /assignments/sub/:parentId/:subId
export const updateAssignment = async (req, res) => {
  try {
    const { parentId, subId } = req.params;
    
    // Validate both IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(subId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    // Find parent assignment
    const parentAssignment = await Assignment.findById(parentId);
    if (!parentAssignment) {
      return res.status(404).json({ message: "Parent assignment not found" });
    }
    
    // Find sub-assignment
    const subAssignmentIndex = parentAssignment.assignments.findIndex(
      sub => sub._id.toString() === subId
    );
    
    if (subAssignmentIndex === -1) {
      return res.status(404).json({ message: "Sub-assignment not found" });
    }

    // Get the old values to calculate workload changes
    const oldAssignment = parentAssignment.assignments[subAssignmentIndex];
    const { instructorId, courseId, labDivision } = req.body;
    let updatedWorkload = oldAssignment.workload;

    // Recalculate workload if needed
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: `Course not found for ID: ${courseId}` });
      }

      if (labDivision === "Yes") {
        updatedWorkload = course.lecture + 2 * ((2 / 3) * course.lab) + 2 * ((2 / 3) * course.tutorial);
      } else {
        updatedWorkload = course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }
      updatedWorkload = Math.round(updatedWorkload * 100) / 100;
    }

    // Update the sub-assignment
    parentAssignment.assignments[subAssignmentIndex] = {
      ...parentAssignment.assignments[subAssignmentIndex].toObject(),
      ...req.body,
      workload: updatedWorkload,
      _id: subId // Keep the original ID
    };

    // Save the parent document
    await parentAssignment.save();

    // Populate data for response
    await parentAssignment.populate('assignments.instructorId assignments.courseId');

    // Also update the instructor workload if needed
    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
      // Handle instructor workload update similar to your existing code
      const instructor = await Instructor.findById(instructorId);
      if (instructor) {
        // Update workload logic here...
      }
    }

    res.json({
      message: "Assignment updated successfully",
      assignment: parentAssignment.assignments[subAssignmentIndex]
    });
  } catch (error) {
    console.error("Error updating sub-assignment:", error);
    res.status(500).json({ message: "Error updating sub-assignment", error });
  }
};

// Delete an Assignment
// DELETE /assignments/sub/:parentId/:subId
export const deleteAssignment = async (req, res) => {
  try {
    const { parentId, subId } = req.params;
    
    // Validate both IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(subId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    // Find parent assignment
    const parentAssignment = await Assignment.findById(parentId);
    if (!parentAssignment) {
      return res.status(404).json({ message: "Parent assignment not found" });
    }
    
    // Find sub-assignment
    const subAssignmentIndex = parentAssignment.assignments.findIndex(
      sub => sub._id.toString() === subId
    );
    
    if (subAssignmentIndex === -1) {
      return res.status(404).json({ message: "Sub-assignment not found" });
    }

    // Get the sub-assignment before removing it
    const subAssignment = parentAssignment.assignments[subAssignmentIndex];
    
    // Remove sub-assignment from the array
    parentAssignment.assignments.splice(subAssignmentIndex, 1);
    
    // If the parent has no more sub-assignments, delete the parent too
    if (parentAssignment.assignments.length === 0) {
      await Assignment.findByIdAndDelete(parentId);
    } else {
      // Otherwise save the parent with the sub-assignment removed
      await parentAssignment.save();
    }

    // Update instructor workload if needed
    if (subAssignment.instructorId && mongoose.Types.ObjectId.isValid(subAssignment.instructorId)) {
      // Handle instructor workload update similar to your existing code
      const instructor = await Instructor.findById(subAssignment.instructorId);
      if (instructor) {
        // Update workload logic here...
      }
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting sub-assignment:", error);
    res.status(500).json({ message: "Error deleting sub-assignment", error });
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

export const getAutomaticAssignments = async (req, res) => {
  try {
    console.log("Received Query Params:", req.query);

    const { year, semester, program, assignedBy } = req.query;

    let assignedByFilter = assignedBy;
    if (assignedBy === "COC") {
      assignedByFilter = { $in: ["Programming", "Software", "Database", "Networking","COC"] };
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

    res.status(200).json({ assignments });
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

export const getAssignmentsByFilters = async (req, res) => {
  try {
    const { year, semester, program } = req.query;

    // ✅ Validate required filters
    if (!year || !semester || !program) {
      return res
        .status(400)
        .json({ message: "Year, semester, and program are required" });
    }

    // ✅ Convert year to a number for strict comparison
    const numericYear = Number(year);
    if (isNaN(numericYear)) {
      return res.status(400).json({ message: "Year must be a valid number" });
    }

    // ✅ Query assignments based on filters
    const assignments = await Assignment.find({
      year: numericYear,
      semester,
      program,
    })
      .populate("instructorId", "userId name") // Fetch instructor details
      .populate("courseId", "name"); // Fetch course details

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Error fetching assignments", error });
  }
};

export const runAutomaticAssignment = async (req, res) => {
  try {
    const { year, semester, program, assignedBy } = req.body;

    if (!year || !semester || !program || !assignedBy) {
      return res.status(400).json({
        message: "Year, semester, program, and assignedBy are required.",
      });
    }

    const preferenceForm = await PreferenceForm.findOne({
      chair: assignedBy,
      year,
      semester,
    });
    if (!preferenceForm) {
      return res.status(404).json({
        message:
          "No preference form found for the specified chair, year, and semester.",
      });
    }

    const allowedCourseIds = preferenceForm.courses.map((id) => id.toString());
    const preferences = await Preference.find({
      preferenceFormId: preferenceForm._id,
    })
      .populate("instructorId")
      .populate("preferences.courseId");

    const preferenceWeights = await PreferenceWeight.findOne();
    const experienceWeights = await CourseExperienceWeight.findOne();
    let assignedCourses = [];
    let instructorAssigned = new Set();

    const calculateScore = (preferenceRank, yearsExperience) => {
      let preferenceScore =
        preferenceWeights?.weights?.find((w) => w.rank === preferenceRank)
          ?.weight || 0;
      let experienceScore =
        experienceWeights?.yearsExperience?.find(
          (y) => y.years === yearsExperience
        )?.weight || 0;
      return preferenceScore + experienceScore;
    };

    let courseAssignments = {};
    for (let preference of preferences) {
      for (let { courseId, rank } of preference.preferences) {
        if (!mongoose.Types.ObjectId.isValid(courseId)) continue;
        courseId = new mongoose.Types.ObjectId(courseId);
        if (!allowedCourseIds.includes(courseId.toString())) continue;

        if (!courseAssignments[courseId]) courseAssignments[courseId] = [];
        const instructorId = preference.instructorId._id;
        let instructor = await Instructor.findOne({
          userId: instructorId,
        }).populate("assignedCourses");
        let experienceYears =
          instructor?.assignedCourses?.filter((c) =>
            c.courseId.equals(courseId)
          ).length || 0;
        let score = calculateScore(rank, experienceYears);

        courseAssignments[courseId].push({
          instructorId,
          score,
          submittedAt: preference.submittedAt,
        });
      }
    }

    for (let courseId in courseAssignments) {
      courseAssignments[courseId].sort(
        (a, b) => b.score - a.score || a.submittedAt - b.submittedAt
      );
      for (let candidate of courseAssignments[courseId]) {
        if (!instructorAssigned.has(candidate.instructorId)) {
          assignedCourses.push({
            instructorId: candidate.instructorId,
            courseId,
          });
          instructorAssigned.add(candidate.instructorId);
          break;
        }
      }
    }

    for (let courseId in courseAssignments) {
      if (!assignedCourses.some((a) => a.courseId.toString() === courseId)) {
        let selectedInstructor = courseAssignments[courseId][0]?.instructorId;
        if (selectedInstructor) {
          assignedCourses.push({ instructorId: selectedInstructor, courseId });
        }
      }
    }

    let assignmentData = {
      year,
      semester,
      program,
      assignments: [],
      assignedBy,
    };

    for (const assignment of assignedCourses) {
      const { instructorId, courseId } = assignment;
      const course = await Course.findById(courseId);
      if (!course) continue;

      let workload =
        course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      workload = Math.round(workload * 100) / 100;

      assignmentData.assignments.push({
        instructorId,
        courseId,
        section: "",
        NoOfSections: 1,
        labDivision: "No",
        workload,
      });

      let instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) continue;

      const existingWorkloadIndex = instructor.workload.findIndex(
        (entry) =>
          entry.year === year &&
          entry.semester === semester &&
          entry.program === program
      );

      if (existingWorkloadIndex !== -1) {
        instructor.workload[existingWorkloadIndex].value += workload;
      } else {
        instructor.workload.push({ year, semester, program, value: workload });
      }

      await instructor.save();
    }

    await Assignment.create(assignmentData);
    res.json({
      message: "Courses assigned successfully",
      assignment: assignmentData,
    });
  } catch (error) {
    console.error("Error in automatic assignment:", error);
    res.status(500).json({ message: "Error in automatic assignment", error });
  }
};
