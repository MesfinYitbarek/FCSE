import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  year: { type: Number, required: true }, 
  semester: { type: String, enum: ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"] },
  program: { type: String, enum: ["Regular", "Common", "Extension", "Summer"] }, 
  
  note: { type: String }, 
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }], 
  
  generatedBy: { type: String}, 
  createdAt: { type: Date, default: Date.now }, 
});

export default mongoose.model("Report", reportSchema);