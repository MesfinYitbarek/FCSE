import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  preferenceFormId: { type: mongoose.Schema.Types.ObjectId, ref: "PreferenceForm", required: true },
  preferences: [
    { courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, rank: Number }
  ],
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Preference", preferenceSchema);
