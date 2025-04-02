import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Loader2,
  X,
  Check
} from "lucide-react";

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
  const [filters, setFilters] = useState({
    year: "all",
    semester: "all"
  });

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

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1); // Reset to first page when filters change
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

  // Filter courses based on search term and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearchTerm =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = filters.year === "all" || course.year.toString() === filters.year;
    const matchesSemester = filters.semester === "all" || course.semester.toString() === filters.semester;
    
    return matchesSearchTerm && matchesYear && matchesSemester;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Get unique years and semesters for filter dropdowns
  const uniqueYears = [...new Set(courses.map(course => course.year))].sort();
  const uniqueSemesters = [...new Set(courses.map(course => course.semester))].sort();

  return (
    <div className="p-2 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        <button 
          onClick={() => setOpenAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add New Course
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by course name, code, department or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              id="semester"
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="all">All Semesters</option>
              {uniqueSemesters.map(semester => (
                <option key={semester} value={semester}>Semester {semester}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {openAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Course</h2>
                <button 
                  onClick={() => setOpenAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input
                      type="number"
                      id="semester"
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="creditHour" className="block text-sm font-medium text-gray-700 mb-1">Credit Hour</label>
                    <input
                      type="number"
                      id="creditHour"
                      name="creditHour"
                      value={form.creditHour}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="lecture" className="block text-sm font-medium text-gray-700 mb-1">Lecture Hours</label>
                    <input
                      type="number"
                      id="lecture"
                      name="lecture"
                      value={form.lecture}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1">Lab Hours</label>
                    <input
                      type="number"
                      id="lab"
                      name="lab"
                      value={form.lab}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="tutorial" className="block text-sm font-medium text-gray-700 mb-1">Tutorial Hours</label>
                    <input
                      type="number"
                      id="tutorial"
                      name="tutorial"
                      value={form.tutorial}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="likeness" className="block text-sm font-medium text-gray-700 mb-1">Likeness (comma-separated)</label>
                  <input
                    type="text"
                    id="likeness"
                    name="likeness"
                    value={form.likeness}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Add Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {openEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Course</h2>
                <button 
                  onClick={() => setOpenEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input
                      type="number"
                      id="semester"
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="creditHour" className="block text-sm font-medium text-gray-700 mb-1">Credit Hour</label>
                    <input
                      type="number"
                      id="creditHour"
                      name="creditHour"
                      value={form.creditHour}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="lecture" className="block text-sm font-medium text-gray-700 mb-1">Lecture Hours</label>
                    <input
                      type="number"
                      id="lecture"
                      name="lecture"
                      value={form.lecture}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1">Lab Hours</label>
                    <input
                      type="number"
                      id="lab"
                      name="lab"
                      value={form.lab}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="tutorial" className="block text-sm font-medium text-gray-700 mb-1">Tutorial Hours</label>
                    <input
                      type="number"
                      id="tutorial"
                      name="tutorial"
                      value={form.tutorial}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="likeness" className="block text-sm font-medium text-gray-700 mb-1">Likeness (comma-separated)</label>
                  <input
                    type="text"
                    id="likeness"
                    name="likeness"
                    value={form.likeness}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Update Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Delete Course</h2>
                <button 
                  onClick={() => setOpenDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <p>Are you sure you want to delete the course "{selectedCourse?.name}"?</p>
                <p className="text-red-500 text-sm">This action cannot be undone.</p>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setOpenDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCourse}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Courses Under Your Chair</h2>
        
        {loading && (
          <div className="flex justify-center my-8">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        )}
        
        {!loading && filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No courses found. {searchTerm && 'Try adjusting your search or filters.'}</p>
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
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                      onClick={() => openEditCourseModal(course)}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                      onClick={() => openDeleteCourseModal(course)}
                    >
                      <Trash2 size={16} />
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
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-sm transition duration-200 flex items-center gap-1"
                          onClick={() => openEditCourseModal(course)}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-sm transition duration-200 flex items-center gap-1"
                          onClick={() => openDeleteCourseModal(course)}
                        >
                          <Trash2 size={16} />
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
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    title="First Page"
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
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
                    className={`p-2 rounded-md ${
                      currentPage === totalPages 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                  
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Last Page"
                  >
                    <ChevronsRight size={18} />
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