import mongoose from "mongoose";

const courseExperienceWeightSchema = new mongoose.Schema({
  maxWeight: Number,
  interval: Number,
  yearsExperience: [{ years: Number, weight: Number }],
  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware to recalculate yearsExperience array
courseExperienceWeightSchema.pre("save", function (next) {
  this.yearsExperience = [];

  const maxYears = Math.floor(this.maxWeight / this.interval);

  for (let years = 0; years <= maxYears; years++) {
    const weight = Math.min(years * this.interval, this.maxWeight);
    this.yearsExperience.push({ years, weight });
  }

  next();
});

export default mongoose.model("CourseExperienceWeight", courseExperienceWeightSchema);
