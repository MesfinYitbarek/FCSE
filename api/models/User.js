import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["HeadOfFaculty", "ChairHead", "COC", "Instructor"] },
  phone: String,
  chair: String,
  rank: String,
  position: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
