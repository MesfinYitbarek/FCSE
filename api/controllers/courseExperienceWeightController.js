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
    const updatedWeight = await CourseExperienceWeight.findByIdAndUpdate(
      id,
      { maxWeight, interval },
      { new: true, runValidators: true }
    );
    if (!updatedWeight) return res.status(404).json({ message: "Course experience weight not found" });
    res.json({ message: "Course experience weight updated", weight: updatedWeight });
  } catch (error) {
    res.status(500).json({ message: "Error updating course experience weight settings", error });
  }
};