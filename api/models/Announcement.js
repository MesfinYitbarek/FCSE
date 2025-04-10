import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  publishedBy: { type: String, enum: ["ChairHead", "HeadOfFaculty", "COC", "Instructor"], required: true },
  // Target audience by role and/or chair
  targetAudience: {
    roles: [{ type: String, enum: ["ChairHead", "HeadOfFaculty", "COC", "Instructor"] }],
    chairs: [{ type: String }] // Array of chair names
  },
  // Track which users have read the announcement
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  publishedAt: { type: Date, default: Date.now },
  validUntil: Date,
});

export default mongoose.model("Announcement", announcementSchema);