// server.js (Main Entry Point)
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";


// Import Routes
import userRoutes from "./routes/userRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import preferenceFormRoutes from "./routes/preferenceFormRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import chairRoutes from "./routes/chairRoutes.js";
//import positionRoutes from "./routes/positionRoutes.js";
import ruleRoutes from "./routes/ruleRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import preferenceWeightRoutes from "./routes/preferenceWeightRoutes.js";
import courseExperienceWeightRoutes from "./routes/courseExperienceWeightRoutes.js";
import { authenticate, authorize } from "./middleware/authMiddleware.js";
import positionRoutes from "./routes/postionRoutes.js";
import path from"path"


dotenv.config();

const __dirname = path.resolve();


const app = express();
app.use(express.json());
app.use(cors());




// Routes
app.use("/api/users", userRoutes);
app.use("/api/courses", authenticate, courseRoutes);
app.use("/api/instructors", authenticate, instructorRoutes);
app.use("/api/preferences", authenticate, preferenceRoutes);
app.use("/api/preference-forms", authenticate, authorize(["ChairHead", "Instructor"]), preferenceFormRoutes);
app.use("/api/assignments", authenticate, assignmentRoutes);
app.use("/api/complaints", authenticate, complaintRoutes);
app.use("/api/chairs", authenticate, authorize(["HeadOfFaculty"]), chairRoutes);
app.use("/api/positions", authenticate, authorize(["HeadOfFaculty"]), positionRoutes);
app.use("/api/rules", authenticate, authorize(["HeadOfFaculty"]), ruleRoutes);
app.use("/api/announcements", authenticate, announcementRoutes);
app.use("/api/reports", authenticate, authorize(["HeadOfFaculty", "ChairHead", "COC", "Instructor"]), reportRoutes);
app.use("/api/preference-weights", authenticate, authorize(["HeadOfFaculty"]), preferenceWeightRoutes);
app.use("/api/course-experience-weights", authenticate, authorize(["HeadOfFaculty"]), courseExperienceWeightRoutes);


app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

