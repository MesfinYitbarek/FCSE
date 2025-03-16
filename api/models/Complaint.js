import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  reason: String,
  status: { type: String, enum: ["Pending", "Resolved", "Rejected"], default: "Pending" },
  resolveNote: String,
  submittedAt: { type: Date, default: Date.now },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  resolvedAt: Date
});

export default mongoose.model("Complaint", complaintSchema);
