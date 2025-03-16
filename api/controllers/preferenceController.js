import Preference from "../models/Preference.js";
import PreferenceForm from "../models/PreferenceForm.js";

// Instructors submit preferences
export const submitPreferences = async (req, res) => {
  try {
    const { instructorId, preferenceFormId, preferences } = req.body;
    const existing = await Preference.findOne({ instructorId, preferenceFormId });

    if (existing) {
      return res.status(400).json({ message: "Preferences already submitted." });
    }

    const newPreference = new Preference({ instructorId, preferenceFormId, preferences });
    await newPreference.save();
    res.status(201).json({ message: "Preferences submitted successfully", preference: newPreference });
  } catch (error) {
    res.status(500).json({ message: "Error submitting preferences", error });
  }
};

// Get an instructor's preferences for a specific form
export const getInstructorPreferences = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { year, semester, chair } = req.query;

    // Find the relevant preference form
    const preferenceForm = await PreferenceForm.findOne({ year, semester, chair });
    if (!preferenceForm) {
      return res.status(404).json({ message: "No matching preference form found." });
    }

    // Find preferences based on the instructorId and preferenceFormId
    const preferences = await Preference.findOne({
      instructorId,
      preferenceFormId: preferenceForm._id,
    }).populate("preferences.courseId");

    if (!preferences) {
      return res.status(404).json({ message: "No preferences found." });
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: "Error fetching preferences", error });
  }
};

export const getPreferencesByParams = async (req, res) => {
  try {
    const { year, semester, chair } = req.query;

    // First find the preference form that matches the criteria
    const preferenceForm = await PreferenceForm.findOne({
      year,
      semester,
      chair
    });

    if (!preferenceForm) {
      return res.status(404).json({ message: "No preference form found for given criteria" });
    }

    // Then find all preferences associated with this form
    const preferences = await Preference.find({ preferenceFormId: preferenceForm._id })
      .populate('instructorId', 'fullName email') // Populate instructor details
      .populate('preferences.courseId', 'code name') // Populate course details
      .lean();

    res.status(200).json({
      preferenceForm,
      preferences
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching preferences",
      error: error.message 
    });
  }
};