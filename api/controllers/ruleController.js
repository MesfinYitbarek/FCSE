import Rule from "../models/Rule.js";

// Create a new rule
export const createRule = async (req, res) => {
  try {
    const { ruleName, description, value } = req.body;
    const newRule = new Rule({ ruleName, description, value });
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
