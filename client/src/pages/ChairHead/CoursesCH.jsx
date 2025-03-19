// CoursesCH.jsx
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
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Adjust items per page based on screen size
      if (window.innerWidth < 640) {
        setItemsPerPage(5);
      } else {
        setItemsPerPage(10);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearchTerm;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-2 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenAddModal(true)}
          className="w-full sm:w-auto"
        >
          Add New Course
        </Button>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by course name, code, department or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size={windowWidth < 640 ? "small" : "medium"}
        />
      </div>

      {/* Add Course Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
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
      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
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
      <Dialog 
        open={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete the course "{selectedCourse?.name}"?</p>
          <p className="text-red-500 text-sm mt-2">This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="error" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course List */}
      <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Courses Under Your Chair</h2>
        
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {!loading && filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No courses found. {searchTerm && 'Try adjusting your search.'}</p>
          </div>
        ) : (
          <>
            {/* Mobile view - cards */}
            <div className="sm:hidden space-y-4">
              {currentItems.map((course) => (
                <div 
                  key={course._id} 
                  className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{course.name}</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {course.code}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <p className="font-medium">{course.department}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{course.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Year:</span>
                      <p className="font-medium">{course.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Semester:</span>
                      <p className="font-medium">{course.semester}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Credit Hours:</span>
                      <p className="font-medium">{course.creditHour}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hours:</span>
                      <p className="font-medium">L:{course.lecture} | Lab:{course.lab} | T:{course.tutorial}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200"
                      onClick={() => openEditCourseModal(course)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200"
                      onClick={() => openDeleteCourseModal(course)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop view - table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Code</th>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Year/Sem</th>
                    <th className="py-3 px-4 text-left">Hours</th>
                    <th className="py-3 px-4 text-left">Credit</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm font-light">
                  {currentItems.map((course) => (
                    <tr
                      key={course._id}
                      className="hover:bg-gray-50 transition duration-200 border-b border-gray-200"
                    >
                      <td className="py-3 px-4 text-left font-medium">{course.name}</td>
                      <td className="py-3 px-4 text-left">{course.code}</td>
                      <td className="py-3 px-4 text-left">{course.department}</td>
                      <td className="py-3 px-4 text-left">{course.category}</td>
                      <td className="py-3 px-4 text-left">{course.year}/{course.semester}</td>
                      <td className="py-3 px-4 text-left">
                        L:{course.lecture} | Lab:{course.lab} | T:{course.tutorial}
                      </td>
                      <td className="py-3 px-4 text-left">{course.creditHour}</td>
                      <td className="py-3 px-4 flex space-x-2">
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    // Show only a subset of page numbers on small screens
                    if (
                      windowWidth < 640 && 
                      totalPages > 5 && 
                      index + 1 !== 1 && 
                      index + 1 !== totalPages &&
                      Math.abs(index + 1 - currentPage) > 1
                    ) {
                      if (index + 1 === 2 || index + 1 === totalPages - 1) {
                        return <span key={index} className="px-3 py-1">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === index + 1
                            ? "bg-indigo-600 text-white"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesCH;