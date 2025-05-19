import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  year: { type: Number, required: true },
  semester: { 
    type: String, 
    enum: ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"],
    required: true 
  },
  program: { 
    type: String, 
    enum: ["Regular", "Common", "Extension", "Summer"],
    required: true 
  },
  reason: String,
  status: { 
    type: String, 
    enum: ["Pending", "Resolved", "Rejected"], 
    default: "Pending" 
  },
  resolveNote: String,
  submittedAt: { type: Date, default: Date.now },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },
  resolvedAt: Date
});

export default mongoose.model("Complaint", complaintSchema);