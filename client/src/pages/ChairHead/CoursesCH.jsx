import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

const CoursesCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    department: "",
    category: "",
    year: 1,
    semester: 1,
    creditHour: 3,
    lecture: 2,
    lab: 1,
    tutorial: 0,
    chair: user.chair,
    likeness: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false); // For add modal
  const [openEditModal, setOpenEditModal] = useState(false); // For edit modal
  const [openDeleteModal, setOpenDeleteModal] = useState(false); // For delete modal
  const [selectedCourse, setSelectedCourse] = useState(null); // For edit/delete
  const [searchTerm, setSearchTerm] = useState(""); // For search filtering

  // Fetch courses assigned to this Chair Head
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/${user.chair}`);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    setLoading(false);
  };


  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle adding or updating a course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse._id}`, { ...form, chair: user.chair });
      } else {
        await api.post("/courses", { ...form, chair: user.chair });
      }
      fetchCourses();
      setForm({
        name: "",
        code: "",
        department: "",
        category: "",
        year: 1,
        semester: 1,
        creditHour: 3,
        lecture: 2,
        lab: 1,
        tutorial: 0,
        chair: user.chair,
        likeness: "",
        location: "",
      });
      setSelectedCourse(null);
      setOpenAddModal(false);
      setOpenEditModal(false);
    } catch (error) {
      console.error("Error saving course:", error);
    }
    setLoading(false);
  };

  // Open edit modal and pre-fill form
  const openEditCourseModal = (course) => {
    setSelectedCourse(course);
    setForm({
      name: course.name,
      code: course.code,
      department: course.department,
      category: course.category,
      year: course.year,
      semester: course.semester,
      creditHour: course.creditHour,
      lecture: course.lecture,
      lab: course.lab,
      tutorial: course.tutorial,
      likeness: course.likeness.join(", "),
      location: course.location,
    });
    setOpenEditModal(true);
  };

  // Open delete confirmation modal
  const openDeleteCourseModal = (course) => {
    setSelectedCourse(course);
    setOpenDeleteModal(true);
  };

  // Handle deleting a course
  const handleDeleteCourse = async () => {
    setLoading(true);
    try {
      await api.delete(`/courses/${selectedCourse._id}`);
      fetchCourses();
      setOpenDeleteModal(false);
    } catch (error) {
      console.error("Error deleting course:", error);
    }
    setLoading(false);
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) => {
    const matchesSearchTerm =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearchTerm;
  });

  return (
    <div className="p-6">

      {/* Add New Course Button */}
      <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
        Add New Course
      </Button>

      {/* Search Section */}
      <div className="mt-6">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by course name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Course Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Course Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Course Code"
            name="code"
            value={form.code}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Course Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Course Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Year"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Semester"
            name="semester"
            type="number"
            value={form.semester}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Credit Hour"
            name="creditHour"
            type="number"
            value={form.creditHour}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Lecture Hours"
            name="lecture"
            type="number"
            value={form.lecture}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Lab Hours"
            name="lab"
            type="number"
            value={form.lab}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Tutorial Hours"
            name="tutorial"
            type="number"
            value={form.tutorial}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Likeness (comma-separated)"
            name="likeness"
            value={form.likeness}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? "Saving..." : "Add Course"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Course Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Course Code"
            name="code"
            value={form.code}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Course Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Course Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Year"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Semester"
            name="semester"
            type="number"
            value={form.semester}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Credit Hour"
            name="creditHour"
            type="number"
            value={form.creditHour}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Lecture Hours"
            name="lecture"
            type="number"
            value={form.lecture}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Lab Hours"
            name="lab"
            type="number"
            value={form.lab}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Tutorial Hours"
            name="tutorial"
            type="number"
            value={form.tutorial}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Likeness (comma-separated)"
            name="likeness"
            value={form.likeness}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? "Updating..." : "Update Course"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete the course "{selectedCourse?.name}"?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="secondary" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course List */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Courses Under Your Chair</h2>
        {filteredCourses.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Code</th>
                  <th className="py-3 px-6 text-left">Department</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Year</th>
                  <th className="py-3 px-6 text-left">Semester</th>
                  <th className="py-3 px-6 text-left">Chair</th>
                  <th className="py-3 px-6 text-left">Lecture</th>
                  <th className="py-3 px-6 text-left">Lab</th>
                  <th className="py-3 px-6 text-left">Tutorial</th>
                  <th className="py-3 px-6 text-left">Credit Hour</th>
                  <th className="py-3 px-6 text-left">Likeness</th>
                  <th className="py-3 px-6 text-left">Location</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {filteredCourses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-gray-50 transition duration-200 border-b border-gray-200"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">{course.name}</td>
                    <td className="py-3 px-6 text-left">{course.code}</td>
                    <td className="py-3 px-6 text-left">{course.department}</td>
                    <td className="py-3 px-6 text-left">{course.category}</td>
                    <td className="py-3 px-6 text-left">{course.year}</td>
                    <td className="py-3 px-6 text-left">{course.semester}</td>
                    <td className="py-3 px-6 text-left">{course.chair}</td>
                    <td className="py-3 px-6 text-left">{course.lecture}</td>
                    <td className="py-3 px-6 text-left">{course.lab}</td>
                    <td className="py-3 px-6 text-left">{course.tutorial}</td>
                    <td className="py-3 px-6 text-left">{course.creditHour}</td>
                    <td className="py-3 px-6 text-left">{course.likeness}</td>
                    <td className="py-3 px-6 text-left">{course.location}</td>
                    <td className="py-3 px-6 flex space-x-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-sm transition duration-200"
                        onClick={() => openEditCourseModal(course)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-sm transition duration-200"
                        onClick={() => openDeleteCourseModal(course)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CoursesCH;