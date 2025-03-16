
import mongoose from "mongoose";
import Instructor from "../models/Instructor.js";
import User from "../models/User.js"
// ✅ Create a new instructor
export const createInstructor = async (req, res) => {
  try {
    const { userId } = req.body;

    // ✅ Check if user exists and is an Instructor
    const user = await User.findById(userId);
    if (!user || user.role !== "Instructor") {
      return res.status(400).json({ message: "Invalid user or not an Instructor" });
    }

    // ✅ Ensure the instructor does not already exist
    const existingInstructor = await Instructor.findOne({ userId });
    if (existingInstructor) {
      return res.status(400).json({ message: "Instructor already exists" });
    }

    const newInstructor = new Instructor({ userId, workload: [] });
    await newInstructor.save();

    res.status(201).json({ message: "Instructor created successfully", instructor: newInstructor });
  } catch (error) {
    console.error("Error creating instructor:", error);
    res.status(500).json({ message: "Error creating instructor", error });
  }
};

// ✅ Get all instructors for a specific chair
export const getInstructorsByChair = async (req, res) => {
  try {
    const { chair } = req.params;

    // ✅ Get users who are Instructors in the chair
    const users = await User.find({ chair, role: "Instructor" });

    // ✅ Get instructor records linked to those users
    const instructorIds = users.map(user => user._id);
    const instructors = await Instructor.find({ userId: { $in: instructorIds } }).populate("userId");

    res.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Error fetching instructors", error });
  }
};

// ✅ Get all instructors
export const getInstructors = async (req, res) => {
  try {
    
    const users = await User.find({role: "Instructor" });
    // ✅ Get instructor records linked to those users
    const instructorIds = users.map(user => user._id);
    const instructors = await Instructor.find({ userId: { $in: instructorIds } }).populate("userId");

    res.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Error fetching instructors", error });
  }
};

// ✅ Update instructor details
export const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInstructor = await Instructor.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedInstructor) return res.status(404).json({ message: "Instructor not found" });

    res.json({ message: "Instructor updated successfully", instructor: updatedInstructor });
  } catch (error) {
    console.error("Error updating instructor:", error);
    res.status(500).json({ message: "Error updating instructor", error });
  }
};

// ✅ Delete instructor
export const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInstructor = await Instructor.findByIdAndDelete(id);

    if (!deletedInstructor) return res.status(404).json({ message: "Instructor not found" });

    res.json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    res.status(500).json({ message: "Error deleting instructor", error });
  }
};



export const getInstructorByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the instructor by userId
    const instructor = await Instructor.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json(instructor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructor", error: error.message });
  }
};