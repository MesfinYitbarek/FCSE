import mongoose from "mongoose";
const courseSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  department: String,
  category: String,
  year: Number,
  semester: Number,
  creditHour: Number,
  lecture: Number,
  lab: Number,
  tutorial: Number,
  chair: String,
  likeness: [String], 
  location: String,
  // New fields
  status: {
    type: String,
    enum: ["draft", "assigned", "active", "completed", "archived"],
    default: "draft"
  },
  assignedTo: String, // Which chair or CoC it's assigned to
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  assignedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Course", courseSchema);
