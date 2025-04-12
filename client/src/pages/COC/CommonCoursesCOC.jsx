import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@headlessui/react";
import {
  Loader,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Trash2,
  BookOpen,
  Users,
  Calendar,
  School,
  ChevronDown,
  Filter,
  X,
  Edit,
  MoreVertical,
  Check,
  Search,
  SlidersHorizontal
} from "lucide-react";
import api from "../../utils/api";

const CommonCoursesCOC = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [manualAssignments, setManualAssignments] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  
  // State for year and semester selection
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([
    "Regular 1", "Regular 2", "Summer"
  ]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  
  // New filter states
  const [departments, setDepartments] = useState([]);
  const [chairs, setChairs] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: "",
    chair: "",
    search: ""
  });

  useEffect(() => {
    // Generate years (current year and 5 previous years)
    const currentYear = new Date().getFullYear();
    const yearList = Array.from({ length: 6 }, (_, i) => currentYear - i);
    setYears(yearList);
    setSelectedYear(currentYear);

    // Set default semester based on current month
    const currentMonth = new Date().getMonth() + 1;
    let defaultSemester = "Regular 1";
    if (currentMonth >= 9) {
      defaultSemester = "Regular 1";
    } else if (currentMonth >= 5) {
      defaultSemester = "Summer";
    } else {
      defaultSemester = "Regular 2";
    }
    setSelectedSemester(defaultSemester);
    
    // Sample data for departments and chairs (replace with real data)
    setDepartments(["Computer Science", "Electrical", "Mechanical", "Civil", "Software"]);
    setChairs(["Common", "CSE", "EEE", "Civil", "Software"]);
  }, []);

  useEffect(() => {
    if (isSelectionComplete) {
      fetchCourses();
      fetchInstructors();
      fetchAssignments();
    }
  }, [isSelectionComplete]);

  useEffect(() => {
    if (assignments.length > 0 && selectedYear && selectedSemester) {
      filterAssignments();
    }
  }, [assignments, selectedYear, selectedSemester, filters]);

  // Filter assignments based on selected year, semester, and additional filters
  const filterAssignments = () => {
    let filtered = assignments.filter(
      assignment =>
        assignment.year.toString() === selectedYear.toString() &&
        assignment.semester === selectedSemester
    );
    
    // Apply additional filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.assignments.some(subAssignment => 
          (subAssignment.instructorId?.fullName && 
            subAssignment.instructorId.fullName.toLowerCase().includes(searchTerm)) ||
          (subAssignment.courseId?.name && 
            subAssignment.courseId.name.toLowerCase().includes(searchTerm)) ||
          (subAssignment.courseId?.code && 
            subAssignment.courseId.code.toLowerCase().includes(searchTerm))
        )
      );
    }
    
    if (filters.department) {
      filtered = filtered.filter(assignment => 
        assignment.assignments.some(subAssignment => 
          subAssignment.courseId?.department === filters.department
        )
      );
    }
    
    if (filters.chair) {
      filtered = filtered.filter(assignment => 
        assignment.assignments.some(subAssignment => 
          subAssignment.courseId?.chair === filters.chair
        )
      );
    }
    
    setFilteredAssignments(filtered);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      department: "",
      chair: "",
      search: ""
    });
  };

  // Handle selection of year and semester
  const handleSelectionSubmit = () => {
    if (selectedYear && selectedSemester) {
      setIsSelectionComplete(true);
    } else {
      setError("Please select both year and semester");
    }
  };

  // Reset selection
  const resetSelection = () => {
    setIsSelectionComplete(false);
    setShowAssignmentForm(false);
    setManualAssignments([]);
    setSelectedInstructors([]);
    setSelectedCourses([]);
    setSuccess(null);
    setError(null);
  };

  // Fetch available common courses
  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/courses?chair=Common");
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses.");
    }
  };

  // Fetch available instructors
  const fetchInstructors = async () => {
    try {
      const { data } = await api.get(`/users/role/${"Instructor"}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Failed to load instructors.");
    }
  };

  // Fetch current assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        year: selectedYear,
        semester: selectedSemester,
        program: "Regular",
        assignedBy: "COC",
      }).toString();
      
      const { data } = await api.get(`/assignments/automatic?${queryParams}`);
      console.log("Fetched assignments:", data.assignments);
      setAssignments(data.assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  // Add assignment to local state
  const addAssignment = () => {
    setManualAssignments([...manualAssignments, { instructorId: "", courseId: "", section: "", labDivision: "No" }]);
  };

  // Remove assignment from local state
  const removeAssignment = (index) => {
    const updatedAssignments = [...manualAssignments];
    updatedAssignments.splice(index, 1);
    setManualAssignments(updatedAssignments);
  };

  // Handle form input change
  const handleInputChange = (index, field, value) => {
    const updatedAssignments = [...manualAssignments];
    updatedAssignments[index][field] = value;
    setManualAssignments(updatedAssignments);
  };

  // Edit assignment with the correct nested structure
  const handleEditAssignment = (subAssignment, parentId) => {
    console.log("Editing assignment:", subAssignment._id, "from parent:", parentId);
    setIsEditing(true);
    setEditingAssignment({
      parentId: parentId, // Store the parent assignment ID
      subId: subAssignment._id, // Store the sub-assignment ID
      instructorId: subAssignment.instructorId?._id || "",
      courseId: subAssignment.courseId?._id || "",
      section: subAssignment.section || "",
      labDivision: subAssignment.labDivision || "No"
    });
    setShowAssignmentForm(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingAssignment(null);
  };

  // Handle update form input change
  const handleUpdateInputChange = (field, value) => {
    setEditingAssignment({
      ...editingAssignment,
      [field]: value
    });
  };

  // Update assignment - Modified to handle nested structure
  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editingAssignment.instructorId || !editingAssignment.courseId) {
      setError("Please select both instructor and course.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Updating sub-assignment:", editingAssignment.subId, "in parent:", editingAssignment.parentId);
      
      // Create a new custom endpoint that can handle nested assignments
      // This is what you will need to implement on your backend
      await api.put(`/assignments/sub/${editingAssignment.parentId}/${editingAssignment.subId}`, {
        instructorId: editingAssignment.instructorId,
        courseId: editingAssignment.courseId,
        section: editingAssignment.section,
        labDivision: editingAssignment.labDivision,
        year: selectedYear,
        semester: selectedSemester,
        program: "Regular"
      });
      
      await fetchAssignments();
      setSuccess("Assignment updated successfully!");
      setIsEditing(false);
      setEditingAssignment(null);
      setShowAssignmentForm(false);
    } catch (error) {
      console.error("Error updating assignment:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to update assignment. Make sure your backend supports updating nested assignments.");
    }
    
    setLoading(false);
  };

  // Delete assignment - Modified to handle nested structure
  const confirmDeleteAssignment = (subId, parentId) => {
    console.log("Confirming delete for sub-assignment ID:", subId, "from parent:", parentId);
    setDeleteConfirm({ subId, parentId });
  };

  const handleDeleteAssignment = async () => {
    if (!deleteConfirm) return;
    
    const { subId, parentId } = deleteConfirm;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Deleting sub-assignment:", subId, "from parent:", parentId);
      
      // Create a new custom endpoint that can handle nested assignments
      // This is what you will need to implement on your backend
      await api.delete(`/assignments/sub/${parentId}/${subId}`);
      
      await fetchAssignments();
      setSuccess("Assignment deleted successfully!");
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting assignment:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to delete assignment. Make sure your backend supports deleting nested assignments.");
    }
    
    setLoading(false);
  };

  // Submit bulk manual assignments
  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (manualAssignments.some(a => !a.instructorId || !a.courseId)) {
      setError("Please select both instructor and course for each row.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/assignments/common/manual", {
        assignments: manualAssignments,
        year: selectedYear,
        semester: selectedSemester,
        program: "Regular",
        assignedBy: "COC",
      });
      await fetchAssignments();
      setManualAssignments([]);
      setSuccess("Manual assignments successful!");
      setShowAssignmentForm(false);
    } catch (error) {
      console.error("Error assigning manually:", error);
      setError(error.response?.data?.message || "Failed to assign manually.");
    }
    setLoading(false);
  };

  // Handle toggling selection of an instructor for multiple selection without Ctrl key
  const toggleInstructorSelection = (instructorId) => {
    setSelectedInstructors(prev => {
      if (prev.includes(instructorId)) {
        return prev.filter(id => id !== instructorId);
      } else {
        return [...prev, instructorId];
      }
    });
  };

  // Handle selecting courses and storing additional fields (section & lab division)
  const handleCourseSelection = (e, course) => {
    const courseId = course._id;
    const isChecked = e.target.checked;

    setSelectedCourses((prevCourses) => {
      if (isChecked) {
        return [...prevCourses, { courseId, section: "", labDivision: "No" }];
      } else {
        return prevCourses.filter((c) => c.courseId !== courseId);
      }
    });
  };

  // Handle changes to section and lab division fields
  const handleCourseDetailChange = (courseId, field, value) => {
    setSelectedCourses((prevCourses) =>
      prevCourses.map((c) => (c.courseId === courseId ? { ...c, [field]: value } : c))
    );
  };

  // Trigger automatic assignment
  const handleAutoAssign = async () => {
    if (!selectedInstructors.length || !selectedCourses.length) {
      setError("Please select at least one instructor and one course.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/assignments/auto/common", {
        year: selectedYear,
        semester: selectedSemester,
        assignedBy: "COC",
        instructors: selectedInstructors,
        courses: selectedCourses.map((c) => ({
          courseId: c.courseId,
          section: c.section,
          labDivision: c.labDivision,
        })),
      });

      await fetchAssignments();
      setSuccess("Automatic assignment completed successfully!");
      setShowAssignmentForm(false);
    } catch (error) {
      console.error("Error in automatic assignment:", error);
      setError(error.response?.data?.message || "Failed to complete automatic assignment.");
    }

    setLoading(false);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Common Course Assignments</h1>
          <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400">Manage and assign common courses to instructors</p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              {...fadeIn}
              className="flex items-center p-2 md:p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg mb-4"
            >
              <AlertCircle className="text-red-500 dark:text-red-400 mr-2 flex-shrink-0" size={18} />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              {...fadeIn}
              className="flex items-center p-2 md:p-3 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-lg mb-4"
            >
              <CheckCircle className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0" size={18} />
              <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this assignment? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAssignment}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Year and Semester Selection Section */}
        {!isSelectionComplete ? (
          <motion.div
            {...fadeIn}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-5"
          >
            <div className="p-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="mr-2 text-indigo-600 dark:text-indigo-400" size={20} />
                Select Academic Period
              </h2>
                 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-gray-200 text-base"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-gray-200 text-base"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={handleSelectionSubmit}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md text-sm"
                >
                  <Filter className="mr-2" size={16} />
                  Load Assignments
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            {...fadeIn}
            className="mb-4 md:mb-5 flex flex-wrap items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
              <div className="px-2 py-1.5 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center">
                <Calendar className="text-indigo-600 dark:text-indigo-400 mr-1.5" size={14} />
                <span className="font-medium text-indigo-800 dark:text-indigo-200 text-sm">{selectedYear}</span>
              </div>
              <div className="px-2 py-1.5 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center">
                <School className="text-indigo-600 dark:text-indigo-400 mr-1.5" size={14} />
                <span className="font-medium text-indigo-800 dark:text-indigo-200 text-sm">{selectedSemester}</span>
              </div>
            </div>
            <button
              onClick={resetSelection}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium flex items-center text-sm"
            >
              <X className="mr-1" size={16} />
              Change Period
            </button>
          </motion.div>
        )}

        {/* Main Content - Only visible after selection */}
        {isSelectionComplete && (
          <>
            {/* Assignment Options - Minimized */}
            <motion.div
              {...fadeIn}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-5"
            >
              <div className="p-3">
                <div className="flex flex-wrap justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assignment Options</h2>
                  <div className="flex gap-2 mt-1 sm:mt-0">
                    <button
                      onClick={() => {
                        setShowAssignmentForm(!showAssignmentForm);
                        setIsEditing(false);
                        setEditingAssignment(null);
                      }}
                      className="flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all text-sm"
                    >
                      <PlusCircle size={16} className="mr-1.5" />
                      Manual Assignment
                    </button>

                    <button
                      onClick={() => {
                        setShowAssignmentForm(true);
                        setIsEditing(false);
                        setEditingAssignment(null);
                        setTimeout(() => {
                          document.getElementById('autoAssignSection')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="flex items-center px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/40 transition-all text-sm"
                    >
                      <School size={16} className="mr-1.5" />
                      Auto Assignment
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assignment Forms - Only shown when user chooses an option */}
            <AnimatePresence>
              {showAssignmentForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 md:mb-5"
                >
                  {/* Edit Assignment Form */}
                  {isEditing && editingAssignment && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-5 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Edit Assignment</h2>
                          <button
                            onClick={cancelEditing}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors text-sm"
                          >
                            <X className="mr-1" size={16} />
                            Cancel
                          </button>
                        </div>

                        <form onSubmit={handleUpdateAssignment} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
                              <select
                                value={editingAssignment.instructorId}
                                onChange={(e) => handleUpdateInputChange("instructorId", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-base text-gray-900 dark:text-white"
                              >
                                <option value="">Select Instructor</option>
                                {instructors.map((inst) => (
                                  <option key={inst._id} value={inst._id}>
                                    {inst.fullName} - {inst.location}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                              <select
                                value={editingAssignment.courseId}
                                onChange={(e) => handleUpdateInputChange("courseId", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-base text-gray-900 dark:text-white"
                              >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                  <option key={course._id} value={course._id}>
                                    {course.name} ({course.code})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
                              <input
                                type="text"
                                placeholder="Enter section"
                                value={editingAssignment.section}
                                onChange={(e) => handleUpdateInputChange("section", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-base text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lab Division</label>
                              <select
                                value={editingAssignment.labDivision}
                                onChange={(e) => handleUpdateInputChange("labDivision", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-base text-gray-900 dark:text-white"
                              >
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end pt-3">
                            <button
                              type="submit"
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                            >
                              {loading ? (
                                <Loader className="animate-spin mr-2" size={16} />
                              ) : (
                                <CheckCircle className="mr-2" size={16} />
                              )}
                              {loading ? "Updating..." : "Update Assignment"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Manual Assignment Section */}
                  {!isEditing && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-5 overflow-hidden">
                      <div className="p-4">
                        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Manual Assignment</h2>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={addAssignment}
                              className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <PlusCircle className="mr-1" size={16} />
                              Add Assignment
                            </button>
                            <button
                              onClick={() => setShowAssignmentForm(false)}
                              className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors text-sm"
                            >
                              <X className="mr-1" size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>

                        <form onSubmit={handleManualAssign} className="space-y-3">
                          <AnimatePresence>
                            {manualAssignments.map((assignment, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg relative"
                              >
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
                                  <select
                                    onChange={(e) => handleInputChange(index, "instructorId", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                                  >
                                    <option value="">Select Instructor</option>
                                    {instructors.map((inst) => (
                                      <option key={inst._id} value={inst._id}>
                                        {inst.fullName} - {inst.location}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                                  <select
                                    onChange={(e) => handleInputChange(index, "courseId", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                                  >
                                    <option value="">Select Course</option>
                                    {courses.map((course) => (
                                      <option key={course._id} value={course._id}>
                                        {course.name} ({course.code})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
                                  <input
                                    type="text"
                                    placeholder="Enter section"
                                    onChange={(e) => handleInputChange(index, "section", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lab Division</label>
                                  <select
                                    onChange={(e) => handleInputChange(index, "labDivision", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                                  >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                  </select>
                                </div>

                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => removeAssignment(index)}
                                    className="px-2 py-1.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center w-full"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {manualAssignments.length > 0 && (
                            <div className="flex justify-end pt-3">
                              <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                              >
                                {loading ? (
                                  <Loader className="animate-spin mr-2" size={16} />
                                ) : (
                                  <CheckCircle className="mr-2" size={16} />
                                )}
                                {loading ? "Assigning..." : "Assign Courses"}
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Auto Assignment Section */}
                  {!isEditing && (
                    <div id="autoAssignSection" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-5">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Automatic Assignment</h2>
                          <button
                            onClick={() => setShowAssignmentForm(false)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors text-sm"
                          >
                            <X className="mr-1" size={16} />
                            Cancel
                          </button>
                        </div>

                        {/* Custom Instructor Selection (No Ctrl key needed) */}
                        <div className="space-y-2 mb-4">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Users className="mr-2 text-indigo-600 dark:text-indigo-400" size={18} />
                            Select Instructors ({selectedInstructors.length} selected)
                          </label>
                          
                          <div className="relative">
                            <button
                              onClick={() => setShowInstructorDropdown(!showInstructorDropdown)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white"
                            >
                              <span>
                                {selectedInstructors.length === 0
                                  ? "Select instructors"
                                  : `${selectedInstructors.length} instructor${
                                      selectedInstructors.length === 1 ? "" : "s"
                                    } selected`}
                              </span>
                              <ChevronDown size={16} className={`transition-transform ${showInstructorDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showInstructorDropdown && (
                              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                <div className="p-1">
                                  {instructors.map((instructor) => (
                                    <div
                                      key={instructor._id}
                                      onClick={() => toggleInstructorSelection(instructor._id)}
                                      className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                                    >
                                      <div className={`w-5 h-5 mr-2 flex-shrink-0 rounded border ${
                                        selectedInstructors.includes(instructor._id)
                                          ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                                          : 'border-gray-300 dark:border-gray-500'
                                      } flex items-center justify-center`}>
                                        {selectedInstructors.includes(instructor._id) && (
                                          <Check size={14} className="text-white" />
                                        )}
                                      </div>
                                      <span className="text-sm text-gray-900 dark:text-white">
                                        {instructor.fullName} - {instructor.location}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Course Selection with Section and Lab Division Inputs */}
                        <div className="mt-4 space-y-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <BookOpen className="mr-2 text-indigo-600 dark:text-indigo-400" size={18} />
                            Select Courses and Set Section & Lab Division
                          </label>
                          
                          {/* Course Filter Controls */}
                          <div className="mb-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Courses</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Department</label>
                                <select
                                  value={filters.department}
                                  onChange={(e) => handleFilterChange("department", e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                                >
                                  <option value="">All Departments</option>
                                  {departments.map((department) => (
                                    <option key={department} value={department}>
                                      {department}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Chair</label>
                                <select
                                  value={filters.chair}
                                  onChange={(e) => handleFilterChange("chair", e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                                >
                                  <option value="">All Chairs</option>
                                  {chairs.map((chair) => (
                                    <option key={chair} value={chair}>
                                      {chair}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Search</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                    className="w-full px-3 py-1.5 pl-9 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                                  />
                                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Active Filter Tags */}
                            {(filters.department || filters.chair || filters.search) && (
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <button
                                  onClick={clearFilters}
                                  className="inline-flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                >
                                  <X size={14} className="mr-1" />
                                  Clear All
                                </button>
                                
                                {filters.department && (
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-xs">
                                    Department: {filters.department}
                                    <button onClick={() => handleFilterChange("department", "")} className="ml-1 text-gray-500 hover:text-gray-700">
                                      <X size={12} />
                                    </button>
                                  </span>
                                )}
                                
                                {filters.chair && (
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-xs">
                                    Chair: {filters.chair}
                                    <button onClick={() => handleFilterChange("chair", "")} className="ml-1 text-gray-500 hover:text-gray-700">
                                      <X size={12} />
                                    </button>
                                  </span>
                                )}
                                
                                {filters.search && (
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-xs">
                                    Search: "{filters.search}"
                                    <button onClick={() => handleFilterChange("search", "")} className="ml-1 text-gray-500 hover:text-gray-700">
                                      <X size={12} />
                                    </button>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Filtered Course Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {courses
                              .filter(course => {
                                // Filter by department
                                if (filters.department && course.department !== filters.department) {
                                  return false;
                                }
                                
                                // Filter by chair
                                if (filters.chair && course.chair !== filters.chair) {
                                  return false;
                                }
                                
                                // Filter by search text
                                if (filters.search) {
                                  const searchTerm = filters.search.toLowerCase();
                                  const nameMatch = course.name && course.name.toLowerCase().includes(searchTerm);
                                  const codeMatch = course.code && course.code.toLowerCase().includes(searchTerm);
                                  return nameMatch || codeMatch;
                                }
                                
                                return true;
                              })
                              .map((course) => (
                                <div key={course._id} className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      value={course._id}
                                      onChange={(e) => handleCourseSelection(e, course)}
                                      checked={selectedCourses.some((c) => c.courseId === course._id)}
                                      className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    />
                                    <div>
                                      <span className="text-sm text-gray-900 dark:text-white font-medium block">{course.name} ({course.code})</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {course.department} • {course.chair}
                                      </span>
                                    </div>
                                  </div>

                                  {selectedCourses.some((c) => c.courseId === course._id) && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {/* Section Input */}
                                      <input
                                        type="text"
                                        placeholder="Section"
                                        value={selectedCourses.find((c) => c.courseId === course._id)?.section || ""}
                                        onChange={(e) => handleCourseDetailChange(course._id, "section", e.target.value)}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm text-gray-900 dark:text-white"
                                      />

                                      {/* Lab Division Selection */}
                                      <select
                                        value={selectedCourses.find((c) => c.courseId === course._id)?.labDivision || "No"}
                                        onChange={(e) => handleCourseDetailChange(course._id, "labDivision", e.target.value)}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm text-gray-900 dark:text-white"
                                      >
                                        <option value="No">No Lab</option>
                                        <option value="Yes">With Lab</option>
                                      </select>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                          
                          {/* No courses found state */}
                          {courses.filter(course => {
                            if (filters.department && course.department !== filters.department) return false;
                            if (filters.chair && course.chair !== filters.chair) return false;
                            if (filters.search) {
                              const searchTerm = filters.search.toLowerCase();
                              const nameMatch = course.name && course.name.toLowerCase().includes(searchTerm);
                              const codeMatch = course.code && course.code.toLowerCase().includes(searchTerm);
                              return nameMatch || codeMatch;
                            }
                            return true;
                          }).length === 0 && (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">No courses found</h3>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Try adjusting your filter criteria to see available courses.
                              </p>
                              <button
                                onClick={clearFilters}
                                className="mt-3 inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm"
                              >
                                <X size={14} className="mr-1.5" />
                                Clear Filters
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-5 flex justify-end">
                          <button
                            onClick={handleAutoAssign}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                          >
                            {loading ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : (
                              <School className="mr-2" size={16} />
                            )}
                            {loading ? "Processing..." : "Start Automatic Assignment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Section */}
            <motion.div
              {...fadeIn}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 md:mb-5"
            >
              <div className="p-3">
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Filter className="mr-2 text-indigo-600 dark:text-indigo-400" size={18} />
                    Filter Assignments
                  </h2>
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="inline-flex items-center px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors text-sm"
                  >
                    <SlidersHorizontal size={16} className="mr-1.5" />
                    {filterOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                          <select
                            value={filters.department}
                            onChange={(e) => handleFilterChange("department", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                          >
                            <option value="">All Departments</option>
                            {departments.map((department) => (
                              <option key={department} value={department}>
                                {department}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chair</label>
                          <select
                            value={filters.chair}
                            onChange={(e) => handleFilterChange("chair", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                          >
                            <option value="">All Chairs</option>
                            {chairs.map((chair) => (
                              <option key={chair} value={chair}>
                                {chair}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search courses or instructors..."
                              value={filters.search}
                              onChange={(e) => handleFilterChange("search", e.target.value)}
                              className="w-full px-3 py-1.5 pl-9 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-gray-900 dark:text-white"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
                        >
                          <X size={16} className="mr-1" />
                          Clear Filters
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Filter Stats */}
                {(filters.department || filters.chair || filters.search) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Filtered results: {filteredAssignments.reduce((acc, item) => acc + item.assignments.length, 0)}</span>
                    
                    {filters.department && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        Department: {filters.department}
                        <button onClick={() => handleFilterChange("department", "")} className="ml-1 text-gray-500 hover:text-gray-700">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    
                    {filters.chair && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        Chair: {filters.chair}
                        <button onClick={() => handleFilterChange("chair", "")} className="ml-1 text-gray-500 hover:text-gray-700">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    
                    {filters.search && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        Search: "{filters.search}"
                        <button onClick={() => handleFilterChange("search", "")} className="ml-1 text-gray-500 hover:text-gray-700">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Assignments Table - Now with improved responsiveness and reduced spacing */}
            <motion.div
              {...fadeIn}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="mr-2 text-indigo-600 dark:text-indigo-400" size={18} />
                  Current Assignments
                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                    {selectedYear} - {selectedSemester}
                  </span>
                </h2>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader className="animate-spin text-indigo-600 dark:text-indigo-400 mr-3" size={20} />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Loading assignments...</p>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <School className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No assignments found</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(filters.department || filters.chair || filters.search) 
                        ? "Try adjusting your filter criteria to see more results."
                        : "There are no assignments for this academic period yet."}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => setShowAssignmentForm(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PlusCircle className="-ml-1 mr-1 h-4 w-4" />
                        Create New Assignment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 px-4">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="sticky top-0 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                                Instructor
                              </th>
                              <th scope="col" className="sticky top-0 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                                Course
                              </th>
                              <th scope="col" className="sticky top-0 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                                Code
                              </th>
                              <th scope="col" className="sticky top-0 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 hidden sm:table-cell">
                                Section
                              </th>
                              <th scope="col" className="sticky top-0 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 hidden sm:table-cell">
                                Lab
                              </th>
                              <th scope="col" className="sticky top-0 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 hidden md:table-cell">
                                LEH
                              </th>
                              <th scope="col" className="sticky top-0 px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredAssignments.flatMap((assignment) =>
                              assignment.assignments.map((subAssignment) => (
                                <motion.tr
                                  key={subAssignment._id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                    {subAssignment.instructorId?.fullName || "Unassigned"}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                                    {subAssignment.courseId?.name || "N/A"}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                    {subAssignment.courseId?.code || "N/A"}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                    {subAssignment.section || "N/A"}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                    {subAssignment.labDivision}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                                    {subAssignment.workload?.toFixed(2) || "N/A"}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                                    <div className="flex space-x-1 justify-end">
                                      <button
                                        onClick={() => handleEditAssignment(subAssignment, assignment._id)}
                                        className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                        title="Edit"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        onClick={() => confirmDeleteAssignment(subAssignment._id, assignment._id)}
                                        className="p-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                        title="Delete"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommonCoursesCOC;