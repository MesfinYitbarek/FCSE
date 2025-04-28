import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  year: { type: Number, required: true }, // Academic Year
  semester: { type: String, enum: ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"], required: true }, // Semester
  program: { type: String, enum: ["Regular", "Common", "Extension", "Summer"], required: true }, // Program

  assignments: [
    {
      instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true }, // Instructor assigned
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // Course assigned
      section: { type: String }, // Section information
      NoOfSections: { type: Number },
      labDivision: { type: String }, // Lab division, if applicable
      workload: { type: Number, required: true }, // Workload assigned to instructor
      // Assignment reasoning fields
      score: { type: Number }, // Assignment score from algorithm
      preferenceRank: { type: Number }, // Instructor's preference rank for this course
      experienceYears: { type: Number }, // Instructor's experience teaching this course (in years)
    }
  ],

  assignedBy: { type: String, enum: ["ChairHead","Programming", "Software", "Database", "Networking", "COC"], required: true }, // Who assigned it
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

export default mongoose.model("Assignment", assignmentSchema);
