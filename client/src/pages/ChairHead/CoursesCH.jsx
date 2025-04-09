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
  Check,
  BookOpen,
  Filter,
  Calendar,
  Clock,
  Hash,
  Building,
  Layers,
  CreditCard
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
  const [showFilters, setShowFilters] = useState(false);

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
      resetForm();
      setSelectedCourse(null);
      setOpenAddModal(false);
      setOpenEditModal(false);
    } catch (error) {
      console.error("Error saving course:", error);
    }
    setLoading(false);
  };

  // Reset form to initial state
  const resetForm = () => {
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main content area with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={24} />
              Course Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all courses under your chair
            </p>
          </div>
          <button 
            onClick={() => setOpenAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add New Course
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search courses by name, code, department or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  Year
                </label>
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
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  Semester
                </label>
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
          )}
        </div>

        {/* Course List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Courses Under Your Chair
              </h2>
              <div className="text-sm text-gray-500">
                Showing {currentItems.length} of {filteredCourses.length} courses
              </div>
            </div>
            
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <span className="ml-2 text-gray-600">Loading courses...</span>
              </div>
            )}
            
            {!loading && filteredCourses.length === 0 ? (
              <div className="text-center py-12 border border-gray-200 rounded-lg">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding a new course'}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setOpenAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Course
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile view - cards */}
                <div className="sm:hidden space-y-4">
                  {currentItems.map((course) => (
                    <div 
                      key={course._id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year/Sem
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credit
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{course.name}</div>
                                <div className="text-sm text-gray-500">{course.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              {course.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Year {course.year}</div>
                            <div className="text-sm text-gray-500">Sem {course.semester}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>L: {course.lecture}</div>
                            <div>Lab: {course.lab}</div>
                            <div>T: {course.tutorial}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.creditHour} CH
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openEditCourseModal(course)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center gap-1"
                              >
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => openDeleteCourseModal(course)}
                                className="text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredCourses.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg sm:px-6">
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredCourses.length)}</span> of{' '}
                  <span className="font-medium">{filteredCourses.length}</span> results
                </p>
              </div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? "text-gray-300 cursor-not-allowed" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? "text-gray-300 cursor-not-allowed" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  if (
                    windowWidth < 640 && 
                    totalPages > 5 && 
                    index + 1 !== 1 && 
                    index + 1 !== totalPages &&
                    Math.abs(index + 1 - currentPage) > 1
                  ) {
                    if (index + 1 === 2 || index + 1 === totalPages - 1) {
                      return (
                        <span 
                          key={index} 
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? "text-gray-300 cursor-not-allowed" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? "text-gray-300 cursor-not-allowed" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Last</span>
                  <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {openAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="text-indigo-600" size={20} />
                  Add New Course
                </h2>
                <button 
                  onClick={() => {
                    setOpenAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <BookOpen size={16} className="text-gray-500" />
                        Course Name
                      </label>
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
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Hash size={16} className="text-gray-500" />
                        Course Code
                      </label>
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
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Building size={16} className="text-gray-500" />
                        Department
                      </label>
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
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Layers size={16} className="text-gray-500" />
                        Category
                      </label>
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
                  </div>

                  {/* Course Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          Year
                        </label>
                        <input
                          type="number"
                          id="year"
                          name="year"
                          min="1"
                          value={form.year}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          Semester
                        </label>
                        <input
                          type="number"
                          id="semester"
                          name="semester"
                          min="1"
                          value={form.semester}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="creditHour" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-500" />
                        Credit Hours
                      </label>
                      <input
                        type="number"
                        id="creditHour"
                        name="creditHour"
                        min="1"
                        value={form.creditHour}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="lecture" className="block text-sm font-medium text-gray-700 mb-1">Lecture</label>
                        <input
                          type="number"
                          id="lecture"
                          name="lecture"
                          min="0"
                          value={form.lecture}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1">Lab</label>
                        <input
                          type="number"
                          id="lab"
                          name="lab"
                          min="0"
                          value={form.lab}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="tutorial" className="block text-sm font-medium text-gray-700 mb-1">Tutorial</label>
                        <input
                          type="number"
                          id="tutorial"
                          name="tutorial"
                          min="0"
                          value={form.tutorial}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="likeness" className="block text-sm font-medium text-gray-700 mb-1">
                      Likeness (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="likeness"
                      name="likeness"
                      value={form.likeness}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="e.g. Morning, Afternoon, Evening"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="Building and room number"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Edit className="text-indigo-600" size={20} />
                  Edit Course
                </h2>
                <button 
                  onClick={() => setOpenEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <BookOpen size={16} className="text-gray-500" />
                        Course Name
                      </label>
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
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Hash size={16} className="text-gray-500" />
                        Course Code
                      </label>
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
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Building size={16} className="text-gray-500" />
                        Department
                      </label>
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
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Layers size={16} className="text-gray-500" />
                        Category
                      </label>
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
                  </div>

                  {/* Course Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          Year
                        </label>
                        <input
                          type="number"
                          id="year"
                          name="year"
                          min="1"
                          value={form.year}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          Semester
                        </label>
                        <input
                          type="number"
                          id="semester"
                          name="semester"
                          min="1"
                          value={form.semester}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="creditHour" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-500" />
                        Credit Hours
                      </label>
                      <input
                        type="number"
                        id="creditHour"
                        name="creditHour"
                        min="1"
                        value={form.creditHour}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="lecture" className="block text-sm font-medium text-gray-700 mb-1">Lecture</label>
                        <input
                          type="number"
                          id="lecture"
                          name="lecture"
                          min="0"
                          value={form.lecture}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1">Lab</label>
                        <input
                          type="number"
                          id="lab"
                          name="lab"
                          min="0"
                          value={form.lab}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="tutorial" className="block text-sm font-medium text-gray-700 mb-1">Tutorial</label>
                        <input
                          type="number"
                          id="tutorial"
                          name="tutorial"
                          min="0"
                          value={form.tutorial}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="likeness" className="block text-sm font-medium text-gray-700 mb-1">
                      Likeness (comma-separated)
                    </label>
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
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setOpenEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Trash2 className="text-red-600" size={20} />
                  Delete Course
                </h2>
                <button 
                  onClick={() => setOpenDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete the course <span className="font-semibold">"{selectedCourse?.name}"</span>?
                </p>
                <p className="text-red-500 text-sm">
                  Warning: This action cannot be undone and will permanently remove this course.
                </p>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setOpenDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCourse}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesCH;