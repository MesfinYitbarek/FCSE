import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],
  workload: [
    {
      year: { type: Number }, 
      semester: { 
        type: String, 
        enum: ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"], 
        required: true 
      },
      program: { 
        type: String, 
        required: true 
      }, 
      value: { 
        type: Number, 
        required: true, 
        min: 0 
      } 
    }
  ],
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Instructor", instructorSchema);
