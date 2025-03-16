import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  value: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Rule", ruleSchema);
