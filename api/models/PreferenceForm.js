import mongoose from "mongoose";
const preferenceFormSchema = new mongoose.Schema({
  chair: { type: String, required: true }, 
  year: { type: Number, required: true },
  semester: { type: String, enum: ["Regular 1", "Regular 2", "Summer", "Extension"], required: true },
  maxPreferences: { type: Number, required: true },
  submissionStart: { type: Date, required: true },
  submissionEnd: { type: Date, required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }],
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PreferenceForm", preferenceFormSchema);
