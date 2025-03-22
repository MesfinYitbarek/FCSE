import Preference from "../models/Preference.js";
import PreferenceForm from "../models/PreferenceForm.js";

// Instructors submit preferences
export const submitPreferences = async (req, res) => {
  try {
    const { instructorId, preferenceFormId, preferences } = req.body;
    
    // Ensure ranks start from 1 (no gaps)
    const validatedPreferences = preferences
      .filter(pref => pref.rank > 0)
      .sort((a, b) => a.rank - b.rank)
      .map((pref, index) => ({
        ...pref,
        rank: index + 1 // Reassign ranks starting from 1
      }));
    
    const existing = await Preference.findOne({ instructorId, preferenceFormId });

    if (existing) {
      return res.status(400).json({ message: "Preferences already submitted." });
    }

    const newPreference = new Preference({ 
      instructorId, 
      preferenceFormId, 
      preferences: validatedPreferences 
    });
    
    await newPreference.save();
    
    res.status(201).json({ 
      message: "Preferences submitted successfully", 
      preference: newPreference 
    });
  } catch (error) {
    console.error("Error submitting preferences:", error);
    res.status(500).json({ 
      message: "Error submitting preferences", 
      error: error.message 
    });
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

export const updatePreferences = async (req, res) => {
  try {
    const { instructorId, preferenceFormId, preferences } = req.body;
    
    // Ensure ranks start from 1 (no gaps)
    const validatedPreferences = preferences
      .filter(pref => pref.rank > 0)
      .sort((a, b) => a.rank - b.rank)
      .map((pref, index) => ({
        ...pref,
        rank: index + 1 // Reassign ranks starting from 1
      }));
    
    // Find and update existing preferences
    const existingPreference = await Preference.findOne({ 
      instructorId, 
      preferenceFormId 
    });
    
    if (!existingPreference) {
      return res.status(404).json({ 
        message: "Preferences not found. Submit preferences first." 
      });
    }
    
    existingPreference.preferences = validatedPreferences;
    existingPreference.updatedAt = Date.now();
    
    await existingPreference.save();
    
    res.status(200).json({ 
      message: "Preferences updated successfully", 
      preference: existingPreference 
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ 
      message: "Error updating preferences", 
      error: error.message 
    });
  }
};