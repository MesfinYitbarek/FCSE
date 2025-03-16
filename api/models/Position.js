import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  exemption: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Position", positionSchema);
