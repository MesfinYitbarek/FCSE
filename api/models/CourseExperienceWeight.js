import mongoose from "mongoose";

const courseExperienceWeightSchema = new mongoose.Schema({
  maxWeight: Number,
  interval: Number,
  yearsExperience: [{ years: Number, weight: Number }],
  createdAt: { type: Date, default: Date.now }
});

courseExperienceWeightSchema.pre("save", function (next) {
  this.yearsExperience = [];
  let currentWeight = this.maxWeight;
  for (let years = 0; currentWeight > 0; years++) {
    this.yearsExperience.push({ years, weight: currentWeight });
    currentWeight -= this.interval;
  }
  next();
});

export default mongoose.model("CourseExperienceWeight", courseExperienceWeightSchema);
