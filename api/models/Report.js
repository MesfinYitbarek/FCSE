// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  year: { type: Number, required: true }, // Academic Year
  semester: { type: String, enum: ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"] }, // Optional - specific semester
  program: { type: String, enum: ["Regular", "Common", "Extension", "Summer"] }, // Optional - specific program
  
  note: { type: String }, // Additional notes for the report
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }], // Referenced assignments
  
  generatedBy: { type: String}, // Who generated the report
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

export default mongoose.model("Report", reportSchema);