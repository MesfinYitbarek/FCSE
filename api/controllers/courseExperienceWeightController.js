import CourseExperienceWeight from "../models/CourseExperienceWeight.js";

// Create course experience weight settings
export const createCourseExperienceWeight = async (req, res) => {
  try {
    const { maxWeight, interval } = req.body;
    const newWeight = new CourseExperienceWeight({ maxWeight, interval });
    await newWeight.save();
    res.status(201).json({ message: "Course experience weight settings created", weight: newWeight });
  } catch (error) {
    res.status(500).json({ message: "Error creating course experience weight settings", error });
  }
};

// Get all course experience weight settings
export const getCourseExperienceWeights = async (req, res) => {
  try {
    const weights = await CourseExperienceWeight.find();
    res.json(weights);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course experience weight settings", error });
  }
};

// Update course experience weight settings
export const updateCourseExperienceWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxWeight, interval } = req.body;

    // Validate inputs
    if (!maxWeight || !interval) {
      return res.status(400).json({ message: "Both maxWeight and interval are required" });
    }

    if (maxWeight <= 0 || interval <= 0) {
      return res.status(400).json({ 
        message: "Both maxWeight and interval must be positive numbers" 
      });
    }

    // Find the existing document
    const weightDoc = await CourseExperienceWeight.findById(id);
    if (!weightDoc) {
      return res.status(404).json({ message: "Course experience weight not found" });
    }

    // Update values and trigger pre-save hook
    weightDoc.maxWeight = maxWeight;
    weightDoc.interval = interval;
    await weightDoc.save(); // Triggers the pre-save hook to recalculate yearsExperience

    res.status(200).json({ 
      message: "Course experience weight updated successfully", 
      weight: weightDoc,
      details: {
        maxWeight: weightDoc.maxWeight,
        interval: weightDoc.interval,
        yearRange: `0 to ${weightDoc.yearsExperience.length - 1} years`,
        weightRange: `0 to ${weightDoc.maxWeight}`
      }
    });

  } catch (error) {
    console.error("Error updating course experience weight:", error);
    res.status(500).json({ 
      message: "Error updating course experience weight settings", 
      error: error.message 
    });
  }
};
export const deleteCourseExperienceWeight = async (req, res) => {
  try {
    const report = await CourseExperienceWeight.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: "Course Experience Weight not found" });
    }
    
    res.status(200).json({ message: "Course Experience Weight deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Course Experience Weight", error: error.message });
  }
};