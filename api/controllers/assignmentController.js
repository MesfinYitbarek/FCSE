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

    if (!assignments || assignments.length === 0) {
      return res.status(400).json({ message: "At least one assignment is required" });
    }

    let existingAssignment = await Assignment.findOne({
      year,
      semester,
      program
    });

    const bulkAssignments = [];
    const duplicateAssignments = [];

    for (const assignment of assignments) {
      const {
        instructorId,
        courseId,
        section,
        labDivision,
        NoOfSections = 1, // ✅ Default to 1 if not provided
        assignmentReason
      } = assignment;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: `Invalid courseId: ${courseId}` });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: `Course not found for ID: ${courseId}` });
      }

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
          continue;
        }
      }

      // ✅ Calculate base workload
      let workload;
      if (labDivision === "Yes") {
        workload =
          course.lecture + 2 * ((2 / 3) * course.lab) + 2 * ((2 / 3) * course.tutorial);
      } else {
        workload = course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }

      workload = Math.round(workload * 100) / 100;

      // ✅ Multiply by noOfSections
      const totalWorkload = Math.round(workload * NoOfSections * 100) / 100;

      bulkAssignments.push({
        instructorId,
        courseId,
        section,
        labDivision,
        workload: totalWorkload,
        assignmentReason: assignmentReason || "",
        NoOfSections // optionally store this if you want to see how many sections were used
      });

      const instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) {
        return res.status(404).json({ message: `Instructor not found for ID: ${instructorId}` });
      }

      const existingWorkloadIndex = instructor.workload.findIndex(
        entry =>
          entry.year === year &&
          entry.semester === semester &&
          entry.program === program
      );

      if (existingWorkloadIndex !== -1) {
        instructor.workload[existingWorkloadIndex].value += totalWorkload;
      } else {
        instructor.workload.push({
          year,
          semester,
          program,
          value: totalWorkload,
        });
      }

      await instructor.save();
    }

    if (bulkAssignments.length === 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    if (existingAssignment) {
      existingAssignment.assignments.push(...bulkAssignments);
      await existingAssignment.save();
    } else {
      existingAssignment = new Assignment({
        year,
        semester,
        program,
        assignedBy,
        assignments: bulkAssignments,
      });
      await existingAssignment.save();
    }

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

    if (!assignments || assignments.length === 0) {
      return res.status(400).json({ message: "At least one assignment is required" });
    }

    let existingAssignment = await Assignment.findOne({ year, semester, program });

    const bulkAssignments = [];
    const duplicateAssignments = [];

    for (const assignment of assignments) {
      const {
        instructorId,
        courseId,
        section,
        labDivision,
        NoOfSections = 1, // ✅ Default to 1
        assignmentReason
      } = assignment;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: `Invalid courseId: ${courseId}` });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: `Course not found for ID: ${courseId}` });
      }

      // ✅ Check for duplicates
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
          continue;
        }
      }

      // ✅ Base workload calculation
      let workload;
      if (labDivision === "Yes") {
        workload = course.lecture + 2 * ((2 / 3) * course.lab) + 2 * ((2 / 3) * course.tutorial);
      } else {
        workload = course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }

      // ✅ Final workload = base * noOfSections
      workload = Math.round(workload * NoOfSections * 100) / 100;

      // ✅ Push to bulk assignments
      bulkAssignments.push({
        instructorId,
        courseId,
        section,
        labDivision,
        workload,
        assignmentReason: assignmentReason || "",
        NoOfSections
      });

      // ✅ Update instructor workload
      const instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) {
        return res.status(404).json({ message: `Instructor not found for ID: ${instructorId}` });
      }

      const existingWorkloadIndex = instructor.workload.findIndex(
        (entry) =>
          entry.year === year &&
          entry.semester === semester &&
          entry.program === program
      );

      if (existingWorkloadIndex !== -1) {
        instructor.workload[existingWorkloadIndex].value += workload;
      } else {
        instructor.workload.push({
          year,
          semester,
          program,
          value: workload
        });
      }

      await instructor.save();
    }

    if (bulkAssignments.length === 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments
      });
    }

    if (existingAssignment) {
      existingAssignment.assignments.push(...bulkAssignments);
      await existingAssignment.save();
    } else {
      existingAssignment = new Assignment({
        year,
        semester,
        program,
        assignedBy,
        assignments: bulkAssignments
      });
      await existingAssignment.save();
    }

    const response = {
      message: "Courses assigned successfully",
      assignments: bulkAssignments
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


export const updateAssignment = async (req, res) => {
  try {
    const { parentId, subId } = req.params;
    const { instructorId, courseId, labDivision, assignmentReason, NoOfSections } = req.body;

    if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(subId)) {
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

    const oldAssignment = parentAssignment.assignments[subAssignmentIndex];
    const oldInstructorId = oldAssignment.instructorId;
    const oldWorkload = oldAssignment.workload;
    const oldLabDivision = String(oldAssignment.labDivision || "No");
    const oldNoOfSections = oldAssignment.NoOfSections || 1;

    const updatedLabDivision = labDivision !== undefined ? labDivision : oldLabDivision;
    const updatedNoOfSections = NoOfSections !== undefined ? parseInt(NoOfSections) : oldNoOfSections;
    const isLabChanged = updatedLabDivision !== oldLabDivision;
    const isCourseChanged = courseId && courseId !== oldAssignment.courseId.toString();
    const isNoOfSectionsChanged = updatedNoOfSections !== oldNoOfSections;

    let newWorkload = oldWorkload;

    // Recalculate workload if necessary
    if (isCourseChanged || isLabChanged || isNoOfSectionsChanged) {
      const targetCourseId = courseId || oldAssignment.courseId;
      const course = await Course.findById(targetCourseId);

      if (!course) {
        return res.status(404).json({ message: `Course not found for ID: ${targetCourseId}` });
      }

      if (updatedLabDivision === "Yes") {
        newWorkload =
          course.lecture + 2 * ((2 / 3) * course.lab) + 2 * ((2 / 3) * course.tutorial);
      } else {
        newWorkload =
          course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      }

      newWorkload *= updatedNoOfSections;
      newWorkload = Math.round(newWorkload * 100) / 100;
    }

    const updatedAssignment = { ...oldAssignment.toObject() };
    if (instructorId) updatedAssignment.instructorId = instructorId;
    if (courseId) updatedAssignment.courseId = courseId;
    if (labDivision !== undefined) updatedAssignment.labDivision = labDivision;
    if (assignmentReason !== undefined) updatedAssignment.assignmentReason = assignmentReason;
    if (NoOfSections !== undefined) updatedAssignment.NoOfSections = updatedNoOfSections;
    updatedAssignment.workload = newWorkload;
    updatedAssignment._id = subId;

    parentAssignment.assignments[subAssignmentIndex] = updatedAssignment;

    const isInstructorChanged = instructorId && oldInstructorId.toString() !== instructorId;
    const isWorkloadChanged = newWorkload !== oldWorkload;

    await parentAssignment.save();

    // Instructor workload updates
    if (isInstructorChanged) {
      if (oldInstructorId) {
        const oldInstructor = await Instructor.findById(oldInstructorId);
        if (oldInstructor) {
          const workloadEntry = oldInstructor.workload.find(
            w => w.year === parentAssignment.year &&
              w.semester === parentAssignment.semester &&
              w.program === parentAssignment.program
          );
          if (workloadEntry) {
            workloadEntry.value -= oldWorkload;
            if (workloadEntry.value < 0) workloadEntry.value = 0;
            await oldInstructor.save();
          }
        }
      }

      if (instructorId) {
        const newInstructor = await Instructor.findById(instructorId);
        if (newInstructor) {
          const workloadEntry = newInstructor.workload.find(
            w => w.year === parentAssignment.year &&
              w.semester === parentAssignment.semester &&
              w.program === parentAssignment.program
          );
          if (workloadEntry) {
            workloadEntry.value += newWorkload;
          } else {
            newInstructor.workload.push({
              year: parentAssignment.year,
              semester: parentAssignment.semester,
              program: parentAssignment.program,
              value: newWorkload
            });
          }
          await newInstructor.save();
        }
      }
    } else if (isWorkloadChanged) {
      const instructor = await Instructor.findById(oldInstructorId);
      if (instructor) {
        const workloadEntry = instructor.workload.find(
          w => w.year === parentAssignment.year &&
            w.semester === parentAssignment.semester &&
            w.program === parentAssignment.program
        );

        if (workloadEntry) {
          const delta = newWorkload - oldWorkload;
          workloadEntry.value += delta;
          if (workloadEntry.value < 0) workloadEntry.value = 0;

          await Instructor.updateOne(
            { _id: instructor._id, "workload._id": workloadEntry._id },
            { $set: { "workload.$.value": workloadEntry.value } }
          );
        }
      }
    }

    const updatedParentAssignment = await Assignment.findById(parentId).populate(
      "assignments.instructorId assignments.courseId"
    );

    const updatedSubAssignment = updatedParentAssignment.assignments.find(
      sub => sub._id.toString() === subId
    );

    res.json({
      message: "Assignment updated successfully",
      assignment: updatedSubAssignment,
      workloadChanged: isWorkloadChanged ? {
        old: oldWorkload,
        new: newWorkload,
        difference: newWorkload - oldWorkload
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating sub-assignment", error: error.message });
  }
};


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

    const { instructorId, workload } = subAssignment;
    const { year, semester, program } = parentAssignment;

    parentAssignment.assignments.splice(subAssignmentIndex, 1);

    if (parentAssignment.assignments.length === 0) {
      await Assignment.findByIdAndDelete(parentId);
    } else {
      await parentAssignment.save();
    }

    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
      const instructor = await Instructor.findOne({ userId: instructorId });

      if (instructor) {
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
    res.status(500).json({ message: "Error deleting sub-assignment", error: error.message });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate({
        path: "assignments.instructorId",
        select: "fullName email chair",
        model: "User",
      })
      .populate({
        path: "assignments.courseId",
        select: "name code",
        model: "Course",
      });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments", error });
  }
};

export const getAutomaticAssignments = async (req, res) => {
  try {
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
        model: "User",
      })
      .populate({
        path: "assignments.courseId",
        select: "name code",
        model: "Course",
      });

    const assignmentsWithReasons = assignments.map((assignment) => {
      const updatedAssignments = assignment.assignments.map((a) => {
        const assignmentObj = a.toObject ? a.toObject() : a;

        if (assignmentObj.assignmentReason) {
          return assignmentObj;
        }

        let reasonText = "";

        if (a.preferenceRank) {
          if (a.preferenceRank <= 3) {
            reasonText += `This course was listed as preference #${a.preferenceRank} by the instructor. `;
          } else {
            reasonText += `This course was listed as preference #${a.preferenceRank} (lower priority) by the instructor. `;
          }
        }

        if (a.experienceYears > 0) {
          reasonText += `The instructor has ${a.experienceYears} year${
            a.experienceYears > 1 ? "s" : ""
          } of experience teaching this course. `;
        } else {
          reasonText += `The instructor has no previous experience teaching this course. `;
        }

        if (a.score) {
          reasonText += `Final assignment score: ${a.score.toFixed(2)}`;
        }

        if (!reasonText) {
          reasonText = "Assignment information not available";
        }

        return {
          ...assignmentObj,
          assignmentReason: reasonText,
        };
      });

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
    res.status(500).json({ message: "Error fetching automatic assignments" });
  }
};

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

export const runAutomaticAssignment = async (req, res) => {
  try {
    const { year, semester, program, assignedBy } = req.body;

    if (!year || !semester || !program || !assignedBy) {
      return res.status(400).json({
        message: "Year, semester, program, and assignedBy are required.",
      });
    }

    const existingAssignment = await Assignment.findOne({
      year,
      semester,
      program,
    });

    const preferenceForm = await PreferenceForm.findOne({
      chair: assignedBy,
      year,
      semester,
    }).populate("courses.course");

    if (!preferenceForm) {
      return res.status(404).json({
        message: "No preference form found for the specified chair, year, and semester.",
      });
    }

    const allowedCourses = preferenceForm.courses.map((c) => ({
      courseId: c.course._id.toString(),
      section: c.section,
      NoOfSections: c.NoOfSections,
      labDivision: c.labDivision,
    }));

    const getCourseMeta = (courseId) =>
      allowedCourses.find((c) => c.courseId === courseId.toString());

    const preferences = await Preference.find({
      preferenceFormId: preferenceForm._id,
    })
      .populate("instructorId")
      .populate("preferences.courseId");

    const preferenceWeights = await PreferenceWeight.findOne();
    const experienceWeights = await CourseExperienceWeight.findOne();

    let assignedCourses = [];
    let instructorAssigned = new Set();
    const existingCourseAssignments = new Map();
    let duplicateAssignments = [];

    if (existingAssignment) {
      existingAssignment.assignments.forEach((a) => {
        const key = `${a.courseId}-${a.section}-${a.instructorId}`;
        existingCourseAssignments.set(key, true);
      });
    }

    const calculateScore = (rank, yearsExperience) => {
      const preferenceScore =
        preferenceWeights?.weights?.find((w) => w.rank === rank)?.weight || 0;
      const experienceScore =
        experienceWeights?.yearsExperience?.find((y) => y.years === yearsExperience)
          ?.weight || 0;
      return preferenceScore + experienceScore;
    };

    const getInstructorCourseExperience = async (userId, courseId) => {
      const instructor = await Instructor.findOne({ userId });
      if (!instructor) return 0;
      return instructor.assignedCourses.filter(
        (c) => c.course.toString() === courseId.toString()
      ).length;
    };

    const courseAssignments = {};
    for (const pref of preferences) {
      for (let { courseId, rank } of pref.preferences) {
        if (!mongoose.Types.ObjectId.isValid(courseId)) continue;

        courseId = new mongoose.Types.ObjectId(courseId);
        const meta = getCourseMeta(courseId);
        if (!meta) continue;

        const instructorId = pref.instructorId._id;
        const experienceYears = await getInstructorCourseExperience(instructorId, courseId);
        const score = calculateScore(rank, experienceYears);

        if (!courseAssignments[courseId]) courseAssignments[courseId] = [];
        courseAssignments[courseId].push({
          instructorId,
          score,
          submittedAt: pref.submittedAt,
          instructorName: pref.instructorId.fullName,
          preferenceRank: rank,
          experienceYears,
        });
      }
    }

    for (const courseId in courseAssignments) {
      courseAssignments[courseId].sort((a, b) =>
        b.score - a.score || new Date(a.submittedAt) - new Date(b.submittedAt)
      );
    }

    for (const courseId in courseAssignments) {
      for (const candidate of courseAssignments[courseId]) {
        if (!instructorAssigned.has(candidate.instructorId.toString())) {
          assignedCourses.push({ ...candidate, courseId });
          instructorAssigned.add(candidate.instructorId.toString());
          break;
        }
      }
    }

    for (const courseId in courseAssignments) {
      if (!assignedCourses.some((a) => a.courseId.toString() === courseId)) {
        const fallback = courseAssignments[courseId][0];
        if (fallback) assignedCourses.push({ ...fallback, courseId });
      }
    }

    const finalAssignments = [];
    for (const a of assignedCourses) {
      const { instructorId, courseId, score, preferenceRank, experienceYears } = a;
      const course = await Course.findById(courseId);
      if (!course) continue;

      const meta = getCourseMeta(courseId);
      if (!meta) continue;

      const assignmentKey = `${courseId}-${meta.section}-${instructorId}`;
      if (existingCourseAssignments.has(assignmentKey)) {
        duplicateAssignments.push({
          course: course.name,
          section: meta.section,
          instructor: a.instructorName,
        });
        continue;
      }

      let baseWorkload =
        course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      if (meta.labDivision === "Yes") {
        baseWorkload =
          course.lecture + 2 * ((2 / 3) * course.lab) + 2 * ((2 / 3) * course.tutorial);
      }

      const workload =
        Math.round(baseWorkload * (meta.NoOfSections || 1) * 100) / 100;

      const allCandidates = courseAssignments[courseId.toString()];
      const higherScorers = allCandidates.filter(
        (c) => c.instructorId.toString() !== instructorId.toString() && c.score > score
      );
      const sameScoreEarlier = allCandidates.filter(
        (c) =>
          c.score === score &&
          c.submittedAt < (a.submittedAt || new Date()) &&
          c.instructorId.toString() !== instructorId.toString()
      );

      let reason = `Reason:
- Preference #${preferenceRank}
- ${experienceYears} year(s) experience
- Score: ${score.toFixed(2)}`;

      if (higherScorers.length > 0) {
        reason += `\n- ${higherScorers.length} higher scored instructor(s) already assigned to other courses.`;
      } else if (sameScoreEarlier.length > 0) {
        reason += `\n- Equal score, but earlier submissions were prioritized.`;
      } else {
        reason += `\n- Top scorer available.`;
      }

      finalAssignments.push({
        instructorId,
        courseId,
        section: meta.section,
        NoOfSections: meta.NoOfSections,
        labDivision: meta.labDivision || "No",
        workload,
        score,
        preferenceRank,
        experienceYears,
        assignmentReason: reason,
      });

      const instructor = await Instructor.findOne({ userId: instructorId });
      if (!instructor) continue;

      const workloadEntry = instructor.workload.find(
        (w) =>
          w.year === year &&
          w.semester === semester &&
          w.program === program
      );

      if (workloadEntry) {
        workloadEntry.value += workload;
      } else {
        instructor.workload.push({
          year,
          semester,
          program,
          value: workload,
        });
      }

      await instructor.save();
    }

    if (finalAssignments.length === 0 && duplicateAssignments.length > 0) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program",
        duplicateAssignments,
      });
    }

    let savedAssignment;
    if (existingAssignment) {
      existingAssignment.assignments.push(...finalAssignments);
      savedAssignment = await existingAssignment.save();
    } else {
      savedAssignment = await Assignment.create({
        year,
        semester,
        program,
        assignedBy,
        assignments: finalAssignments,
      });
    }

    const response = {
      message: "Courses assigned successfully",
      assignment: {
        year,
        semester,
        program,
        assignedBy,
        assignments: finalAssignments,
      },
    };

    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped due to duplicates";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.json(response);
  } catch (error) {
    console.error("Error in automatic assignment:", error);
    res.status(500).json({ message: "Error in automatic assignment", error });
  }
};


export const autoAssignCommonCourses = async (req, res) => {
  try {
    const {
      year,
      semester,
      assignedBy,
      instructors: instructorIds,
      courses: frontendCourses,
    } = req.body;

    if (!year || !semester || !assignedBy || !instructorIds?.length || !frontendCourses?.length) {
      return res.status(400).json({
        message: "Year, semester, assignedBy, instructors, and courses are required.",
      });
    }

    const courseIds = frontendCourses.map(c => c.courseId);
    const courseObjectIds = courseIds
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    const instructors = await User.find({ _id: { $in: instructorIds }, role: "Instructor" });
    const courses = await Course.find({ _id: { $in: courseObjectIds } });
    const instructorRecords = await Instructor.find({ userId: { $in: instructors.map(i => i._id) } });

    const existingAssignment = await Assignment.findOne({ year, semester, program: "Regular" });
    const existingCourseAssignments = new Map();
    if (existingAssignment) {
      existingAssignment.assignments.forEach(a => {
        const key = `${a.courseId}-${a.section}-${a.instructorId}`;
        existingCourseAssignments.set(key, true);
      });
    }

    let assignments = [];
    let duplicateAssignments = [];

    for (const frontendCourse of frontendCourses) {
      const { courseId, section, labDivision = "No", NoOfSections = 1 } = frontendCourse;
      const course = courses.find(c => c._id.toString() === courseId);
      if (!course) continue;

      const baseWorkload = course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
      const additionalLab = labDivision === "Yes" ? (2 / 3) * course.lab + (2 / 3) * course.tutorial : 0;
      const totalWorkload = Math.round((baseWorkload + additionalLab) * NoOfSections * 100) / 100;

      const instructorWorkloads = await Promise.all(
        instructors.map(async instructor => {
          const record = instructorRecords.find(r => r.userId.toString() === instructor._id.toString());
          const workloadEntry = record?.workload?.find(w => w.year === year && w.semester === semester && w.program === "Regular");
          return {
            instructor,
            workload: workloadEntry?.value || 0,
            locationPriority: instructor.location === course.location ? -1 : 1,
            record,
          };
        })
      );

      instructorWorkloads.sort((a, b) =>
        (a.workload + a.locationPriority) - (b.workload + b.locationPriority)
      );

      let selected = instructorWorkloads[0];
      if (!selected) continue;

      const instructorId = selected.instructor._id;
      const key = `${courseId}-${section}-${instructorId}`;
      if (existingCourseAssignments.has(key)) {
        duplicateAssignments.push({
          course: course.name,
          section,
          instructor: selected.instructor.fullName,
        });
        continue;
      }

      // Update workload record
      const workloadRecord = selected.record;
      const workloadIndex = workloadRecord.workload.findIndex(w => w.year === year && w.semester === semester && w.program === "Regular");

      if (workloadIndex !== -1) {
        workloadRecord.workload[workloadIndex].value += totalWorkload;
      } else {
        workloadRecord.workload.push({ year, semester, program: "Regular", value: totalWorkload });
      }

      await workloadRecord.save();

      const assignmentReason = `Instructor selected based on lowest workload (${selected.workload} hrs)${selected.instructor.location === course.location ? ", with matching location." : "."}`;

      assignments.push({
        instructorId,
        courseId: course._id,
        section,
        NoOfSections,
        labDivision,
        workload: totalWorkload,
        score: 10 - selected.workload / 2 - (selected.locationPriority > 0 ? 1 : 0),
        assignmentReason,
      });

      existingCourseAssignments.set(key, true);
    }

    if (!assignments.length && duplicateAssignments.length) {
      return res.status(400).json({
        message: "All assignments already exist for this year, semester, and program.",
        duplicateAssignments,
      });
    }

    if (assignments.length) {
      if (existingAssignment) {
        existingAssignment.assignments.push(...assignments);
        await existingAssignment.save();
      } else {
        await Assignment.create({
          year,
          semester,
          program: "Regular",
          assignedBy,
          assignments,
        });
      }
    }

    res.status(201).json({
      message: "Automatic assignment completed successfully.",
      assignments,
      ...(duplicateAssignments.length > 0 && { warning: "Some assignments were skipped due to duplication", duplicateAssignments })
    });

  } catch (error) {
    console.error("Auto-assignment error:", error);
    res.status(500).json({ message: "Error in auto assignment", error: error.message });
  }
};


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

    const existingAssignment = await Assignment.findOne({
      year: parseInt(year),
      semester,
      program: "Extension",
    });

    const existingCourseAssignments = new Map();
    const duplicateAssignments = [];

    if (existingAssignment) {
      existingAssignment.assignments.forEach((assignment) => {
        const key = `${assignment.courseId}-${assignment.section}-${assignment.instructorId}`;
        existingCourseAssignments.set(key, true);
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

    const equivalentSemester =
      semester === "Extension 1"
        ? "Regular 1"
        : semester === "Extension 2"
        ? "Regular 2"
        : semester;

    let finalAssignments = [];

    for (const frontendCourse of frontendCourses) {
      const { courseId, section, labDivision, NoOfSections } = frontendCourse;
      const numSections = NoOfSections || 1;
      const course = courses.find((c) => c._id.toString() === courseId);
      if (!course) continue;

      let isDuplicate = false;
      for (const instructor of instructors) {
        const assignmentKey = `${courseId}-${section}-${instructor._id}`;
        if (existingCourseAssignments.has(assignmentKey)) {
          duplicateAssignments.push({
            course: course.name,
            section,
            instructor: instructor.fullName || instructor.name,
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

        let workload =
          creditHour * (labDivision === "Yes" ? 2 : 1) * numSections;

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

        const experienceYears = instructorRecord.assignedCourses.filter(
          (ac) => ac.course.toString() === course._id.toString()
        ).length;

        instructorBenefits.push({
          instructorId: instructor._id,
          instructorRecord,
          courseId: course._id,
          section,
          NoOfSections: numSections,
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

      const selectedInstructor =
        bestInstructors.length > 1
          ? bestInstructors[Math.floor(Math.random() * bestInstructors.length)]
          : bestInstructors[0];

      const assignmentKey = `${courseId}-${section}-${selectedInstructor.instructorId}`;
      if (existingCourseAssignments.has(assignmentKey)) continue;

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
        NoOfSections: selectedInstructor.NoOfSections,
        labDivision: selectedInstructor.labDivision,
        workload: selectedInstructor.workload,
        score: -selectedInstructor.benefit,
        experienceYears: selectedInstructor.experienceYears,
        assignmentReason,
      });

      existingCourseAssignments.set(assignmentKey, true);
    }

    if (finalAssignments.length === 0 && duplicateAssignments.length > 0) {
      return res.status(400).json({
        message:
          "All assignments already exist for this year, semester, and program",
        duplicateAssignments,
      });
    }

    if (finalAssignments.length > 0) {
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
    }

    const response = {
      message: "Automatic assignment completed successfully!",
      assignments: finalAssignments,
    };

    if (duplicateAssignments.length > 0) {
      response.warning = "Some assignments were skipped because they already exist";
      response.duplicateAssignments = duplicateAssignments;
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error in auto assignment", error: error.message });
  }
};


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

    // Track existing assignments to avoid duplicates
    const existingCourseAssignments = new Map();
    const duplicateAssignments = [];

    if (existingAssignment) {
      existingAssignment.assignments.forEach(assignment => {
        const key = `${assignment.courseId}-${assignment.section}-${assignment.instructorId}`;
        existingCourseAssignments.set(key, true);
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
      const { courseId, section, labDivision, NoOfSections } = frontendCourse;
      const numSections = NoOfSections || 1;
      const course = courses.find((c) => c._id.toString() === courseId);
      if (!course) continue;

      // Check if this course-section assignment already exists for any instructor
      let isDuplicate = false;
      for (const instructor of instructors) {
        const assignmentKey = `${courseId}-${section}-${instructor._id}`;
        if (existingCourseAssignments.has(assignmentKey)) {
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

        // Calculate base credit hour
        let creditHour =
          course.lecture + (2 / 3) * course.lab + (2 / 3) * course.tutorial;
        if (course.numberOfStudents > 25) {
          creditHour =
            course.lecture +
            2 * ((2 / 3) * course.lab) +
            2 * ((2 / 3) * course.tutorial);
        }
        
        // Apply lab division and number of sections
        let workload = creditHour * (labDivision === "Yes" ? 2 : 1) * numSections;

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
          NoOfSections: numSections,
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
      } else {
        await Assignment.create({
          year,
          semester: "Summer",
          program: "Summer",
          assignedBy,
          assignments,
        });
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
    res.status(500).json({ message: "Error in auto assignment", error });
  }
};