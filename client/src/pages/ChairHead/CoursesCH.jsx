import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  CreditCard,
  AlertCircle,
  Code,
  Database,
  Server,
  Monitor
} from "lucide-react";
import { toast } from "react-hot-toast";

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
    semester: "all",
    department: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

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
    setError(null);
    try {
      const { data } = await api.get(`/courses/${user.chair}`);
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Categorize courses based on department
  const categorizedCourses = {
    "Software Engineering": courses.filter(course =>
      course.department.toLowerCase().includes("software") ||
      course.department.toLowerCase().includes("swe") ||
      course.department.toLowerCase().includes("se")),

    "Computer Science": courses.filter(course =>
      course.department.toLowerCase().includes("computer science") ||
      course.department.toLowerCase().includes("cs") ||
      course.department.toLowerCase().includes("computing")),

    "Information Technology": courses.filter(course =>
      course.department.toLowerCase().includes("information") ||
      course.department.toLowerCase().includes("it") ||
      course.department.toLowerCase().includes("tech"))
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Process numeric inputs
    if (name === 'creditHour' || name === 'lecture' || name === 'lab' || name === 'tutorial' || name === 'year' || name === 'semester') {
      processedValue = value === '' ? '' : parseInt(value) || 0;
    }

    setForm({ ...form, [name]: processedValue });
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

    // Process likeness string to array
    const formData = {
      ...form,
      likeness: form.likeness ? form.likeness.split(',').map(item => item.trim()) : []
    };

    try {
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse._id}`, { ...formData, chair: user.chair });
        toast.success("Course updated successfully");
      } else {
        await api.post("/courses", { ...formData, chair: user.chair });
        toast.success("Course added successfully");
      }
      fetchCourses();
      resetForm();
      setSelectedCourse(null);
      setOpenAddModal(false);
      setOpenEditModal(false);
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
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
      likeness: course.likeness ? course.likeness.join(", ") : "",
      location: course.location || "",
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
      toast.success("Course deleted successfully");
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error("Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  // Get courses for the active tab
  const getActiveCourses = () => {
    let activeCourses = [];

    if (activeTab === "all") {
      activeCourses = courses;
    } else {
      activeCourses = categorizedCourses[activeTab] || [];
    }

    return activeCourses;
  };

  // Filter courses based on search term, filters, and active tab
  const filteredCourses = getActiveCourses().filter((course) => {
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

  // Reset to first page when search, filters, or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, activeTab]);

  // Get unique years and semesters for filter dropdowns
  const uniqueYears = [...new Set(courses.map(course => course.year))].sort();
  const uniqueSemesters = [...new Set(courses.map(course => course.semester))].sort();

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  // Get department icon
  const getDepartmentIcon = (department) => {
    if (department === "Software Engineering") {
      return <Code className="text-blue-500 dark:text-blue-400" size={20} />;
    } else if (department === "Computer Science") {
      return <Database className="text-purple-500 dark:text-purple-400" size={20} />;
    } else if (department === "Information Technology") {
      return <Server className="text-green-500 dark:text-green-400" size={20} />;
    } else {
      return <BookOpen className="text-indigo-500 dark:text-indigo-400" size={20} />;
    }
  };

  // Get department badge color
  const getDepartmentBadgeClass = (department) => {
    if (department.toLowerCase().includes("software") ||
      department.toLowerCase().includes("swe") ||
      department.toLowerCase().includes("se")) {
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300";
    } else if (department.toLowerCase().includes("computer science") ||
      department.toLowerCase().includes("cs") ||
      department.toLowerCase().includes("computing")) {
      return "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300";
    } else if (department.toLowerCase().includes("information") ||
      department.toLowerCase().includes("it") ||
      department.toLowerCase().includes("tech")) {
      return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300";
    } else {
      return "bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main content area with scrolling */}
      <div className="flex-1 overflow-y-auto">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={24} />
              Course Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search courses by name, code, department or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Filter size={18} />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                      Year
                    </label>
                    <select
                      id="year"
                      name="year"
                      value={filters.year}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="all">All Years</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                      Semester
                    </label>
                    <select
                      id="semester"
                      name="semester"
                      value={filters.semester}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="all">All Semesters</option>
                      {uniqueSemesters.map(semester => (
                        <option key={semester} value={semester}>Semester {semester}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Department Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-800 shadow-sm whitespace-nowrap">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${activeTab === "all"
                ? "bg-indigo-600 dark:bg-indigo-700 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } transition-colors`}
            >
              <Monitor size={16} />
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("Software Engineering")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${activeTab === "Software Engineering"
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } transition-colors`}
            >
              <Code size={16} />
              Software Engineering ({categorizedCourses["Software Engineering"].length})
            </button>
            <button
              onClick={() => setActiveTab("Computer Science")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${activeTab === "Computer Science"
                ? "bg-purple-600 dark:bg-purple-700 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } transition-colors`}
            >
              <Database size={16} />
              Computer Science ({categorizedCourses["Computer Science"].length})
            </button>
            <button
              onClick={() => setActiveTab("Information Technology")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${activeTab === "Information Technology"
                ? "bg-green-600 dark:bg-green-700 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } transition-colors`}
            >
              <Server size={16} />
              Information Technology ({categorizedCourses["Information Technology"].length})
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-700 dark:text-red-300">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
            <button
              onClick={fetchCourses}
              className="ml-auto bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter indicator badges */}
        {(filters.year !== "all" || filters.semester !== "all") && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.year !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                Year: {filters.year}
                <button
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  onClick={() => setFilters({ ...filters, year: "all" })}
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.semester !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                Semester: {filters.semester}
                <button
                  className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  onClick={() => setFilters({ ...filters, semester: "all" })}
                >
                  <X size={14} />
                </button>
              </span>
            )}
            <button
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
              onClick={() => setFilters({ year: "all", semester: "all" })}
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Course List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                {activeTab === "all" ? (
                  <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
                ) : (
                  getDepartmentIcon(activeTab)
                )}
                {activeTab === "all" ? "All Courses" : activeTab} Courses
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {currentItems.length} of {filteredCourses.length} courses
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mr-3" size={32} />
                <span className="text-gray-600 dark:text-gray-300">Loading courses...</span>
              </div>
            )}

            {!loading && filteredCourses.length === 0 ? (
              <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No courses found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || filters.year !== "all" || filters.semester !== "all"
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding a new course'}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setOpenAddModal(true)}
                    className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{course.name}</h3>
                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {course.code}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${getDepartmentBadgeClass(course.department)}`}>
                          {course.department}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{course.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Year:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{course.year}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{course.semester}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Credit Hours:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{course.creditHour}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Hours:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Lecture:{course.lecture} | Lab:{course.lab} | Tutorial:{course.tutorial}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                          onClick={() => openEditCourseModal(course)}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
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
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">
                          Course Name
                        </th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                          Code
                        </th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                          Department
                        </th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                          Year/Sem
                        </th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                          Hours
                        </th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12">
                          Credit
                        </th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentItems.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-md flex items-center justify-center">
                                {course.department.toLowerCase().includes("software") ||
                                  course.department.toLowerCase().includes("swe") ||
                                  course.department.toLowerCase().includes("se") ? (
                                  <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : course.department.toLowerCase().includes("computer science") ||
                                  course.department.toLowerCase().includes("cs") ||
                                  course.department.toLowerCase().includes("computing") ? (
                                  <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                ) : course.department.toLowerCase().includes("information") ||
                                  course.department.toLowerCase().includes("it") ||
                                  course.department.toLowerCase().includes("tech") ? (
                                  <Server className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                )}
                              </div>
                              <div className="ml-2 sm:ml-3">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">
                                  {course.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">
                                  {course.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                              {course.code}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-md ${getDepartmentBadgeClass(course.department)}`}>
                              {course.department}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                            <div className="text-xs text-gray-900 dark:text-white leading-tight">Y: {course.year}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">S: {course.semester}</div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            <div className="leading-tight">L: {course.lecture}</div>
                            <div className="leading-tight">Lab: {course.lab}</div>
                            <div className="leading-tight">T: {course.tutorial}</div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            {course.creditHour} CH
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                            <div className="flex justify-end space-x-1 sm:space-x-2">
                              <button
                                onClick={() => openEditCourseModal(course)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors flex items-center gap-0.5 sm:gap-1 p-1"
                              >
                                <Edit size={14} />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                onClick={() => openDeleteCourseModal(course)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors flex items-center gap-0.5 sm:gap-1 p-1"
                              >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">Delete</span>
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
          <div className="mt-4 flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg sm:px-6">
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredCourses.length)}</span> of{' '}
                  <span className="font-medium">{filteredCourses.length}</span> results
                </p>
              </div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${currentPage === 1
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${currentPage === 1
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  // For mobile, show only current, first, last and adjacent pages
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
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === index + 1
                        ? "z-10 bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-300"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${currentPage === totalPages
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${currentPage === totalPages
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
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

      {/* Modals */}
      <AnimatePresence>
        {/* Add Course Modal */}
        {openAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={() => setOpenAddModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Plus className="text-indigo-600 dark:text-indigo-400" size={20} />
                    Add New Course
                  </h2>
                  <button
                    onClick={() => {
                      setOpenAddModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Course Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                          Course Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Hash size={16} className="text-gray-500 dark:text-gray-400" />
                          Course Code
                        </label>
                        <input
                          type="text"
                          id="code"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Building size={16} className="text-gray-500 dark:text-gray-400" />
                          Department
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        >
                          <option value="">Select Department</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Layers size={16} className="text-gray-500 dark:text-gray-400" />
                          Category
                        </label>
                        <input
                          type="text"
                          id="category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
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
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <Clock size={16} className="text-gray-500 dark:text-gray-400" />
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
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="creditHour" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <CreditCard size={16} className="text-gray-500 dark:text-gray-400" />
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
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="lecture" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lecture</label>
                          <input
                            type="number"
                            id="lecture"
                            name="lecture"
                            min="0"
                            value={form.lecture}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="lab" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab</label>
                          <input
                            type="number"
                            id="lab"
                            name="lab"
                            min="0"
                            value={form.lab}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="tutorial" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tutorial</label>
                          <input
                            type="number"
                            id="tutorial"
                            name="tutorial"
                            min="0"
                            value={form.tutorial}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="likeness" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Likeness (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="likeness"
                        name="likeness"
                        value={form.likeness}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        placeholder="e.g. Morning, Afternoon, Evening"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        placeholder="Building and room number"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAddModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                      Add Course
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}

        {/* Edit Course Modal */}
        {openEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={() => setOpenEditModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Edit className="text-indigo-600 dark:text-indigo-400" size={20} />
                    Edit Course
                  </h2>
                  <button
                    onClick={() => setOpenEditModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Course Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                          Course Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Hash size={16} className="text-gray-500 dark:text-gray-400" />
                          Course Code
                        </label>
                        <input
                          type="text"
                          id="code"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Building size={16} className="text-gray-500 dark:text-gray-400" />
                          Department
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        >
                          <option value="">Select Department</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Layers size={16} className="text-gray-500 dark:text-gray-400" />
                          Category
                        </label>
                        <input
                          type="text"
                          id="category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
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
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <Clock size={16} className="text-gray-500 dark:text-gray-400" />
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
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="creditHour" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <CreditCard size={16} className="text-gray-500 dark:text-gray-400" />
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
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="lecture" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lecture</label>
                          <input
                            type="number"
                            id="lecture"
                            name="lecture"
                            min="0"
                            value={form.lecture}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="lab" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab</label>
                          <input
                            type="number"
                            id="lab"
                            name="lab"
                            min="0"
                            value={form.lab}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                        <div>
                          <label htmlFor="tutorial" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tutorial</label>
                          <input
                            type="number"
                            id="tutorial"
                            name="tutorial"
                            min="0"
                            value={form.tutorial}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="likeness" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Likeness (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="likeness"
                        name="likeness"
                        value={form.likeness}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setOpenEditModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                      Update Course
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {openDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenDeleteModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Trash2 className="text-red-600 dark:text-red-500" size={20} />
                    Delete Course
                  </h2>
                  <button
                    onClick={() => setOpenDeleteModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete the course <span className="font-semibold">"{selectedCourse?.name}"</span>?
                  </p>
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    Warning: This action cannot be undone and will permanently remove this course.
                  </p>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setOpenDeleteModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteCourse}
                      disabled={loading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      Delete Course
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesCH;