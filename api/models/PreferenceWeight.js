import mongoose from "mongoose";

const preferenceWeightSchema = new mongoose.Schema({
  maxWeight: Number,
  interval: Number,
  weights: [{ rank: Number, weight: Number }],
  createdAt: { type: Date, default: Date.now }
});

preferenceWeightSchema.pre("save", function (next) {
  this.weights = [];
  let currentWeight = this.maxWeight;
  for (let rank = 1; currentWeight > 0; rank++) {
    this.weights.push({ rank, weight: currentWeight });
    currentWeight -= this.interval;
  }
  next();
});

export default mongoose.model("PreferenceWeight", preferenceWeightSchema);