import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import { 
  Search, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Send, 
  Info, 
  Lock, 
  Award, 
  Filter, 
  BookOpen, 
  Code, 
  Layers, 
  ClipboardList,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  Building
} from "lucide-react";

const PreferencesInst = () => {
  const { user } = useSelector((state) => state.auth);
  const [preferenceForm, setPreferenceForm] = useState(null);
  const [courses, setCourses] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState({
    form: false,
    submission: false
  });
  const [submissionAllowed, setSubmissionAllowed] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState("Regular 1");
  const [isEligible, setIsEligible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChair, setFilterChair] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    if (user?.role === "Instructor") {
      fetchPreferences();
      fetchPreferenceForm();
    }
  }, [user, year, semester]);

  const fetchPreferenceForm = async () => {
    setLoading(prev => ({ ...prev, form: true }));
    setErrorMessage("");
    try {
      // Get active preference form for the instructor's chair
      const { data } = await api.get(`/preference-forms/active?year=${year}&semester=${semester}&chair=${user.chair}`);
      if (data) {
        setPreferenceForm(data);

        // Extract courses from the preference form
        // Each course item in the array has course (populated), section, NoOfSections, labDivision
        const extractedCourses = data.courses.map(courseItem => ({
          ...courseItem.course,
          courseItemId: courseItem._id, // Store the reference ID for this specific course item
          section: courseItem.section,
          NoOfSections: courseItem.NoOfSections,
          labDivision: courseItem.labDivision
        }));
        
        setCourses(extractedCourses);

        const currentDate = new Date();
        const start = new Date(data.submissionStart);
        const end = new Date(data.submissionEnd);
        setSubmissionAllowed(currentDate >= start && currentDate <= end);

        // Check if the instructor is eligible for this form
        const isInstructorEligible = data.allInstructors || 
          (data.instructors && data.instructors.some(
            instructor => instructor._id === user._id
          ));
        setIsEligible(isInstructorEligible);
      } else {
        setPreferenceForm(null);
        setCourses([]);
        setIsEligible(false);
        setSubmissionAllowed(false);
        setErrorMessage("No active preference form found for the selected period");
      }
    } catch (error) {
      console.error("Error fetching preference form:", error);
      setPreferenceForm(null);
      setCourses([]);
      setIsEligible(false);
      setSubmissionAllowed(false);
      setErrorMessage("Failed to fetch preference form. Please try again.");
    }
    setLoading(prev => ({ ...prev, form: false }));
  };

  const fetchPreferences = async () => {
    try {
      const { data } = await api.get(`/preferences/${user._id}`, {
        params: {
          year: year,
          semester: semester,
          chair: user.chair,
        },
      });

      if (data.preferences && data.preferences.length > 0) {
        setPreferences(data.preferences);
        setHasSubmitted(true);
      } else {
        setPreferences([]);
        setHasSubmitted(false);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setPreferences([]);
      setHasSubmitted(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPreferenceForm();
    fetchPreferences();
  };

  const handlePreferenceChange = (courseId, rank) => {
    let updatedPreferences = preferences.filter((p) => p.courseId !== courseId);

    // Check if any other course already has this rank
    const existingCourseWithRank = preferences.find(p => p.rank === rank && p.courseId !== courseId);

    if (rank > 0) {
      if (existingCourseWithRank) {
        // Swap the ranks
        updatedPreferences = updatedPreferences.map(p =>
          p.courseId === existingCourseWithRank.courseId ? { ...p, rank: 0 } : p
        );
      }
      updatedPreferences.push({ courseId, rank });
      updatedPreferences.sort((a, b) => a.rank - b.rank);
    }
    setPreferences(updatedPreferences);
  };

  const handleUpdate = () => {
    setIsUpdating(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (preferences.length === 0) {
      setErrorMessage("Please select at least one course preference.");
      return;
    }
    setLoading(prev => ({ ...prev, submission: true }));
    setErrorMessage("");
    try {
      // Use isUpdating or hasSubmitted to determine the method
      const method = isUpdating || hasSubmitted ? "put" : "post";
      
      await api({
        method: method,
        url: "/preferences", // Same endpoint for both
        data: {
          instructorId: user._id,
          preferenceFormId: preferenceForm._id,
          preferences,
        }
      });
      
      setHasSubmitted(true);
      setIsUpdating(false); // Reset update mode after successful submission
      setSubmitSuccess(true);
      
      // Refresh preferences to ensure we display the correct data
      await fetchPreferences();
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting preferences:", error);
      setErrorMessage(isUpdating || hasSubmitted 
        ? "Failed to update preferences. Please try again."
        : "Failed to submit preferences. Please try again."
      );
    }
    setLoading(prev => ({ ...prev, submission: false }));
  };

  // Filter courses based on search query and chair
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChair = filterChair ? course.chair === filterChair : true;
    return matchesSearch && matchesChair;
  });

  // Get unique chairs for filter dropdown
  const chairs = [...new Set(courses.filter(course => course.chair).map(course => course.chair))];

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get readable lab division text
  const getLabDivisionText = (labDivision) => {
    return labDivision === "Yes" ? "Has Lab Sections" : "No Lab Sections";
  };

  // Animation variants
  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  if (user?.role !== "Instructor") {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-red-600 dark:text-red-400">
              <AlertCircle size={36} className="mb-2 md:mb-0" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold dark:text-white">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400">Only instructors can access this page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ClipboardList className="text-indigo-600 dark:text-indigo-400" size={24} />
              Course Preferences
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Submit and manage your course teaching preferences
            </p>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div 
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Preferences submitted successfully!</span>
              <button 
                onClick={() => setSubmitSuccess(false)}
                className="ml-auto text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
              >
                &times;
              </button>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div 
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center"
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
              <button 
                onClick={() => setErrorMessage("")}
                className="ml-auto text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Search Preference Form
          </h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                Academic Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
              >
                <option value="Regular 1">Regular 1</option>
                <option value="Regular 2">Regular 2</option>
                <option value="Summer">Summer</option>
                <option value="Extension">Extension</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-2.5 px-6 rounded-lg transition shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                disabled={loading.form}
              >
                {loading.form ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Main Content */}
        {loading.form ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400 mr-3" />
            <span className="text-gray-600 dark:text-gray-300">Loading...</span>
          </div>
        ) : preferenceForm ? (
          isEligible ? (
            submissionAllowed ? (
              <motion.div 
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all overflow-hidden"
              >
                <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-4 rounded-t-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center">
                      <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{preferenceForm.semester} - {preferenceForm.year} Preference Form</span>
                    </h2>
                    <p className="text-sm mt-1 text-indigo-100 dark:text-indigo-200">Chair: {preferenceForm.chair}</p>
                  </div>
                  <div className="text-sm bg-indigo-700 dark:bg-indigo-800 px-3 py-1.5 rounded-full shadow-sm">
                    Max Preferences: {preferenceForm.maxPreferences}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md border border-indigo-100 dark:border-indigo-800">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span>
                      Submission Period: {formatDate(preferenceForm.submissionStart)} - {formatDate(preferenceForm.submissionEnd)}
                    </span>
                  </div>

                  {/* Search and Filter Bar */}
                  {(!hasSubmitted || isUpdating) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full pl-10 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <select
                          value={filterChair}
                          onChange={(e) => setFilterChair(e.target.value)}
                          className="block w-full pl-10 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                        >
                          <option value="">All Chairs</option>
                          {chairs.map(chair => (
                            <option key={chair} value={chair}>{chair}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {(hasSubmitted && !isUpdating) ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Your Submitted Preferences
                      </h3>
                      
                      {/* Desktop view */}
                      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Rank</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Course</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Code</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Section</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Chair</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preferences.length > 0 ? (
                              preferences
                              .sort((a, b) => a.rank - b.rank)
                              .map((pref) => {
                                const course = courses.find(c => c._id === pref.courseId || c._id === pref.courseId._id);
                                return course ? (
                                  <tr key={pref.courseId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                                      <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full font-medium">
                                        {pref.rank}
                                      </span>
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                                      {pref.courseId.name || course.name}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                                      <span className="text-gray-500 dark:text-gray-400 flex items-center">
                                        <Code className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                                        {pref.courseId.code || course.code}
                                      </span>
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                                      {course.section}
                                      {course.NoOfSections > 1 && 
                                        <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                          ({course.NoOfSections} sections)
                                        </span>
                                      }
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                      {pref.courseId.chair || course.chair}
                                    </td>
                                  </tr>
                                ) : null;
                              })
                            ) : (
                              <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">No preferences found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Mobile view - cards */}
                      <div className="md:hidden space-y-3">
                        {preferences.length > 0 ? (
                          preferences
                          .sort((a, b) => a.rank - b.rank)
                          .map((pref) => {
                            const course = courses.find(c => c._id === pref.courseId || c._id === pref.courseId._id);
                            return course ? (
                              <div 
                                key={pref.courseId} 
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full font-medium">
                                    Rank {pref.rank}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{pref.courseId.chair || course.chair}</span>
                                </div>
                                <h4 className="font-medium text-gray-800 dark:text-white mb-1">{pref.courseId.name || course.name}</h4>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                                  <Code className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                                  {pref.courseId.code || course.code}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Section {course.section}
                                  {course.NoOfSections > 1 && 
                                    <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                      ({course.NoOfSections} sections)
                                    </span>
                                  }
                                </div>
                              </div>
                            ) : null;
                          })
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                            No preferences found
                          </div>
                        )}
                      </div>
                      
                      {submissionAllowed && (
                        <button
                          onClick={handleUpdate}
                          className="mt-6 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg transition shadow-sm"
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          Update Preferences
                        </button>
                      )}
                      {!submissionAllowed && (
                        <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-700 dark:text-yellow-300 flex items-start gap-3">
                          <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Submission period is closed</p>
                            <p className="text-sm mt-1">You cannot update your preferences at this time.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Course selection table/cards */}
                      
                      {/* Desktop view */}
                      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Course</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Code</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Section</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Chair</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Details</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Preference Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCourses.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">No courses match your search criteria</td>
                              </tr>
                            ) : (
                              filteredCourses.map((course) => (
                                <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                                    {course.name}
                                  </td>
                                  <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                      <Code className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                                      {course.code}
                                    </div>
                                  </td>
                                  <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                                    {course.section}
                                    {course.NoOfSections > 1 && 
                                      <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                        ({course.NoOfSections} sections)
                                      </span>
                                    }
                                  </td>
                                  <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                    {course.chair}
                                  </td>
                                  <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center text-xs">
                                      <Layers className="h-4 w-4 mr-1" />
                                      {getLabDivisionText(course.labDivision)}
                                    </div>
                                  </td>
                                  <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <select
                                      value={preferences.find((p) => p.courseId === course._id)?.rank || 0}
                                      onChange={(e) => handlePreferenceChange(course._id, parseInt(e.target.value))}
                                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition dark:bg-gray-700 dark:text-white text-base"
                                    >
                                      <option value="0">Not Selected</option>
                                      {[...Array(preferenceForm.maxPreferences).keys()].map((i) => (
                                        <option key={i + 1} value={i + 1}>
                                          {i + 1}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Mobile view - cards */}
                      <div className="md:hidden space-y-3">
                        {filteredCourses.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                            No courses match your search criteria
                          </div>
                        ) : (
                          filteredCourses.map((course) => (
                            <div 
                              key={course._id} 
                              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                              <div 
                                className="p-4 flex justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                              >
                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-white">{course.name}</h4>
                                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    <Code className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                                    {course.code}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Section {course.section}
                                    {course.NoOfSections > 1 && 
                                      <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                        ({course.NoOfSections} sections)
                                      </span>
                                    }
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={preferences.find((p) => p.courseId === course._id)?.rank || 0}
                                    onChange={(e) => handlePreferenceChange(course._id, parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition dark:bg-gray-700 dark:text-white text-base"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="0">Not Selected</option>
                                    {[...Array(preferenceForm.maxPreferences).keys()].map((i) => (
                                      <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                      </option>
                                    ))}
                                  </select>
                                  {expandedCourse === course._id ? 
                                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" /> : 
                                    <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  }
                                </div>
                              </div>
                              
                              <AnimatePresence>
                                {expandedCourse === course._id && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 pt-0 bg-gray-50 dark:bg-gray-700 text-sm">
                                      <div className="pt-3 border-t border-gray-200 dark:border-gray-600 mt-3">
                                        <p className="flex items-center">
                                          <Building className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                                          <span className="text-gray-800 dark:text-white font-medium">Chair:</span>
                                          <span className="ml-1 text-gray-500 dark:text-gray-400">{course.chair}</span>
                                        </p>
                                        <p className="mt-2 flex items-start">
                                          <Layers className="h-4 w-4 mr-1 mt-0.5 text-gray-400 dark:text-gray-500" />
                                          <span className="text-gray-500 dark:text-gray-400">{getLabDivisionText(course.labDivision)}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-indigo-800">
                          <Award className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                          <span>Selected preferences: <span className="font-semibold">{preferences.length}/{preferenceForm.maxPreferences}</span></span>
                        </div>
                        <button
                          type="submit"
                          disabled={loading.submission}
                          className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg transition shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-600"
                        >
                          {loading.submission ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              {isUpdating ? "Updating..." : "Submitting..."}
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              {isUpdating ? "Update Preferences" : "Submit Preferences"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800 flex flex-col md:flex-row md:items-start gap-4">
                <AlertCircle className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Submission Period Closed</h3>
                  <p>The submission period for this preference form is not currently active.</p>
                  <p className="text-sm mt-2">
                    Submission period: {formatDate(preferenceForm.submissionStart)} - {formatDate(preferenceForm.submissionEnd)}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-6 rounded-lg border border-red-200 dark:border-red-800 flex flex-col md:flex-row md:items-start gap-4">
              <AlertCircle className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Not Eligible</h3>
                <p>You are not eligible to submit preferences for this form.</p>
                <p className="mt-2 text-sm">This form is only available to selected instructors in the {preferenceForm.chair} department.</p>
              </div>
            </div>
          )
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-start gap-4">
            <Info className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <div>
              <p>Please search for a preference form using the fields above.</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your department's chair creates preference forms for each semester. If you can't find a form, please contact your department chair.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesInst;