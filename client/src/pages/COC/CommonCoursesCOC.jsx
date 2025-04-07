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
  MoreVertical
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

  // State for year and semester selection
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([
    "Regular 1", "Regular 2", "Summer"
  ]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

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
  }, [assignments, selectedYear, selectedSemester]);

  // Filter assignments based on selected year and semester
  const filterAssignments = () => {
    const filtered = assignments.filter(
      assignment =>
        assignment.year.toString() === selectedYear.toString() &&
        assignment.semester === selectedSemester
    );
    setFilteredAssignments(filtered);
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

  // Handle selecting instructors
  const handleInstructorSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedInstructors(selectedOptions);
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Common Course Assignments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and assign common courses to instructors</p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              {...fadeIn}
              className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-md mb-6"
            >
              <AlertCircle className="text-red-500 dark:text-red-400 mr-3" size={20} />
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              {...fadeIn}
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-md mb-6"
            >
              <CheckCircle className="text-green-500 dark:text-green-400 mr-3" size={20} />
              <p className="text-green-700 dark:text-green-300">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this assignment? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAssignment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Calendar className="mr-2" size={20} />
              Select Academic Period
            </h2>
                 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 dark:text-gray-200 text-base"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 dark:text-gray-200 text-base"
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

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSelectionSubmit}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors shadow-md"
              >
                <Filter className="mr-2" size={18} />
                Load Assignments
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            {...fadeIn}
            className="mb-6 flex flex-wrap items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800"
          >
            <div className="flex flex-wrap items-center gap-4 mb-2 sm:mb-0">
              <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-800 rounded-md flex items-center">
                <Calendar className="text-indigo-600 dark:text-indigo-400 mr-2" size={18} />
                <span className="font-medium text-indigo-800 dark:text-indigo-200">{selectedYear}</span>
              </div>
              <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-800 rounded-md flex items-center">
                <School className="text-indigo-600 dark:text-indigo-400 mr-2" size={18} />
                <span className="font-medium text-indigo-800 dark:text-indigo-200">{selectedSemester}</span>
              </div>
            </div>
            <button
              onClick={resetSelection}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium flex items-center"
            >
              <X className="mr-1" size={16} />
              Change Period
            </button>
          </motion.div>
        )}

        {/* Main Content - Only visible after selection */}
        {isSelectionComplete && (
          <>
            {/* Assignment Options */}
            <motion.div
              {...fadeIn}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Assignment Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowAssignmentForm(!showAssignmentForm);
                      setIsEditing(false);
                      setEditingAssignment(null);
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white rounded-full mb-4">
                      <PlusCircle size={28} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manual Assignment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      Assign specific instructors to specific courses
                    </p>
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
                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-green-600 text-white rounded-full mb-4">
                      <School size={28} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Automatic Assignment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      Automatically assign courses based on your selection
                    </p>
                  </button>
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
                  className="mb-6"
                >
                  {/* Edit Assignment Form */}
                  {isEditing && editingAssignment && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Assignment</h2>
                          <button
                            onClick={cancelEditing}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                          >
                            <X className="mr-2" size={18} />
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
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
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
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
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
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lab Division</label>
                              <select
                                value={editingAssignment.labDivision}
                                onChange={(e) => handleUpdateInputChange("labDivision", e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                              >
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <button
                              type="submit"
                              disabled={loading}
                              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                            >
                              {loading ? (
                                <Loader className="animate-spin mr-2" size={18} />
                              ) : (
                                <CheckCircle className="mr-2" size={18} />
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manual Assignment</h2>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={addAssignment}
                              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                            >
                              <PlusCircle className="mr-2" size={18} />
                              Add Assignment
                            </button>
                            <button
                              onClick={() => setShowAssignmentForm(false)}
                              className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                            >
                              <X className="mr-2" size={18} />
                              Cancel
                            </button>
                          </div>
                        </div>

                        <form onSubmit={handleManualAssign} className="space-y-4">
                          <AnimatePresence>
                            {manualAssignments.map((assignment, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg relative"
                              >
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
                                  <select
                                    onChange={(e) => handleInputChange(index, "instructorId", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
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
                                    onChange={(e) => handleInputChange(index, "courseId", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
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
                                    onChange={(e) => handleInputChange(index, "section", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lab Division</label>
                                  <select
                                    onChange={(e) => handleInputChange(index, "labDivision", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                                  >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                  </select>
                                </div>

                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => removeAssignment(index)}
                                    className="px-3 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-md flex items-center justify-center w-full"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {manualAssignments.length > 0 && (
                            <div className="flex justify-end pt-4">
                              <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                              >
                                {loading ? (
                                  <Loader className="animate-spin mr-2" size={18} />
                                ) : (
                                  <CheckCircle className="mr-2" size={18} />
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
                    <div id="autoAssignSection" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Automatic Assignment</h2>
                          <button
                            onClick={() => setShowAssignmentForm(false)}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                          >
                            <X className="mr-2" size={18} />
                            Cancel
                          </button>
                        </div>

                        {/* Instructor Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Users className="mr-2" size={18} />
                            Select Instructors
                          </label>
                          <select
                            multiple
                            onChange={handleInstructorSelection}
                            className="w-full h-48 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                          >
                            {instructors.map((inst) => (
                              <option key={inst._id} value={inst._id}>
                                {inst.fullName} - {inst.location}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Selected: {selectedInstructors.length} instructors</p>
                        </div>

                        {/* Course Selection with Section and Lab Division Inputs */}
                        <div className="mt-6 space-y-4">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <BookOpen className="mr-2" size={18} />
                            Select Courses and Set Section & Lab Division
                          </label>

                          {courses.map((course) => (
                            <div key={course._id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <input
                                  type="checkbox"
                                  value={course._id}
                                  onChange={(e) => handleCourseSelection(e, course)}
                                  checked={selectedCourses.some((c) => c.courseId === course._id)}
                                  className="w-5 h-5 text-purple-600 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <span className="text-sm">{course.name} ({course.code})</span>
                              </div>

                              {selectedCourses.some((c) => c.courseId === course._id) && (
                                <div className="mt-3 space-y-2">
                                  {/* Section Input */}
                                  <input
                                    type="text"
                                    placeholder="Enter section"
                                    value={selectedCourses.find((c) => c.courseId === course._id)?.section || ""}
                                    onChange={(e) => handleCourseDetailChange(course._id, "section", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base"
                                  />

                                  {/* Lab Division Selection */}
                                  <select
                                    value={selectedCourses.find((c) => c.courseId === course._id)?.labDivision || "No"}
                                    onChange={(e) => handleCourseDetailChange(course._id, "labDivision", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base"
                                  >
                                    <option value="No">No Lab</option>
                                    <option value="Yes">Yes (With Lab)</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={handleAutoAssign}
                            disabled={loading}
                            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader className="animate-spin mr-2" size={18} />
                            ) : (
                              <School className="mr-2" size={18} />
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

            {/* Assignments Table - Now with improved responsiveness */}
            <motion.div
              {...fadeIn}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BookOpen className="mr-2" size={20} />
                  Current Assignments
                  <span className="ml-3 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-sm rounded-full">
                    {selectedYear} - {selectedSemester}
                  </span>
                </h2>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader className="animate-spin text-indigo-600 dark:text-indigo-400 mr-3" size={24} />
                    <p className="text-gray-700 dark:text-gray-300">Loading assignments...</p>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <School className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No assignments found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      There are no assignments for this academic period yet.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAssignmentForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                        Create New Assignment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Instructor
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Course
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Code
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Batch & Section
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Lab Division
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            LEH
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAssignments.flatMap((assignment) =>
                          assignment.assignments.map((subAssignment) => (
                            <motion.tr
                              key={subAssignment._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                              className="transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {subAssignment.instructorId?.fullName || "Unassigned"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {subAssignment.courseId?.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {subAssignment.courseId?.code || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {subAssignment.section || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {subAssignment.labDivision}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {subAssignment.workload?.toFixed(2) || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex space-x-2">
                                <button
                                  onClick={() => handleEditAssignment(subAssignment, assignment._id)}
                                  className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => confirmDeleteAssignment(subAssignment._id, assignment._id)}
                                  className="p-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
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