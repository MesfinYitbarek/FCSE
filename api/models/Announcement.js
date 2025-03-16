import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  publishedBy: { type: String, enum: ["ChairHead", "HeadOfFaculty", "COC", "Instructor"], required: true },
  viewedBy: { type: String, enum: ["ChairHead", "HeadOfFaculty", "COC", "Instructor"], required: true }, // New field
  publishedAt: { type: Date, default: Date.now },
  validUntil: Date,
});

export default mongoose.model("Announcement", announcementSchema);