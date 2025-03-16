import PreferenceForm from "../models/PreferenceForm.js";
import mongoose from "mongoose";
// Chair Head creates a new preference form
export const createPreferenceForm = async (req, res) => {
  try {
    const { chair, year, semester, maxPreferences, submissionStart, submissionEnd, courses, instructors } = req.body;

    // Validate required fields
    if (!chair || !year || !semester || !maxPreferences || !submissionStart || !submissionEnd || !courses || !instructors) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate courses and instructors arrays
    if (!Array.isArray(courses) || !Array.isArray(instructors)) {
      return res.status(400).json({ message: "Courses and instructors must be arrays" });
    }

    // Create new preference form
    const newForm = new PreferenceForm({
      chair, // Now it's a string
      year,
      semester,
      maxPreferences,
      submissionStart: new Date(submissionStart),
      submissionEnd: new Date(submissionEnd),
      courses,
      instructors,
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
    const updatedForm = await PreferenceForm.findByIdAndUpdate(formId, req.body, { new: true });
    if (!updatedForm) return res.status(404).json({ message: "Preference form not found." });

    res.json({ message: "Preference form updated successfully", form: updatedForm });
  } catch (error) {
    res.status(500).json({ message: "Error updating preference form", error });
  }
};

// Get the active preference form for instructors
export const getActivePreferenceForm = async (req, res) => {
  const { year, semester, chair } = req.query;
  try {
    // Updated query to include chair parameter if provided
    const query = { year, semester };
    if (chair) {
      query.chair = chair;
    }
    
    const forms = await PreferenceForm.find(query).populate("courses instructors");
    if (!forms.length) return res.status(404).json({ message: "No preference forms found." });
    res.json(forms[0]); // Return the first matching form
  } catch (error) {
    res.status(500).json({ message: "Error fetching preference forms", error });
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