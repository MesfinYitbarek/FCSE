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
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Course", courseSchema);
