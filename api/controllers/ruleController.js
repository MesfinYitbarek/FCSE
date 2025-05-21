import Rule from "../models/Rule.js";

// Create a new rule
export const createRule = async (req, res) => {
  try {
    const { ruleName, description } = req.body;
    const newRule = new Rule({ ruleName, description });
    await newRule.save();
    res.status(201).json({ message: "Rule created successfully", rule: newRule });
  } catch (error) {
    res.status(500).json({ message: "Error creating rule", error });
  }
};

// Get all rules
export const getRules = async (req, res) => {
  try {
    const rules = await Rule.find();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rules", error });
  }
};

// Update a rule
export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { ruleName, description } = req.body;
    
    const updatedRule = await Rule.findByIdAndUpdate(
      id, 
      { ruleName, description },
      { new: true, runValidators: true }
    );
    
    if (!updatedRule) {
      return res.status(404).json({ message: "Rule not found" });
    }
    
    res.json({ message: "Rule updated successfully", rule: updatedRule });
  } catch (error) {
    res.status(500).json({ message: "Error updating rule", error: error.message });
  }
};

// Delete a rule
export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRule = await Rule.findByIdAndDelete(id);
    
    if (!deletedRule) {
      return res.status(404).json({ message: "Rule not found" });
    }
    
    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rule", error: error.message });
  }
};