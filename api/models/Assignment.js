import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  year: { type: Number, required: true }, 
  semester: { type: String, enum: ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"], required: true }, 
  program: { type: String, enum: ["Regular", "Common", "Extension", "Summer"], required: true }, 
  assignments: [
    {
      instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true }, 
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, 
      section: { type: String }, 
      NoOfSections: { type: Number },
      labDivision: { type: String }, // Lab division, yes or no
      workload: { type: Number, required: true }, 
      // Assignment reasoning fields
      score: { type: Number }, // Assignment score from algorithm
      preferenceRank: { type: Number }, // Instructor's preference rank for this course
      experienceYears: { type: Number }, // Instructor's experience teaching this course (in years)
      assignmentReason: { type: String }, // Human-readable explanation for the assignment
    }
  ],

  assignedBy: { type: String, enum: ["ChairHead","Programming", "Software", "Database", "Networking", "COC"], required: true }, // Who assigned it
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

export default mongoose.model("Assignment", assignmentSchema);