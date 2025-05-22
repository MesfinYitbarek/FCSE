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
  Code, 
  Layers, 
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronRight,
  Building,
  AlertTriangle,
  Clock
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
  const [showRequirementWarning, setShowRequirementWarning] = useState(false);
  const [previousPreferences, setPreviousPreferences] = useState([]);
  const [formStatus, setFormStatus] = useState(null); // Added to track form status: "not_found", "upcoming", "closed", "active", "error"
  const [formDetails, setFormDetails] = useState(null); // Store form details even when not active

  useEffect(() => {
    // Initial component setup - don't fetch any data automatically
    // Both fetchPreferenceForm and fetchPreferences will only be called when search button is clicked
  }, [user]);

  const fetchPreferenceForm = async () => {
    setLoading(prev => ({ ...prev, form: true }));
    setErrorMessage("");
    setFormStatus(null);
    setFormDetails(null);
    
    try {
      // Get active preference form for the instructor's chair
      const { data } = await api.get(`/preference-forms/active?year=${year}&semester=${semester}&chair=${user.chair}`);
      if (data) {
        setPreferenceForm(data);
        setFormStatus("active");

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

        // Use submissionAllowed directly from the backend response
        setSubmissionAllowed(data.submissionAllowed);

        // Check if the instructor is eligible for this form
        const isInstructorEligible = data.allInstructors || 
          (data.instructors && data.instructors.some(
            instructor => instructor._id === user._id
          ));
        setIsEligible(isInstructorEligible);
        
        // Show requirement warning
        setShowRequirementWarning(true);
      } else {
        setPreferenceForm(null);
        setCourses([]);
        setIsEligible(false);
        setSubmissionAllowed(false);
        setFormStatus("not_found");
        setErrorMessage("No active preference form found for the selected period");
      }
    } catch (error) {
      console.error("Error fetching preference form:", error);
      setPreferenceForm(null);
      setCourses([]);
      setIsEligible(false);
      setSubmissionAllowed(false);
      
      // Improved error message based on the status from the backend
      if (error.response) {
        if (error.response.status === 404) {
          setFormStatus("not_found");
          setErrorMessage("No preference form found for your chair in the selected semester. Please check with your chair head if you believe this is incorrect.");
        } else if (error.response.status === 400) {
          // Check the status field in the response for more specific information
          const status = error.response.data.status;
          const formData = error.response.data.form;
          setFormDetails(formData);
          
          if (status === "upcoming") {
            setFormStatus("upcoming");
            const startDate = new Date(formData.submissionStart).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric'
            });
            const startTime = new Date(formData.submissionStart).toLocaleTimeString(undefined, {
              hour: '2-digit', minute: '2-digit'
            });
            
            setErrorMessage(`A preference form exists but the submission period has not started yet. You can submit your preferences starting from ${startDate} at ${startTime}.`);
          } else if (status === "closed") {
            setFormStatus("closed");
            const endDate = new Date(formData.submissionEnd).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric'
            });
            
            setErrorMessage(`The submission period for this preference form has ended on ${endDate}. Contact your chair if you need to make changes to your preferences.`);
          } else {
            setFormStatus("inactive");
            setErrorMessage("The preference form exists but is not currently active for submissions. Please check with your chair for the submission schedule.");
          }
        } else if (error.response.status >= 500) {
          setFormStatus("error");
          setErrorMessage("We're experiencing server issues. Please try again later or contact support if the problem persists.");
        } else {
          setFormStatus("error");
          setErrorMessage("We couldn't retrieve the preference form due to a system error. Please try again.");
        }
      } else if (error.request) {
        setFormStatus("error");
        setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
      } else {
        setFormStatus("error");
        setErrorMessage("An unexpected error occurred while loading the preference form. Please try again.");
      }
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
        setPreviousPreferences(data.preferences);
        setHasSubmitted(true);
      } else {
        setPreferences([]);
        setPreviousPreferences([]);
        setHasSubmitted(false);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setPreferences([]);
      setPreviousPreferences([]);
      setHasSubmitted(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPreferenceForm();
    fetchPreferences();
  };

  const handlePreferenceChange = (courseId, newRank) => {
    // If the new rank is 0, simply remove this course from preferences
    if (newRank === 0) {
      setPreferences(preferences.filter((p) => p.courseId !== courseId));
      setShowRequirementWarning(true);
      return;
    }
    
    // Get the current rank of this course, if any
    const currentPref = preferences.find(p => p.courseId === courseId);
    const currentRank = currentPref ? currentPref.rank : 0;
    
    // Check if another course already has the new rank
    const existingCourseWithRank = preferences.find(p => p.rank === newRank && p.courseId !== courseId);
    
    // Make a copy of current preferences, removing the current course
    let updatedPreferences = preferences.filter(p => p.courseId !== courseId);
    
    // If another course has the new rank, we need to handle it
    if (existingCourseWithRank) {
      if (currentRank === 0) {
        // If we're assigning a new course and all slots are filled, 
        // remove the course with the conflict rank
        updatedPreferences = updatedPreferences.filter(p => p.courseId !== existingCourseWithRank.courseId);
      } else {
        // If we're changing the rank of an already selected course,
        // swap ranks with the conflicting course
        updatedPreferences = updatedPreferences.map(p => 
          p.courseId === existingCourseWithRank.courseId ? { ...p, rank: currentRank } : p
        );
      }
    }
    
    // Add the course with the new rank to the preferences
    updatedPreferences.push({ courseId, rank: newRank });
    
    // Sort preferences by rank
    updatedPreferences.sort((a, b) => a.rank - b.rank);
    
    setPreferences(updatedPreferences);
    
    // Update the warning state
    if (updatedPreferences.length === preferenceForm.maxPreferences) {
      const ranks = updatedPreferences.map(p => p.rank).sort((a, b) => a - b);
      let isComplete = true;
      for (let i = 0; i < ranks.length; i++) {
        if (ranks[i] !== i + 1) {
          isComplete = false;
          break;
        }
      }
      
      if (isComplete) {
        setShowRequirementWarning(false);
      } else {
        setShowRequirementWarning(true);
      }
    } else {
      setShowRequirementWarning(true);
    }
    
    // Clear any error messages when a valid change is made
    setErrorMessage("");
  };

  const handleUpdate = () => {
    // When switching to update mode, reset all current preferences to 0
    setPreferences([]);
    setIsUpdating(true);
    setShowRequirementWarning(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    
    // 1. Check if any preferences are selected
    if (preferences.length === 0) {
      setErrorMessage("Please select at least one course preference.");
      return;
    }
    
    // 2. Ensure exactly the required number of preferences are selected
    if (preferences.length !== preferenceForm.maxPreferences) {
      setErrorMessage(`You must select exactly ${preferenceForm.maxPreferences} courses. Currently selected: ${preferences.length}.`);
      return;
    }
    
    // 3. Ensure no gaps in preference ranking (1,2,3... up to maxPreferences)
    const ranks = preferences.map(p => p.rank).sort((a, b) => a - b);
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] !== i + 1) {
        setErrorMessage(`Your preference ranking must be sequential (1,2,3...). Please check your selections.`);
        return;
      }
    }
    
    // 4. Check for duplicate course selections
    const courseIds = preferences.map(p => p.courseId);
    if (new Set(courseIds).size !== courseIds.length) {
      setErrorMessage("Each course can only be selected once. Please check your selections.");
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
      setShowRequirementWarning(false);
      
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

  const handleCancelUpdate = () => {
    // Restore previous preferences and exit update mode
    setPreferences(previousPreferences);
    setIsUpdating(false);
    setShowRequirementWarning(false);
  };
  
  // Helper function to check if all preferences are selected correctly
  const areAllPreferencesSelected = () => {
    if (!preferenceForm) return true;
    
    // Check if we have exactly the right number of preferences
    if (preferences.length !== preferenceForm.maxPreferences) return false;
    
    // Check if the ranks are sequential (1,2,3...)
    const ranks = preferences.map(p => p.rank).sort((a, b) => a - b);
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] !== i + 1) return false;
    }
    
    // Check for duplicate course selections
    const courseIds = preferences.map(p => p.courseId);
    if (new Set(courseIds).size !== courseIds.length) return false;
    
    return true;
  };

  // Get the current preference rank for a course
  const getCurrentRank = (courseId) => {
    // If we're in update mode and we haven't selected this course yet, return 0
    if (isUpdating) {
      const pref = preferences.find(p => p.courseId === courseId);
      return pref ? pref.rank : 0;
    }
    
    // Otherwise, get the preference rank from the preferences array
    const pref = preferences.find(p => p.courseId === courseId);
    return pref ? pref.rank : 0;
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

  // Get dropdown option text based on rank
  const getDropdownLabel = (rank) => {
    if (rank === 0) return "Not Selected";
    return `${rank}`;
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

  // Generate the appropriate icon and color for the form status
  const getFormStatusDisplay = () => {
    switch(formStatus) {
      case "upcoming":
        return {
          icon: <Clock className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          title: "Submission Period Not Started Yet"
        };
      case "closed":
        return {
          icon: <Lock className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />,
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          title: "Submission Period Ended"
        };
      case "not_found":
        return {
          icon: <AlertCircle className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-700",
          borderColor: "border-gray-200 dark:border-gray-600",
          title: "No Preference Form Found"
        };
      case "error":
        return {
          icon: <AlertTriangle className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          title: "Error Retrieving Preference Form"
        };
      default:
        return {
          icon: <Info className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />,
          color: "text-gray-500 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-800",
          borderColor: "border-gray-200 dark:border-gray-700",
          title: "Search for a Preference Form"
        };
    }
  };

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
          {showRequirementWarning && preferenceForm && ((!hasSubmitted || isUpdating)) && (
            <motion.div 
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 flex items-center"
            >
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>You must rank <strong>all {preferenceForm.maxPreferences} preference slots</strong> before submission. Currently selected: {preferences.length}/{preferenceForm.maxPreferences}.</span>
              <button 
                onClick={() => setShowRequirementWarning(false)}
                className="ml-auto text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
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
                  <div className="text-sm bg-indigo-700 dark:bg-indigo-800 px-3 py-1.5 rounded-full shadow-sm flex items-center">
                    <span className="font-bold">Required Preferences:</span>
                    <span className="ml-1">{preferenceForm.maxPreferences}</span>
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
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">No of Sections</th>
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
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                                      {course.NoOfSections}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                      {pref.courseId.chair || course.chair}
                                    </td>
                                  </tr>
                                ) : null;
                              })
                            ) : (
                              <tr>
                                <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">No preferences found</td>
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
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  No of Sections: {course.NoOfSections}
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
                      {/* Preference instructions */}
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md text-blue-800 dark:text-blue-300">
                        <h3 className="font-medium flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          Important Instructions
                        </h3>
                        <ul className="mt-2 ml-6 list-disc text-sm">
                          <li>You <strong>must rank all {preferenceForm.maxPreferences} preference slots</strong> to submit your preferences</li>
                          <li>Rank 1 is your highest preference, {preferenceForm.maxPreferences} is your lowest</li>
                          <li>Each course must have a unique ranking</li>
                          <li>Each course can only be selected once</li>
                        </ul>
                      </div>
                      
                      {isUpdating && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="text-blue-800 dark:text-blue-300 flex items-center">
                              <AlertCircle className="h-5 w-5 mr-2" />
                              <span className="font-medium">Update Mode: Please re-select all your course preferences</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCancelUpdate}
                              className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium text-sm"
                            >
                              Cancel Update
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Course selection table/cards */}
                      
                      {/* Desktop view */}
                      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Course</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Code</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Section</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">No of Sections</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Chair</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Details</th>
                              <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Preference Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCourses.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">No courses match your search criteria</td>
                              </tr>
                            ) : (
                              filteredCourses.map((course) => {
                                // Get the current rank for this course
                                const currentRank = getCurrentRank(course._id);
                                
                                return (
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
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                                      {course.NoOfSections}
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
                                        value={currentRank}
                                        onChange={(e) => handlePreferenceChange(course._id, parseInt(e.target.value))}
                                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:border-indigo-500 dark:focus:border-indigo-600 transition dark:bg-gray-700 dark:text-white text-base ${
                                          currentRank > 0
                                            ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                        }`}
                                      >
                                        <option value="0">{getDropdownLabel(0)}</option>
                                        {[...Array(preferenceForm.maxPreferences).keys()].map((i) => (
                                          <option 
                                            key={i + 1} 
                                            value={i + 1}
                                          >
                                            {getDropdownLabel(i + 1)}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  </tr>
                                )
                              })
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
                          filteredCourses.map((course) => {
                            // Get the current rank for this course
                            const currentRank = getCurrentRank(course._id);
                            
                            return (
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
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      No of Sections: {course.NoOfSections}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={currentRank}
                                      onChange={(e) => handlePreferenceChange(course._id, parseInt(e.target.value))}
                                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:border-indigo-500 dark:focus:border-indigo-600 transition dark:bg-gray-700 dark:text-white text-base ${
                                        currentRank > 0
                                          ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                          : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                      }`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <option value="0">{getDropdownLabel(0)}</option>
                                      {[...Array(preferenceForm.maxPreferences).keys()].map((i) => (
                                        <option 
                                          key={i + 1} 
                                          value={i + 1}
                                        >
                                          {getDropdownLabel(i + 1)}
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
                            )
                          })
                        )}
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className={`text-sm flex items-center px-3 py-2 rounded-md border ${
                          areAllPreferencesSelected() 
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800"
                            : "bg-indigo-50 dark:bg-indigo-900/20 text-gray-700 dark:text-gray-300 border-indigo-100 dark:border-indigo-800"
                        }`}>
                          <Award className={`h-4 w-4 mr-2 ${
                            areAllPreferencesSelected() 
                              ? "text-green-600 dark:text-green-400"
                              : "text-indigo-600 dark:text-indigo-400"
                          }`} />
                          <span>Selected preferences: <span className="font-semibold">{preferences.length}/{preferenceForm.maxPreferences}</span></span>
                        </div>
                        <div className="w-full sm:w-auto flex space-x-2">
                          {isUpdating && (
                            <button
                              type="button"
                              onClick={handleCancelUpdate}
                              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={loading.submission || !areAllPreferencesSelected()}
                            className={`w-full sm:w-auto inline-flex items-center justify-center text-white px-6 py-2.5 rounded-lg transition shadow-sm ${
                              loading.submission || !areAllPreferencesSelected()
                                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                            }`}
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
          <>
            {/* Initial state - no search made yet */}
            {!formStatus && !errorMessage && (
              <div className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-start gap-4">
                <Info className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <div>
                  <p>Please search for a preference form using the fields above.</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your department's chair creates preference forms for each semester. If you can't find a form, please contact your department chair.</p>
                </div>
              </div>
            )}
            
            {/* Form exists but is not active */}
            {formStatus && (
              <div className={`${getFormStatusDisplay().bgColor} ${getFormStatusDisplay().color} p-6 rounded-lg border ${getFormStatusDisplay().borderColor} flex flex-col md:flex-row md:items-start gap-4`}>
                {getFormStatusDisplay().icon}
                <div>
                  <h3 className="font-semibold">{getFormStatusDisplay().title}</h3>
                  <p>{errorMessage}</p>
                  
                  {/* Show additional information for upcoming or closed forms */}
                  {formDetails && (formStatus === "upcoming" || formStatus === "closed") && (
                    <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-md border border-gray-200/50 dark:border-gray-700/50">
                      <h4 className="font-medium text-sm mb-2">Form Details:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Year:</span> {formDetails.year}
                        </div>
                        <div>
                          <span className="font-medium">Semester:</span> {formDetails.semester}
                        </div>
                        <div>
                          <span className="font-medium">Chair:</span> {formDetails.chair}
                        </div>
                        <div>
                          <span className="font-medium">Submission Period:</span> {formatDate(formDetails.submissionStart)} - {formatDate(formDetails.submissionEnd)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formStatus === "upcoming" && (
                    <div className="mt-4 text-sm p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Remember to come back when the submission period starts to submit your preferences.</span>
                      </p>
                    </div>
                  )}
                  
                  {formStatus === "closed" && (
                    <div className="mt-4 text-sm p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                      <p className="flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        <span>If you need to make changes, please contact your department chair directly.</span>
                      </p>
                    </div>
                  )}
                  
                  {formStatus === "not_found" && (
                    <div className="mt-4 text-sm p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                      <p className="flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        <span>Try searching for a different semester or year, or contact your department chair for more information.</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PreferencesInst;