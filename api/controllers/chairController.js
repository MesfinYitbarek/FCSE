import Chair from "../models/Chair.js";

// Create a new chair
export const createChair = async (req, res) => {
  try {
    const { name, head, courses } = req.body;
    const newChair = new Chair({ name, head, courses });
    await newChair.save();
    res.status(201).json({ message: "Chair created successfully", chair: newChair });
  } catch (error) {
    res.status(500).json({ message: "Error creating chair", error });
  }
};

// Get all chairs
export const getChairs = async (req, res) => {
  try {
    const chairs = await Chair.find().populate("head").populate("courses");
    res.json(chairs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chairs", error });
  }
};

// Update a chair
export const updateChair = async (req, res) => {
  try {
    const updatedChair = await Chair.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedChair) return res.status(404).json({ message: "Chair not found" });
    res.json({ message: "Chair updated successfully", chair: updatedChair });
  } catch (error) {
    res.status(500).json({ message: "Error updating chair", error });
  }
};

// Delete a chair
export const deleteChair = async (req, res) => {
  try {
    const deletedChair = await Chair.findByIdAndDelete(req.params.id);
    if (!deletedChair) return res.status(404).json({ message: "Chair not found" });
    res.json({ message: "Chair deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chair", error });
  }
};
