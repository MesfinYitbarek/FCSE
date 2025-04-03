import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Filter,
  X,
  Edit,
  Trash,
} from "lucide-react";
import api from "../../utils/api";

const SummerCoursesCOC = () => {
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

  // New state for year selection
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  useEffect(() => {
    // Generate years (current year and 5 previous years)
    const currentYear = new Date().getFullYear();
    const yearList = Array.from({ length: 6 }, (_, i) => currentYear - i);
    setYears(yearList);
    setSelectedYear(currentYear);
  }, []);

  useEffect(() => {
    if (isSelectionComplete) {
      fetchCourses();
      fetchInstructors();
      fetchAssignments();
    }
  }, [isSelectionComplete]);

  useEffect(() => {
    if (assignments.length > 0 && selectedYear) {
      filterAssignments();
    }
  }, [assignments, selectedYear]);

  // Filter assignments based on selected year
  const filterAssignments = () => {
    const filtered = assignments.filter(
      (assignment) =>
        assignment.year.toString() === selectedYear.toString() &&
        assignment.program === "Summer"
    );
    setFilteredAssignments(filtered);
  };

  // Handle selection of year
  const handleSelectionSubmit = () => {
    if (selectedYear) {
      setIsSelectionComplete(true);
    } else {
      setError("Please select a year");
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

  // Fetch available summer courses
  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/courses?program=Summer");
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
        semester: "Summer",
        program: "Summer",
        assignedBy: "COC",
      }).toString();
      
      const { data } = await api.get(`/assignments/automatic?${queryParams}`);
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
    setManualAssignments([
      ...manualAssignments,
      { instructorId: "", courseId: "", section: "", labDivision: "No" },
    ]);
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

  // Submit bulk manual assignments
  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (manualAssignments.some((a) => !a.instructorId || !a.courseId)) {
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
        program: "Summer",
        assignedBy: "COC",
      });
      await fetchAssignments();
      setManualAssignments([]);
      setSuccess("Manual assignments successful!");
      setShowAssignmentForm(false);
    } catch (error) {
      console.error("Error assigning manually:", error);
      setError("Failed to assign manually.");
    }
    setLoading(false);
  };

  // Handle selecting instructors
  const handleInstructorSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
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
      prevCourses.map((c) =>
        c.courseId === courseId ? { ...c, [field]: value } : c
      )
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
      await api.post("/assignments/auto/summer", {
        year: selectedYear,
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
      setError("Failed to complete automatic assignment.");
    }

    setLoading(false);
  };

  // Handle editing an assignment
  const handleEditAssignment = (assignmentId) => {
    // Implement edit functionality
    setSuccess(
      `Editing assignment ${assignmentId} (functionality to be implemented)`
    );
  };

  // Handle deleting an assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;

    setLoading(true);
    try {
      await api.delete(`/assignments/${assignmentId}`);
      setSuccess("Assignment deleted successfully!");
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setError("Failed to delete assignment.");
    }
    setLoading(false);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Summer Course Assignments
          </h1>
          <p className="mt-2 text-gray-600">
            Manage and assign summer courses to instructors
          </p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              {...fadeIn}
              className="flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-md mb-6"
            >
              <AlertCircle className="text-red-500 mr-3" size={20} />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              {...fadeIn}
              className="flex items-center p-4 bg-green-50 border-l-4 border-green-500 rounded-md mb-6"
            >
              <CheckCircle className="text-green-500 mr-3" size={20} />
              <p className="text-green-700">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Year Selection Section */}
        {!isSelectionComplete ? (
          <motion.div
            {...fadeIn}
            className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="mr-2" size={20} />
              Select Academic Year
            </h2>

            <div className="max-w-md mx-auto">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
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
            className="mb-6 flex items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-100"
          >
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-indigo-100 rounded-md flex items-center">
                <Calendar className="text-indigo-600 mr-2" size={18} />
                <span className="font-medium text-indigo-800">{selectedYear}</span>
              </div>
              <div className="px-4 py-2 bg-indigo-100 rounded-md flex items-center">
                <School className="text-indigo-600 mr-2" size={18} />
                <span className="font-medium text-indigo-800">
                  Summer Program
                </span>
              </div>
            </div>
            <button
              onClick={resetSelection}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              <X className="mr-1" size={16} />
              Change Year
            </button>
          </motion.div>
        )}

        {/* Main Content - Only visible after selection */}
        {isSelectionComplete && (
          <>
            {/* Assignment Options */}
            <motion.div
              {...fadeIn}
              className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Assignment Options
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white rounded-full mb-4">
                      <PlusCircle size={28} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Manual Assignment
                    </h3>
                    <p className="text-sm text-gray-600 text-center mt-2">
                      Assign specific instructors to specific courses
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setShowAssignmentForm(true);
                      setTimeout(() => {
                        document
                          .getElementById("autoAssignSection")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-green-600 text-white rounded-full mb-4">
                      <School size={28} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Automatic Assignment
                    </h3>
                    <p className="text-sm text-gray-600 text-center mt-2">
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
                  {/* Manual Assignment Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Manual Assignment
                        </h2>
                        <div className="flex space-x-3">
                          <button
                            onClick={addAssignment}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                          >
                            <PlusCircle className="mr-2" size={18} />
                            Add Assignment
                          </button>
                          <button
                            onClick={() => setShowAssignmentForm(false)}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
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
                              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg relative"
                            >
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Instructor
                                </label>
                                <select
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "instructorId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                <label className="text-sm font-medium text-gray-700">
                                  Course
                                </label>
                                <select
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "courseId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                <label className="text-sm font-medium text-gray-700">
                                  Section
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter section"
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "section",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Lab Division
                                </label>
                                <select
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "labDivision",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                  <option value="No">No</option>
                                  <option value="Yes">Yes</option>
                                </select>
                              </div>

                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeAssignment(index)}
                                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md flex items-center justify-center w-full"
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
                                <Loader
                                  className="animate-spin mr-2"
                                  size={18}
                                />
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

                  {/* Auto Assignment Section */}
                  <div
                    id="autoAssignSection"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Automatic Assignment
                        </h2>
                        <button
                          onClick={() => setShowAssignmentForm(false)}
                          className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                        >
                          <X className="mr-2" size={18} />
                          Cancel
                        </button>
                      </div>

                      {/* Instructor Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Users className="mr-2" size={18} />
                          Select Instructors
                        </label>
                        <select
                          multiple
                          onChange={handleInstructorSelection}
                          className="w-full h-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {instructors.map((inst) => (
                            <option key={inst._id} value={inst._id}>
                              {inst.fullName} - {inst.location}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">
                          Selected: {selectedInstructors.length} instructors
                        </p>
                      </div>

                      {/* Course Selection with Section and Lab Division Inputs */}
                      <div className="mt-6 space-y-4">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <BookOpen className="mr-2" size={18} />
                          Select Courses and Set Section & Lab Division
                        </label>

                        {courses.map((course) => (
                          <div
                            key={course._id}
                            className="p-4 border border-gray-300 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <input
                                type="checkbox"
                                value={course._id}
                                onChange={(e) => handleCourseSelection(e, course)}
                                checked={selectedCourses.some(
                                  (c) => c.courseId === course._id
                                )}
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded"
                              />
                              <span className="text-sm">
                                {course.name} ({course.code})
                              </span>
                            </div>

                            {selectedCourses.some(
                              (c) => c.courseId === course._id
                            ) && (
                              <div className="mt-3 space-y-2">
                                {/* Section Input */}
                                <input
                                  type="text"
                                  placeholder="Enter section"
                                  value={
                                    selectedCourses.find(
                                      (c) => c.courseId === course._id
                                    )?.section || ""
                                  }
                                  onChange={(e) =>
                                    handleCourseDetailChange(
                                      course._id,
                                      "section",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />

                                {/* Lab Division Selection */}
                                <select
                                  value={
                                    selectedCourses.find(
                                      (c) => c.courseId === course._id
                                    )?.labDivision || "No"
                                  }
                                  onChange={(e) =>
                                    handleCourseDetailChange(
                                      course._id,
                                      "labDivision",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Assignments Table */}
            <motion.div
              {...fadeIn}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="mr-2" size={20} />
                  Current Assignments
                  <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                    {selectedYear} - Summer Program
                  </span>
                </h2>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader className="animate-spin text-indigo-600 mr-3" size={24} />
                    <p className="text-gray-700">Loading assignments...</p>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <School className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No assignments found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are no assignments for this academic year yet.
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Instructor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lab
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAssignments.flatMap((assignment) =>
                          assignment.assignments.map((assignment) => (
                          <motion.tr
                            key={assignment._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                            className="transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.instructorId?.fullName || "Unassigned"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.courseId?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.courseId?.code || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.section || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.labDivision}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditAssignment(assignment._id)}
                                  className="p-1 bg-amber-100 text-amber-600 rounded hover:bg-amber-200 transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(assignment._id)}
                                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        )))}
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

export default SummerCoursesCOC;