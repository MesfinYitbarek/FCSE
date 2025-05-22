import PreferenceForm from "../models/PreferenceForm.js";
import mongoose from "mongoose";
// Chair Head creates a new preference form
export const createPreferenceForm = async (req, res) => {
  try {
    const { 
      chair, 
      year, 
      semester, 
      maxPreferences, 
      submissionStart, 
      submissionEnd, 
      courses, 
      instructors,
      allInstructors 
    } = req.body;

    // Validate required fields
    if (!chair || !year || !semester || !maxPreferences || !submissionStart || !submissionEnd || !courses) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // If allInstructors is true, no need to check instructors array
    if (!allInstructors && (!instructors || !Array.isArray(instructors))) {
      return res.status(400).json({ message: "Instructors must be an array when not selecting all instructors" });
    }

    // Validate courses array
    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: "Courses must be an array" });
    }

    // Check for existing preference form with the same year and semester for this chair
    const existingForm = await PreferenceForm.findOne({
      chair,
      year,
      semester
    });

    if (existingForm) {
      return res.status(400).json({
        message: `A preference form for ${year} ${semester} already exists for this department. Please edit the existing form instead of creating a duplicate.`
      });
    }

    // Format courses with additional fields
    const formattedCourses = courses.map(course => {
      if (typeof course === 'object' && course.course) {
        return {
          course: course.course,
          section: course.section || "A",
          NoOfSections: course.NoOfSections || 1,
          labDivision: course.labDivision || "No"
        };
      } else {
        return {
          course: course,
          section: "A",
          NoOfSections: 1,
          labDivision: "No"
        };
      }
    });

    // Create new preference form
    const newForm = new PreferenceForm({
      chair,
      year,
      semester,
      maxPreferences,
      submissionStart: new Date(submissionStart),
      submissionEnd: new Date(submissionEnd),
      courses: formattedCourses,
      instructors: allInstructors ? [] : instructors,
      allInstructors
    });

    // Save to database
    await newForm.save();

    res.status(201).json({ message: "Preference form created successfully", form: newForm });
  } catch (error) {
    console.error("Error creating preference form:", error);
    res.status(500).json({ message: "Error creating preference form", error: error.message });
  }
};


// Chair Head updates an existing preference form
export const updatePreferenceForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { 
      chair, 
      year, 
      semester, 
      maxPreferences, 
      submissionStart, 
      submissionEnd, 
      courses, 
      instructors,
      allInstructors 
    } = req.body;

    // Format courses if provided
    let updateData = {...req.body};
    
    if (courses && Array.isArray(courses)) {
      const formattedCourses = courses.map(course => {
        if (typeof course === 'object' && course.course) {
          return {
            course: course.course,
            section: course.section || "A",
            NoOfSections: course.NoOfSections || 1,
            labDivision: course.labDivision || "No"
          };
        } else {
          return {
            course: course,
            section: "A",
            NoOfSections: 1,
            labDivision: "No"
          };
        }
      });
      updateData.courses = formattedCourses;
    }

    // If allInstructors is true, clear instructors array
    if (allInstructors) {
      updateData.instructors = [];
    }

    const updatedForm = await PreferenceForm.findByIdAndUpdate(formId, updateData, { new: true });
    if (!updatedForm) return res.status(404).json({ message: "Preference form not found." });

    res.json({ message: "Preference form updated successfully", form: updatedForm });
  } catch (error) {
    res.status(500).json({ message: "Error updating preference form", error: error.message });
  }
};

// Get the active preference form for instructors
export const getActivePreferenceForm = async (req, res) => {
  const { year, semester, chair } = req.query;

  try {
    const query = { year, semester };
    if (chair) query.chair = chair;

    const forms = await PreferenceForm.find(query).populate("courses.course instructors");

    if (!forms.length) {
      return res.status(404).json({ 
        message: "No preference form found for the specified year, semester, and chair.",
        status: "not_found" 
      });
    }

    const currentDate = new Date();
    
    // Find any form for this period (active or not)
    const form = forms[0];
    const start = new Date(form.submissionStart);
    const end = new Date(form.submissionEnd);
    
    // Check if the form is active (current date within submission period)
    if (currentDate >= start && currentDate <= end) {
      // Form is active and available for submission
      const response = {
        ...form.toObject(),
        submissionAllowed: true,
        status: "active"
      };
      return res.json(response);
    } else if (currentDate < start) {
      // Form exists but submission period hasn't started yet
      return res.status(400).json({
        message: "The submission period for this preference form has not started yet.",
        note: "Submission will be allowed from the start date defined by the chair.",
        status: "upcoming",
        currentDate,
        form: {
          year: form.year,
          semester: form.semester,
          chair: form.chair,
          submissionStart: form.submissionStart,
          submissionEnd: form.submissionEnd,
          _id: form._id
        }
      });
    } else {
      // Form exists but submission period has ended
      return res.status(400).json({
        message: "The submission period for this preference form has ended.",
        note: "Submission was only allowed between the start and end date defined by the chair.",
        status: "closed",
        currentDate,
        form: {
          year: form.year,
          semester: form.semester,
          chair: form.chair,
          submissionStart: form.submissionStart,
          submissionEnd: form.submissionEnd,
          _id: form._id
        }
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching active preference form", 
      error: error.message,
      status: "error"
    });
  }
};



// Get the preference form created by a specific Chair Head
export const getFilteredPreferenceForms = async (req, res) => {
  try {
    const { year, semester, chair } = req.query;
    
    // Build filter criteria
    const filterCriteria = {};
    
    if (chair) {
      filterCriteria.chair = chair;
    }
    
    if (year) {
      filterCriteria.year = year;
    }
    
    if (semester) {
      filterCriteria.semester = semester;
    }
    
    // Find forms matching the criteria
    const forms = await PreferenceForm.find(filterCriteria)
      .sort({ createdAt: -1 })
      .populate("courses instructors");

    if (!forms || forms.length === 0) {
      return res.status(200).json([]);
    }

    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching preference forms", error: error.message });
  }
};

// Keep the original function for backward compatibility
export const getChairPreferenceForm = async (req, res) => {
  try {
    const { chair } = req.params;
    const form = await PreferenceForm.findOne({ chair }).sort({ createdAt: -1 }).populate("courses instructors");

    if (!form) return res.status(404).json({ message: "No preference form found for this Chair Head." });

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: "Error fetching preference form", error });
  }
};

//Delete preference Form

export const deletePreferenceForm = async (req, res) => {
  try {
    const report = await PreferenceForm.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: "Preference Form not found" });
    }
    
    res.status(200).json({ message: "Preference Form deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting preference form", error: error.message });
  }
};