import Position from "../models/Position.js";

// Create a new faculty position
export const createPosition = async (req, res) => {
  try {
    const { name, exemption } = req.body;
    const newPosition = new Position({ name, exemption });
    await newPosition.save();
    res.status(201).json({ message: "Position created successfully", position: newPosition });
  } catch (error) {
    res.status(500).json({ message: "Error creating position", error });
  }
};

// Get all faculty positions
export const getPositions = async (req, res) => {
  try {
    const positions = await Position.find();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching positions", error });
  }
};

// Update a position
export const updatePosition = async (req, res) => {
  try {
    const updatedPosition = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPosition) return res.status(404).json({ message: "Position not found" });
    res.json({ message: "Position updated successfully", position: updatedPosition });
  } catch (error) {
    res.status(500).json({ message: "Error updating position", error });
  }
};
