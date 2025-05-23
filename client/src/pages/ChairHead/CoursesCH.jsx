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
  Monitor,
  Send,
  Users,
  User,
  MoreHorizontal,
  Shield,
  Unlink,
  Info,
  Archive,
  Play,
  File
} from "lucide-react";
import { toast } from "react-hot-toast";

const CoursesCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [rawResponse, setRawResponse] = useState(null); // For debugging
  const getChairValue = () => (user.role === "COC" ? user.role : user.chair);
  const isHeadOfFaculty = user.role === "HeadOfFaculty";
  const isChairOrCoc = user.role === "ChairHead" || user.role === "COC";

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
    chair: "",
    likeness: "",
    location: "",
    status: "draft" // Default status for new courses
  });
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openUnassignModal, setOpenUnassignModal] = useState(false);
  const [openDebugModal, setOpenDebugModal] = useState(false); // For debugging
  const [openActivateModal, setOpenActivateModal] = useState(false); // Modal for bulk activation
  const [openArchiveModal, setOpenArchiveModal] = useState(false); // Modal for bulk archiving
  const [openDraftModal, setOpenDraftModal] = useState(false); // Modal for bulk draft conversion
  // New modal for converting assigned courses back to active status
  const [openReactivateModal, setOpenReactivateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    year: "all",
    semester: "all",
    chair: "",
    status: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [chairHeads, setChairHeads] = useState([]);
  const [selectedChair, setSelectedChair] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

  // Fetch courses based on role
  useEffect(() => {
    fetchCourses();
    if (isHeadOfFaculty) {
      fetchChairHeads();
    }
  }, [user.role]);

  const fetchChairHeads = async () => {
    try {
      const response = await api.get("/chairs");
      setChairHeads(response.data);
    } catch (err) {
      console.error("Error fetching chair :", err);
      toast.error("Failed to fetch chair ");
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (isHeadOfFaculty) {
        // Fetch all courses for Head of Faculty
        response = await api.get("/courses");
      } else if (user.role === "ChairHead") {
        // Fetch only assigned courses for Chair Head
        response = await api.get(`/courses/assigned/${user.chair}`);
      } else if (user.role === "COC") {
        // Fetch only assigned courses for COC
        response = await api.get(`/courses/assigned/COC`);
      } else {
        // Fallback
        response = await api.get("/courses");
      }

      // Store the raw response for debugging
      setRawResponse(response.data);

      // Log the response structure
      console.log("API Response:", JSON.stringify(response.data));

      // Check if response.data is an array or if it has a nested property that contains the array
      let coursesData;
      if (Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find an array in the response
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        coursesData = possibleArrays.length > 0 ? possibleArrays[0] : [];

        // If we found a nested array, log it
        if (possibleArrays.length > 0) {
          console.log("Found courses in nested property:", possibleArrays[0]);
        }
      } else {
        coursesData = [];
      }

      // Ensure each course has required properties
      const validCoursesData = coursesData.map(course => ({
        ...course,
        _id: course._id || course.id || `temp-${Math.random()}`,
        name: course.name || "Unnamed Course",
        code: course.code || "No Code",
        department: course.department || "Uncategorized",
        category: course.category || "",
        year: course.year || 1,
        semester: course.semester || 1,
        status: course.status || "draft"
      }));

      console.log("Processed courses:", validCoursesData.length);
      setCourses(validCoursesData);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
      toast.error("Failed to fetch courses");
      setCourses([]); // Set to empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  // Categorize courses based on department - with safety checks
  const coursesArray = Array.isArray(courses) ? courses : [];
  console.log("Courses array length:", coursesArray.length);

  const categorizedCourses = {
    "Software Engineering": coursesArray.filter(course =>
      course.department?.toLowerCase?.().includes("software") ||
      course.department?.toLowerCase?.().includes("swe") ||
      course.department?.toLowerCase?.().includes("se")),

    "Computer Science": coursesArray.filter(course =>
      course.department?.toLowerCase?.().includes("computer science") ||
      course.department?.toLowerCase?.().includes("cs") ||
      course.department?.toLowerCase?.().includes("computing")),

    "Information Technology": coursesArray.filter(course =>
      course.department?.toLowerCase?.().includes("information") ||
      course.department?.toLowerCase?.().includes("it") ||
      course.department?.toLowerCase?.().includes("tech"))
  };

  // Count of categorized courses for debugging
  console.log("SE courses:", categorizedCourses["Software Engineering"].length);
  console.log("CS courses:", categorizedCourses["Computer Science"].length);
  console.log("IT courses:", categorizedCourses["Information Technology"].length);

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

    const formData = {
      ...form,
      likeness: form.likeness ? form.likeness.split(',').map(item => item.trim()) : [],
      status: selectedCourse ? form.status : "draft", // Always use draft for new courses
      createdBy: user._id // Track who created the course
    };

    try {
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse._id}`, formData);
        toast.success("Course updated successfully");
      } else {
        await api.post("/courses", formData);
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

  // Handle bulk activation of courses (now assigns them)
  const handleBulkActivate = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to assign");
      return;
    }

    setBulkActionLoading(true);
    try {
      await api.post("/courses/bulk-update", {
        courseIds: selectedCourses,
        updates: {
          status: "assigned"
        },
        actionBy: user._id
      });

      toast.success(`Successfully assigned ${selectedCourses.length} courses`);
      setSelectedCourses([]);
      setOpenActivateModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Error assigning courses:", err);
      toast.error("Failed to assign courses");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // New handler: Convert assigned courses back to active
  const handleBulkReactivate = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to convert to active");
      return;
    }

    setBulkActionLoading(true);
    try {
      await api.post("/courses/bulk-update", {
        courseIds: selectedCourses,
        updates: {
          status: "active"
        },
        actionBy: user._id
      });

      toast.success(`Successfully converted ${selectedCourses.length} courses to active status`);
      setSelectedCourses([]);
      setOpenReactivateModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Error converting courses to active:", err);
      toast.error("Failed to convert courses to active status");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk archival of courses
  const handleBulkArchive = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to archive");
      return;
    }

    setBulkActionLoading(true);
    try {
      await api.post("/courses/bulk-update", {
        courseIds: selectedCourses,
        updates: {
          status: "archived",
          assignedTo: null // Remove assignment
        },
        actionBy: user._id
      });

      toast.success(`Successfully archived ${selectedCourses.length} courses`);
      setSelectedCourses([]);
      setOpenArchiveModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Error archiving courses:", err);
      toast.error("Failed to archive courses");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk conversion to draft status
  const handleBulkDraft = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to convert to draft");
      return;
    }

    setBulkActionLoading(true);
    try {
      await api.post("/courses/bulk-update", {
        courseIds: selectedCourses,
        updates: {
          status: "draft",
          assignedTo: null // Remove assignment
        },
        actionBy: user._id
      });

      toast.success(`Successfully converted ${selectedCourses.length} courses to draft status`);
      setSelectedCourses([]);
      setOpenDraftModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Error converting courses to draft:", err);
      toast.error("Failed to convert courses to draft status");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle course assignment (now activates them)
  const handleAssignCourses = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to activate");
      return;
    }

    if (!selectedChair) {
      toast.error("Please select a chair to activate courses for");
      return;
    }

    setLoading(true);
    try {
      await api.post("/courses/assign", {
        courseIds: selectedCourses,
        assignedTo: selectedChair,
        assignedBy: user._id,
        status: "active"
      });

      toast.success(`Successfully activated ${selectedCourses.length} courses for ${selectedChair}`);
      setSelectedCourses([]);
      setSelectedChair("");
      setOpenAssignModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Error activating courses:", err);
      toast.error("Failed to activate courses");
    } finally {
      setLoading(false);
    }
  };

  // Handle course unassignment
  const handleUnassignCourses = async () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to unassign");
      return;
    }

    setLoading(true);
    try {
      await api.post("/courses/unassign", {
        courseIds: selectedCourses,
        unassignedBy: user._id,
        status: "draft" // Reset to draft after unassigned
      });

      toast.success(`Successfully unassigned ${selectedCourses.length} courses`);
      setSelectedCourses([]);
      setOpenUnassignModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Error unassigning courses:", err);
      toast.error("Failed to unassign courses");
    } finally {
      setLoading(false);
    }
  };

  // Toggle course selection for assignment
  const toggleCourseSelection = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
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
      chair: "",
      likeness: "",
      location: "",
      status: "draft"
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
      status: course.status || "draft"
    });
    setOpenEditModal(true);
  };

  // Open delete confirmation modal
  const openDeleteCourseModal = (course) => {
    setSelectedCourse(course);
    setOpenDeleteModal(true);
  };

  // Open assign courses modal (now activate courses modal)
  const openAssignCoursesModal = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to activate");
      return;
    }
    setOpenAssignModal(true);
  };

  // Open unassign courses modal
  const openUnassignCoursesModal = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to unassign");
      return;
    }
    setOpenUnassignModal(true);
  };

  // Open activate courses modal (now assign courses modal)
  const openActivateCoursesModal = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to assign");
      return;
    }
    setOpenActivateModal(true);
  };

  // New: Open reactivate courses modal (convert from assigned to active)
  const openReactivateCoursesModal = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to convert to active");
      return;
    }
    setOpenReactivateModal(true);
  };

  // Open archive courses modal
  const openArchiveCoursesModal = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to archive");
      return;
    }
    setOpenArchiveModal(true);
  };

  // Open draft courses modal
  const openDraftCoursesModal = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to convert to draft");
      return;
    }
    setOpenDraftModal(true);
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
      activeCourses = coursesArray;
    } else {
      activeCourses = categorizedCourses[activeTab] || [];
    }

    return activeCourses;
  };

  // Filter courses based on search term, filters, and active tab
  const activeCourses = getActiveCourses();
  console.log("Active courses (pre-filter):", activeCourses.length);

  const filteredCourses = activeCourses.filter((course) => {
    // Search term filter
    const matchesSearchTerm = searchTerm === "" || (
      (course.name && course.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.department && course.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Year filter
    const matchesYear = filters.year === "all" ||
      (course.year !== undefined && course.year.toString() === filters.year);

    // Semester filter
    const matchesSemester = filters.semester === "all" ||
      (course.semester !== undefined && course.semester.toString() === filters.semester);

    // Status filter
    const matchesStatus = filters.status === "all" ||
      (course.status !== undefined && course.status === filters.status);

    // Chair filter
    const matchesChair = !filters.chair ||
      (course.chair === filters.chair) ||
      (course.assignedTo === filters.chair);

    return matchesSearchTerm && matchesYear && matchesSemester && matchesStatus && matchesChair;
  });

  console.log("Filtered courses:", filteredCourses.length);
  console.log("Filter state:", filters);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  console.log("Current page items:", currentItems.length);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search, filters, or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, activeTab]);

  // Get unique years and semesters for filter dropdowns
  const uniqueYears = [...new Set(coursesArray.filter(course => course.year !== undefined).map(course => course.year))].sort();
  const uniqueSemesters = [...new Set(coursesArray.filter(course => course.semester !== undefined).map(course => course.semester))].sort();

  // Status options for filter dropdown
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "assigned", label: "Assigned" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" }
  ];

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  // Get department icon
  const getDepartmentIcon = (department) => {
    if (!department) return <BookOpen className="text-indigo-500 dark:text-indigo-400" size={20} />;

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
    if (!department) return "bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-300";

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

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-300";
      case "assigned":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300";
      case "active":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300";
      case "archived":
        return "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-300";
    }
  };

  // Count courses by status
  const assignedCoursesCount = coursesArray.filter(course => course.status === "assigned").length;
  const draftCoursesCount = coursesArray.filter(course => course.status === "draft").length;
  const activeCoursesCount = coursesArray.filter(course => course.status === "active").length;
  const archivedCoursesCount = coursesArray.filter(course => course.status === "archived").length;

  // Check if selected courses contain courses with specific status
  const selectedAssignedCoursesCount = selectedCourses.filter(id =>
    coursesArray.find(course => course._id === id && course.status === "assigned")
  ).length;

  const selectedActiveCoursesCount = selectedCourses.filter(id =>
    coursesArray.find(course => course._id === id && course.status === "active")
  ).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main content area with scrolling */}
      <div className="flex-1 overflow-y-auto">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={24} />
              {isHeadOfFaculty ? "Faculty Course Management" : "Course Management"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isHeadOfFaculty
                ? "Create and activate courses to department chairs"
                : "Manage courses assigned to your chair"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {isHeadOfFaculty && (
              <button
                onClick={() => setOpenAddModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                <Plus size={18} />
                Add New Course
              </button>
            )}

          </div>
        </div>

        {/* Course status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                <File className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Draft</p>
                <p className="font-semibold text-lg text-gray-800 dark:text-white">{draftCoursesCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300 rounded-lg">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Assigned</p>
                <p className="font-semibold text-lg text-gray-800 dark:text-white">{assignedCoursesCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 rounded-lg">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Active</p>
                <p className="font-semibold text-lg text-gray-800 dark:text-white">{activeCoursesCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-lg">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Archived</p>
                <p className="font-semibold text-lg text-gray-800 dark:text-white">{archivedCoursesCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        {selectedCourses.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCourses.length} courses selected
              </span>
              <div className="flex-1"></div>

              {/* Conditional buttons based on user role */}
              <div className="flex flex-wrap gap-2">
                {/* For HeadOfFaculty */}
                {isHeadOfFaculty && (
                  <>
                    <button
                      onClick={openAssignCoursesModal}
                      className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg transition-colors text-sm"
                    >
                      <Play size={16} />
                      Activate
                    </button>
                    {selectedActiveCoursesCount > 0 && (
                      <button
                        onClick={openUnassignCoursesModal}
                        className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-3 rounded-lg transition-colors text-sm"
                      >
                        <Unlink size={16} />
                        Unassign
                      </button>
                    )}
                    <button
                      onClick={openArchiveCoursesModal}
                      className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg transition-colors text-sm"
                    >
                      <Archive size={16} />
                      Archive
                    </button>
                    <button
                      onClick={openDraftCoursesModal}
                      className="flex items-center justify-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white py-1.5 px-3 rounded-lg transition-colors text-sm"
                    >
                      <File size={16} />
                      Make Draft
                    </button>
                  </>
                )}

                {/* For ChairHead or COC */}
                {isChairOrCoc && (
                  <>
                    {selectedActiveCoursesCount > 0 && (
                      <button
                        onClick={openActivateCoursesModal}
                        className="flex items-center justify-center gap-1.5 bg-yellow-600 hover:bg-yellow-700 text-white py-1.5 px-3 rounded-lg transition-colors text-sm"
                      >
                        <Send size={16} />
                        Assign
                      </button>
                    )}
                    {selectedAssignedCoursesCount > 0 && (
                      <button
                        onClick={openReactivateCoursesModal}
                        className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg transition-colors text-sm"
                      >
                        <Play size={16} />
                        Convert to Active
                      </button>
                    )}
                  </>
                )}

                {/* Clear selection button for all roles */}
                <button
                  onClick={() => setSelectedCourses([])}
                  className="flex items-center justify-center gap-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-1.5 px-3 rounded-lg transition-colors text-sm"
                >
                  <X size={16} />
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <Shield size={16} className="text-gray-500 dark:text-gray-400" />
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="chair" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <Users size={16} className="text-gray-500 dark:text-gray-400" />
                      Chair
                    </label>
                    <select
                      id="chair"
                      name="chair"
                      value={filters.chair || ""}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="">All Chairs</option>
                      <option value="COC">COC</option>
                      {chairHeads.map(chair => (
                        <option key={chair._id} value={chair.name}>{chair.name}</option>
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
              All Courses ({coursesArray.length})
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
        {(filters.year !== "all" || filters.semester !== "all" || filters.chair || filters.status !== "all") && (
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
            {filters.chair && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300">
                Chair: {filters.chair}
                <button
                  className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  onClick={() => setFilters({ ...filters, chair: "" })}
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.status !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                Status: {statusOptions.find(option => option.value === filters.status)?.label || filters.status}
                <button
                  className="ml-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                  onClick={() => setFilters({ ...filters, status: "all" })}
                >
                  <X size={14} />
                </button>
              </span>
            )}
            <button
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
              onClick={() => setFilters({ year: "all", semester: "all", chair: "", status: "all" })}
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
                  {searchTerm || filters.year !== "all" || filters.semester !== "all" || filters.department !== "all" || filters.status !== "all"
                    ? 'Try adjusting your search or filters'
                    : isHeadOfFaculty ? 'Get started by adding a new course' : 'No courses have been assigned to you yet'}
                </p>
                {isHeadOfFaculty && (
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
                )}
              </div>
            ) : (
              <>
                {/* Mobile view - cards */}
                <div className="sm:hidden space-y-4">
                  {currentItems.map((course) => (
                    <div
                      key={course._id}
                      className={`border ${selectedCourses.includes(course._id) ? 'border-indigo-500 dark:border-indigo-400 shadow-md' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="mr-2">
                          <input
                            type="checkbox"
                            id={`select-${course._id}`}
                            checked={selectedCourses.includes(course._id)}
                            onChange={() => toggleCourseSelection(course._id)}
                            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{course.name}</h3>
                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {course.code}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${getDepartmentBadgeClass(course.department)}`}>
                          {course.department}
                        </span>
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${getStatusBadgeClass(course.status || 'draft')}`}>
                          {course.status || 'Draft'}
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
                        {course.assignedTo && (
                          <div className="col-span-2">
                            <span className="text-gray-500 dark:text-gray-400">Assigned To:</span>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{course.assignedTo}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        {isHeadOfFaculty && (
                          <>
                            <button
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                              onClick={() => openEditCourseModal(course)}
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            {course.status === "active" && (
                              <button
                                className="flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                                onClick={() => {
                                  setSelectedCourses([course._id]);
                                  openUnassignCoursesModal();
                                }}
                              >
                                <Unlink size={16} />
                                Unassign
                              </button>
                            )}
                            <button
                              className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                              onClick={() => openDeleteCourseModal(course)}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </>
                        )}
                        {isChairOrCoc && (
                          <>
                            {course.status === "active" && (
                              <button
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                                onClick={() => {
                                  setSelectedCourses([course._id]);
                                  openActivateCoursesModal();
                                }}
                              >
                                <Send size={16} />
                                Assign
                              </button>
                            )}
                            {course.status === "assigned" && (
                              <button
                                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                                onClick={() => {
                                  setSelectedCourses([course._id]);
                                  openReactivateCoursesModal();
                                }}
                              >
                                <Play size={16} />
                                Make Active
                              </button>
                            )}
                          </>
                        )}
                        {!isHeadOfFaculty && !isChairOrCoc && (
                          <button
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm transition duration-200 flex items-center justify-center gap-1"
                            onClick={() => {/* View course details */ }}
                          >
                            <BookOpen size={16} />
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view - table */}
                <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-8">
                          <input
                            type="checkbox"
                            checked={currentItems.length > 0 && currentItems.every(course => selectedCourses.includes(course._id))}
                            onChange={() => {
                              if (currentItems.every(course => selectedCourses.includes(course._id))) {
                                setSelectedCourses(selectedCourses.filter(id => !currentItems.some(course => course._id === id)));
                              } else {
                                const currentIds = currentItems.map(course => course._id);
                                const newSelected = [...new Set([...selectedCourses, ...currentIds])];
                                setSelectedCourses(newSelected);
                              }
                            }}
                            className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                        </th>
                        <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                          Year/Sem/Credits
                        </th>
                        <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status/Assigned
                        </th>
                        <th scope="col" className="px-2 py-1.5 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentItems.map((course) => (
                        <tr
                          key={course._id}
                          className={`${selectedCourses.includes(course._id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors`}
                        >
                          <td className="px-1 py-1.5 whitespace-nowrap align-top">
                            <input
                              type="checkbox"
                              checked={selectedCourses.includes(course._id)}
                              onChange={() => toggleCourseSelection(course._id)}
                              className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap align-top">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 dark:bg-indigo-900/40 rounded-md flex items-center justify-center mr-2">
                                {course.department?.toLowerCase().includes("software") || course.department?.toLowerCase().includes("swe") ? (
                                  <Code className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                ) : course.department?.toLowerCase().includes("computer science") || course.department?.toLowerCase().includes("cs") ? (
                                  <Database className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                ) : course.department?.toLowerCase().includes("information") || course.department?.toLowerCase().includes("it") ? (
                                  <Server className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-xs">
                                  {course.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-xs">
                                  <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 mr-1">
                                    {course.code}
                                  </span>
                                  <span className="text-xs">{course.category}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap align-top">
                            <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-md ${getDepartmentBadgeClass(course.department)}`}>
                              {course.department}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap align-top">
                            <div className="flex flex-col space-y-0.5">
                              <div className="text-xs text-gray-900 dark:text-white">
                                <span className="font-medium">Y{course.year}</span> / <span className="font-medium">S{course.semester}</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">{course.creditHour} CR</span> ({course.lecture}L-{course.lab}Lab-{course.tutorial}T)
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap align-top">
                            <div className="flex flex-col space-y-1">
                              <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-md ${getStatusBadgeClass(course.status || 'draft')}`}>
                                {course.status || 'Draft'}
                              </span>
                              {course.assignedTo && (
                                <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                  <User size={12} className="mr-1 text-gray-500" />
                                  {course.assignedTo}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-right align-top">
                            <div className="flex justify-end items-center space-x-0.5">
                              {isHeadOfFaculty ? (
                                <>
                                  <button
                                    onClick={() => openEditCourseModal(course)}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors p-1"
                                    title="Edit course"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  {course.status === "active" && (
                                    <button
                                      onClick={() => {
                                        setSelectedCourses([course._id]);
                                        openUnassignCoursesModal();
                                      }}
                                      className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors p-1"
                                      title="Unassign course"
                                    >
                                      <Unlink size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openDeleteCourseModal(course)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors p-1"
                                    title="Delete course"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              ) : isChairOrCoc ? (
                                <>
                                  {course.status === "active" && (
                                    <button
                                      onClick={() => {
                                        setSelectedCourses([course._id]);
                                        openActivateCoursesModal();
                                      }}
                                      className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 transition-colors p-1"
                                      title="Assign course"
                                    >
                                      <Send size={14} />
                                    </button>
                                  )}
                                  {course.status === "assigned" && (
                                    <button
                                      onClick={() => {
                                        setSelectedCourses([course._id]);
                                        openReactivateCoursesModal();
                                      }}
                                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors p-1"
                                      title="Make course active"
                                    >
                                      <Play size={14} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors p-1"
                                  title="View course details"
                                >
                                  <BookOpen size={14} />
                                </button>
                              )}
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
        {/* Debug Modal */}
        {openDebugModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenDebugModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto z-50"
              onClick={(e) => e.stopPropagation()}
            >

            </motion.div>
          </>
        )}

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
                            max="5"
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
                            max="3"
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
                        placeholder="Similar courses, separated by commas"
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
                        placeholder="Campus"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="chair" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <Users size={16} className="text-gray-500 dark:text-gray-400" />
                      Chair
                    </label>
                    <select
                      id="chair"
                      name="chair"
                      value={form.chair}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="">Select Chair</option>
                      <option value="COC">COC</option>
                      {chairHeads.map(chair => (
                        <option key={chair._id} value={chair.name}>{chair.name}</option>
                      ))}
                    </select>
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
                            max="5"
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
                            max="3"
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

                  <div>
                    <label htmlFor="chair" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <Users size={16} className="text-gray-500 dark:text-gray-400" />
                      Chair
                    </label>
                    <select
                      id="chair"
                      name="chair"
                      value={form.chair}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="">Select Chair</option>
                      <option value="COC">COC</option>
                      {chairHeads.map(chair => (
                        <option key={chair._id} value={chair.name}>{chair.name}</option>
                      ))}
                    </select>
                  </div>yyyyy

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

        {/* Assign Courses Modal (now Activate Courses Modal) */}
        {openAssignModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenAssignModal(false)}
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
                    <Play className="text-green-600 dark:text-green-500" size={20} />
                    Activate Selected Courses
                  </h2>
                  <button
                    onClick={() => setOpenAssignModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Users size={16} className="text-gray-500 dark:text-gray-400" />
                      Activate For
                    </label>
                    <select
                      id="assignTo"
                      value={selectedChair}
                      onChange={(e) => setSelectedChair(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="">Select Chair or CoC</option>
                      <option value="COC">COC</option>
                      {chairHeads.map(chair => (
                        <option key={chair._id} value={chair.name}>{chair.head?.fullName || "Unknown"} - {chair.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                      Selected Courses ({selectedCourses.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedCourses.map(courseId => {
                        const course = coursesArray.find(c => c._id === courseId);
                        return course ? (
                          <div key={courseId} className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded">
                            <span>{course.name}</span>
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">{course.code}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setOpenAssignModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignCourses}
                      disabled={loading || !selectedChair}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                      Activate Courses
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Unassign Courses Modal */}
        {openUnassignModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenUnassignModal(false)}
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
                    <Unlink className="text-amber-600 dark:text-amber-500" size={20} />
                    Unassign Selected Courses
                  </h2>
                  <button
                    onClick={() => setOpenUnassignModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                      Selected Courses to Unassign ({selectedCourses.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedCourses.map(courseId => {
                        const course = coursesArray.find(c => c._id === courseId);
                        return course ? (
                          <div key={courseId} className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded">
                            <span>{course.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">{course.code}</span>
                              {course.assignedTo && (
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded">
                                  {course.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      Unassigning courses will return them to "Draft" status and remove them from the assigned chair or COC.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setOpenUnassignModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnassignCourses}
                      disabled={loading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Unlink size={18} />}
                      Unassign Courses
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Activate Courses Modal (now Assign Courses Modal) */}
        {openActivateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenActivateModal(false)}
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
                    <Send className="text-yellow-600 dark:text-yellow-500" size={20} />
                    Assign Selected Courses
                  </h2>
                  <button
                    onClick={() => setOpenActivateModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                      Selected Courses to Assign ({selectedCourses.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedCourses.map(courseId => {
                        const course = coursesArray.find(c => c._id === courseId);
                        return course ? (
                          <div key={courseId} className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded">
                            <span>{course.name}</span>
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">{course.code}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      Assigning courses will change their status from "active" to "assigned", indicating they are assigned to instructor.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setOpenActivateModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkActivate}
                      disabled={bulkActionLoading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {bulkActionLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      Assign Courses
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* New: Reactivate Courses Modal (for CoC/ChairHead) */}
        {openReactivateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenReactivateModal(false)}
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
                    <Play className="text-green-600 dark:text-green-500" size={20} />
                    Convert Courses to Active
                  </h2>
                  <button
                    onClick={() => setOpenReactivateModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                      Selected Courses ({selectedCourses.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedCourses.map(courseId => {
                        const course = coursesArray.find(c => c._id === courseId);
                        return course ? (
                          <div key={courseId} className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded">
                            <span>{course.name}</span>
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">{course.code}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Converting courses from "assigned" to "active" status will make them available for reassignment to instructors. Any existing instructor assignments will be preserved.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setOpenReactivateModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkReactivate}
                      disabled={bulkActionLoading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {bulkActionLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                      Convert to Active
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Archive Courses Modal (for HeadOfFaculty) */}
        {openArchiveModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenArchiveModal(false)}
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
                    <Archive className="text-purple-600 dark:text-purple-500" size={20} />
                    Archive Selected Courses
                  </h2>
                  <button
                    onClick={() => setOpenArchiveModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                      Selected Courses to Archive ({selectedCourses.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedCourses.map(courseId => {
                        const course = coursesArray.find(c => c._id === courseId);
                        return course ? (
                          <div key={courseId} className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded">
                            <span>{course.name}</span>
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">{course.code}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      Archiving courses will change their status to "archived" and remove any chair/COC assignments.
                      Archived courses can still be viewed but are typically not actively managed.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setOpenArchiveModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkArchive}
                      disabled={bulkActionLoading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {bulkActionLoading ? <Loader2 className="animate-spin" size={18} /> : <Archive size={18} />}
                      Archive Courses
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Make Draft Courses Modal (for HeadOfFaculty) */}
        {openDraftModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setOpenDraftModal(false)}
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
                    <File className="text-gray-600 dark:text-gray-500" size={20} />
                    Convert to Draft
                  </h2>
                  <button
                    onClick={() => setOpenDraftModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                      Selected Courses to Convert ({selectedCourses.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedCourses.map(courseId => {
                        const course = coursesArray.find(c => c._id === courseId);
                        return course ? (
                          <div key={courseId} className="flex items-center justify-between py-1 px-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded">
                            <span>{course.name}</span>
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">{course.code}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Converting courses to draft status will remove any chair/COC assignments and reset them to the initial draft state.
                      You can then reassign them to chairs or make other changes.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setOpenDraftModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDraft}
                      disabled={bulkActionLoading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {bulkActionLoading ? <Loader2 className="animate-spin" size={18} /> : <File size={18} />}
                      Convert to Draft
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