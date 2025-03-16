import Course from "../models/Course.js";


// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { name, code,department,category, year, semester, creditHour, lecture, lab, tutorial, chair, likeness, location } = req.body;
    const newCourse = new Course({ name, code,department, category, year, semester, creditHour, lecture, lab, tutorial, chair, likeness, location });
    await newCourse.save();
    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
};

// Get course by chair
export const getCourseByChair = async (req, res) => { 
  try {
    const courses = await Course.find({ chair: req.params.chair }); // Find courses based on chair
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found for this chair" });
    }
    res.json(courses); // Return the list of courses
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
};


// Update course details
export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};
