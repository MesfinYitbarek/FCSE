import PreferenceWeight from "../models/PreferenceWeight.js";

// Create preference weight settings
export const createPreferenceWeight = async (req, res) => {
  try {
    const { maxWeight, interval } = req.body;
    const newPreferenceWeight = new PreferenceWeight({ maxWeight, interval });
    await newPreferenceWeight.save();
    res.status(201).json({ message: "Preference weight settings created", preferenceWeight: newPreferenceWeight });
  } catch (error) {
    res.status(500).json({ message: "Error creating preference weight settings", error });
  }
};

// Get all preference weight settings
export const getPreferenceWeights = async (req, res) => {
  try {
    const weights = await PreferenceWeight.find();
    res.json(weights);
  } catch (error) {
    res.status(500).json({ message: "Error fetching preference weight settings", error });
  }
};

// Update preference weight settings
export const updatePreferenceWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxWeight, interval } = req.body;
    const updatedWeight = await PreferenceWeight.findByIdAndUpdate(
      id,
      { maxWeight, interval },
      { new: true, runValidators: true }
    );
    if (!updatedWeight) return res.status(404).json({ message: "Preference weight not found" });
    res.json({ message: "Preference weight updated", preferenceWeight: updatedWeight });
  } catch (error) {
    res.status(500).json({ message: "Error updating preference weight settings", error });
  }
};

export const deletePreferenceWeight = async (req, res) => {
  try {
    const report = await PreferenceWeight.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: "Preference Weight not found" });
    }
    
    res.status(200).json({ message: "Preference Weight deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting PreferenceWeight", error: error.message });
  }
};