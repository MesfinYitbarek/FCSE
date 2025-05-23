import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import {
  Calendar,
  Plus,
  Filter,
  Trash2,
  Edit,
  X,
  RefreshCw,
  Search,
  ChevronDown,
  Save,
  Book,
  Users,
  Loader2,
  Info,
  Check,
  Sliders
} from 'lucide-react';
import { toast } from "react-hot-toast";

const PreferenceForm = () => {
  const { user } = useSelector((state) => state.auth);
  const [preferenceForms, setPreferenceForms] = useState([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    semester: "Regular 1",
    maxPreferences: 5,
    submissionStart: "",
    submissionEnd: "",
    courses: [],
    instructors: [],
    allInstructors: false,
    excludedInstructors: [] // For tracking instructors excluded when "Select All" is checked
  });
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  // Course filtering states
  const [courseFilterDept, setCourseFilterDept] = useState("");
  const [courseFilterYear, setCourseFilterYear] = useState("");
  const [courseFilterSemester, setCourseFilterSemester] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Selected course details states
  const [selectedCourseDetails, setSelectedCourseDetails] = useState({});

  // Filter states
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterSemester, setFilterSemester] = useState("");
  const [filterChair, setFilterChair] = useState(user.chair);
  const [isFiltered, setIsFiltered] = useState(false);
  const [chairs, setChairs] = useState([]);

  // Specific departments for filtering
  const departments = ["Computer Science", "Information Technology", "Software Engineering"];

  // Mobile responsiveness
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get available years for the filter dropdown
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Fetch available chairs (for admin users) 
  useEffect(() => {
    const fetchChairs = async () => {
      try {
        const { data } = await api.get("/chairs");
        setChairs(data);
      } catch (error) {
        console.error("Error fetching chairs:", error);
      }
    };

    fetchChairs();
  }, []);

  // Fetch courses and instructors on component mount
  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  // Filter courses based on selected filters
  useEffect(() => {
    if (courses.length > 0) {
      let filtered = [...courses];

      if (courseFilterDept) {
        filtered = filtered.filter(course => course.department === courseFilterDept);
      }

      if (courseFilterYear) {
        filtered = filtered.filter(course => course.year === parseInt(courseFilterYear));
      }

      if (courseFilterSemester) {
        filtered = filtered.filter(course => course.semester === parseInt(courseFilterSemester));
      }

      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [courses, courseFilterDept, courseFilterYear, courseFilterSemester]);

  const fetchPreferenceForms = async () => {
    setFetchingData(true);
    try {
      const { data } = await api.get(
        `/preference-forms/filter?year=${filterYear}${filterSemester ? `&semester=${filterSemester}` : ''}&chair=${filterChair}`
      );
      setPreferenceForms(Array.isArray(data) ? data : []);
      setIsFiltered(true);
    } catch (error) {
      console.error("Error fetching preference forms:", error);
      setPreferenceForms([]);
    } finally {
      setFetchingData(false);
    }
  };

  // Fetch available  courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/courses/assigned/${user.chair}`);
      console.log("Fetched courses:", data); // Log the fetched data

      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data && Array.isArray(data.courses)) {
        // In case the API returns the courses in a nested property
        setCourses(data.courses);
      } else {
        setCourses([]);
        console.warn("Courses data is not in expected format:", data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data } = await api.get(`/users/users/${filterChair || user.chair}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle course selection with details
  const handleCourseSelection = (courseId) => {
    let updatedCourses = [...formData.courses];

    // Check if course is already selected
    const courseIndex = updatedCourses.findIndex(c =>
      typeof c === 'object' ? c.course === courseId : c === courseId
    );

    if (courseIndex !== -1) {
      // Remove course if already selected
      updatedCourses = updatedCourses.filter((_, index) => index !== courseIndex);

      // Remove course details
      const newSelectedCourseDetails = { ...selectedCourseDetails };
      delete newSelectedCourseDetails[courseId];
      setSelectedCourseDetails(newSelectedCourseDetails);
    } else {
      // Add course with details
      updatedCourses.push({
        course: courseId,
        section: "A",
        NoOfSections: 1,
        labDivision: "No"
      });

      // Initialize course details
      setSelectedCourseDetails({
        ...selectedCourseDetails,
        [courseId]: {
          section: "A",
          NoOfSections: 1,
          labDivision: "No"
        }
      });
    }

    setFormData({ ...formData, courses: updatedCourses });
  };

  // Handle course details change
  const handleCourseDetailChange = (courseId, field, value) => {
    // Update selected course details
    const updatedDetails = {
      ...selectedCourseDetails,
      [courseId]: {
        ...selectedCourseDetails[courseId],
        [field]: value
      }
    };
    setSelectedCourseDetails(updatedDetails);

    // Update form data courses array
    const updatedCourses = formData.courses.map(course => {
      if (typeof course === 'object' && course.course === courseId) {
        return {
          ...course,
          [field]: value
        };
      }
      return course;
    });

    setFormData({ ...formData, courses: updatedCourses });
  };

  // Handle instructor selection
  const handleInstructorSelection = (instructorId) => {
    if (formData.allInstructors) {
      // When "Select All" is enabled, we manage exclusions instead
      const updatedExcludedInstructors = formData.excludedInstructors.includes(instructorId)
        ? formData.excludedInstructors.filter(id => id !== instructorId) // Remove from exclusions (select)
        : [...formData.excludedInstructors, instructorId]; // Add to exclusions (unselect)

      setFormData({ ...formData, excludedInstructors: updatedExcludedInstructors });
    } else {
      // Normal behavior when "Select All" is off
      const updatedInstructors = formData.instructors.includes(instructorId)
        ? formData.instructors.filter((id) => id !== instructorId)
        : [...formData.instructors, instructorId];

      setFormData({ ...formData, instructors: updatedInstructors });
    }
  };

  // Handle "All Instructors" toggle
  const handleAllInstructorsToggle = () => {
    if (formData.allInstructors) {
      // Turning off "Select All"
      setFormData({
        ...formData,
        allInstructors: false,
        excludedInstructors: [] // Clear exclusions
      });
    } else {
      // Turning on "Select All"
      setFormData({
        ...formData,
        allInstructors: true,
        excludedInstructors: [], // Start with no exclusions
        instructors: [] // Clear selected instructors since we're using all now
      });
    }
  };

  // Check if instructor is selected considering both normal selection and exclusions
  const isInstructorSelected = (instructorId) => {
    if (formData.allInstructors) {
      // When "Select All" is on, instructors are selected unless excluded
      return !formData.excludedInstructors.includes(instructorId);
    } else {
      // Normal behavior
      return formData.instructors.includes(instructorId);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterYear(new Date().getFullYear());
    setFilterSemester("");
    setFilterChair(user.chair);
    setIsFiltered(false);
  };

  // Reset course filters
  const resetCourseFilters = () => {
    setCourseFilterDept("");
    setCourseFilterYear("");
    setCourseFilterSemester("");
  };

  // Get current datetime in ISO format for min attribute on datetime-local inputs
  const getCurrentDateTimeISO = () => {
  const now = new Date();
  // Format to local timezone YYYY-MM-DDThh:mm
  return new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16);
};

  // Handle creating or updating a preference form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate submission dates
    const startDate = new Date(formData.submissionStart);
    const endDate = new Date(formData.submissionEnd);
    const currentDate = new Date();

    if (startDate < currentDate) {
      toast.error("Submission start date cannot be earlier than the current date");
      return;
    }

    if (endDate < startDate) {
      toast.error("Submission end date cannot be earlier than the start date");
      return;
    }

    setLoading(true);

    try {
      // Format courses with their details for submission
      const formattedCourses = formData.courses.map(course => {
        if (typeof course === 'object' && course.course) {
          return {
            course: course.course,
            section: course.section,
            NoOfSections: course.NoOfSections,
            labDivision: course.labDivision
          };
        } else {
          // For backward compatibility with existing data
          const courseId = course;
          const details = selectedCourseDetails[courseId] || {
            section: "A",
            NoOfSections: 1,
            labDivision: "No"
          };

          return {
            course: courseId,
            section: details.section,
            NoOfSections: details.NoOfSections,
            labDivision: details.labDivision
          };
        }
      });

      // Prepare the list of instructors based on the selection mode
      let finalInstructors;
      if (formData.allInstructors) {
        // When using "Select All", we use all instructors except the excluded ones
        finalInstructors = instructors
          .filter(instructor => !formData.excludedInstructors.includes(instructor._id))
          .map(instructor => instructor._id);
      } else {
        // Use explicitly selected instructors
        finalInstructors = formData.instructors;
      }

      const dataToSubmit = {
        ...formData,
        courses: formattedCourses,
        instructors: finalInstructors,
        chair: filterChair || user.chair
      };

      if (selectedForm) {
        await api.put(`/preference-forms/${selectedForm._id}`, dataToSubmit);
        toast.success("Preference form updated successfully");
      } else {
        await api.post("/preference-forms", dataToSubmit);
        toast.success("Preference form created successfully");
      }

      setOpenModal(false);
      setFormData({
        year: new Date().getFullYear(),
        semester: "Regular 1",
        maxPreferences: 5,
        submissionStart: "",
        submissionEnd: "",
        courses: [],
        instructors: [],
        allInstructors: false,
        excludedInstructors: []
      });
      setSelectedCourseDetails({});
      setSelectedForm(null);

      // Refresh the list with current filters
      if (isFiltered) {
        fetchPreferenceForms();
      }
    } catch (error) {
      console.error("Error saving preference form:", error);
      toast.error(error.response?.data?.message || "Failed to save preference form");
    }

    setLoading(false);
  };

  // Open edit modal and pre-fill form
  const openEditFormModal = (form) => {
    setSelectedForm(form);

    // Format courses with their details
    const coursesWithDetails = form.courses.map(course => {
      if (typeof course === 'object') {
        return {
          course: course.course._id || course.course,
          section: course.section || "A",
          NoOfSections: course.NoOfSections || 1,
          labDivision: course.labDivision || "No"
        };
      } else {
        return {
          course: course._id || course,
          section: "A",
          NoOfSections: 1,
          labDivision: "No"
        };
      }
    });

    // Prepare course details for state
    const courseDetailsMap = {};
    coursesWithDetails.forEach(course => {
      if (typeof course === 'object' && course.course) {
        courseDetailsMap[course.course] = {
          section: course.section,
          NoOfSections: course.NoOfSections,
          labDivision: course.labDivision
        };
      }
    });

    setSelectedCourseDetails(courseDetailsMap);

    // Calculate excluded instructors if allInstructors is true
    let excludedInstructorIds = [];
    if (form.allInstructors) {
      // If all instructors are enabled, calculate which ones are excluded
      const selectedInstructorIds = form.instructors.map(instructor => instructor._id || instructor);
      excludedInstructorIds = instructors
        .filter(instructor => !selectedInstructorIds.includes(instructor._id))
        .map(instructor => instructor._id);
    }

    setFormData({
      year: form.year,
      semester: form.semester,
      maxPreferences: form.maxPreferences,
      submissionStart: form.submissionStart,
      submissionEnd: form.submissionEnd,
      courses: coursesWithDetails,
      instructors: form.instructors.map(instructor => instructor._id || instructor),
      allInstructors: form.allInstructors || false,
      excludedInstructors: excludedInstructorIds
    });

    setOpenModal(true);
  };

  // Open delete confirmation modal
  const openDeleteFormModal = (form) => {
    setSelectedForm(form);
    if (window.confirm("Are you sure you want to delete this form?")) {
      handleDeleteForm(form._id);
    }
  };

  // Handle deleting a form
  const handleDeleteForm = async (formId) => {
    setLoading(true);
    try {
      await api.delete(`/preference-forms/${formId}`);
      if (isFiltered) {
        fetchPreferenceForms();
      }
      toast.success("Preference form deleted successfully");
    } catch (error) {
      console.error("Error deleting preference form:", error);
      toast.error(error.response?.data?.message || "Failed to delete preference form");
    }
    setLoading(false);
  };

  // Handle search button click
  const handleSearch = () => {
    fetchPreferenceForms();
  };

  // Check if course is selected
  const isCourseSelected = (courseId) => {
    return formData.courses.some(course =>
      typeof course === 'object'
        ? course.course === courseId
        : course === courseId
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Course Preference Forms</h1>
        <p className="text-gray-600 dark:text-gray-300">Create and manage preference forms for instructors to submit their course preferences.</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 border-l-4 border-l-indigo-500 rounded-lg shadow-sm">
        <div className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white mb-4">
            <Filter size={18} className="text-indigo-500" /> Filter Preference Forms
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
              <div className="relative">
                <input
                  type="text"  // or "number" if you only want numeric input
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter year"  // optional placeholder
                  list="yearSuggestions"   // optional for autocomplete suggestions
                />

                {/* Optional datalist for suggestions (similar to dropdown) */}
                <datalist id="yearSuggestions">
                  {availableYears.map(year => (
                    <option key={year} value={year} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
              <div className="relative">
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Semesters</option>
                  <option value="Regular 1">Regular 1</option>
                  <option value="Regular 2">Regular 2</option>
                </select>
              </div>
            </div>

            {user.role === "admin" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                <div className="relative">
                  <select
                    value={filterChair}
                    onChange={(e) => setFilterChair(e.target.value)}
                    className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {chairs.map(chair => (
                      <option key={chair._id} value={chair._id}>{chair.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            )}

            <div className={`${user.role === "admin" ? '' : 'sm:col-span-2'} flex items-end space-x-2`}>
              <button
                onClick={handleSearch}
                disabled={fetchingData}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 dark:disabled:opacity-40"
              >
                {fetchingData ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Search
              </button>

              <button
                onClick={resetFilters}
                className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button
          onClick={() => {
            setSelectedForm(null);
            setFormData({
              year: new Date().getFullYear(),
              semester: "Regular 1",
              maxPreferences: 5,
              submissionStart: "",
              submissionEnd: "",
              courses: [],
              instructors: [],
              allInstructors: false,
              excludedInstructors: []
            });
            setSelectedCourseDetails({});
            setOpenModal(true);
          }}
          className="w-full sm:w-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus size={16} /> Create Preference Form
        </button>

        {isFiltered && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Found {preferenceForms.length} forms
          </span>
        )}
      </div>

      {/* Preference Forms List */}
      {isFiltered && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          {fetchingData ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : preferenceForms.length > 0 ? (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {preferenceForms.map((form) => {
                  const now = new Date();
                  const startDate = new Date(form.submissionStart);
                  const endDate = new Date(form.submissionEnd);
                  let status = "Upcoming";
                  let statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";

                  if (now > endDate) {
                    status = "Closed";
                    statusClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
                  } else if (now >= startDate) {
                    status = "Active";
                    statusClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
                  }

                  return (
                    <div key={form._id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                            {form.year} - {form.semester}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Max preferences: {form.maxPreferences}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                          {status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <Calendar size={14} className="text-gray-500" />
                        <span>{new Date(form.submissionStart).toLocaleDateString()} - {new Date(form.submissionEnd).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => openEditFormModal(form)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 py-2 px-3 rounded-md text-sm transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteFormModal(form)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 py-2 px-3 rounded-md text-sm transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Preferences</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submission Period</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {preferenceForms.map((form) => {
                      const now = new Date();
                      const startDate = new Date(form.submissionStart);
                      const endDate = new Date(form.submissionEnd);
                      let status = "Upcoming";
                      let statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";

                      if (now > endDate) {
                        status = "Closed";
                        statusClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
                      } else if (now >= startDate) {
                        status = "Active";
                        statusClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
                      }

                      return (
                        <tr key={form._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{form.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{form.semester}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{form.maxPreferences}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-gray-500" />
                              <span>{new Date(form.submissionStart).toLocaleDateString()} - {new Date(form.submissionEnd).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditFormModal(form)}
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                              >
                                <Edit size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => openDeleteFormModal(form)}
                                className="ml-3 inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Info size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No preference forms found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                No preference forms match your current filter criteria. Try adjusting your filters or create a new form.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Form Creation/Edit Dialog */}
      {openModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {selectedForm ? "Edit Preference Form" : "Create Preference Form"}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={() => setOpenModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}                     
                      required
                      className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                    <div className="relative">
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                        className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Regular 1">Regular 1</option>
                        <option value="Regular 2">Regular 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Preferences</label>
                    <input
                      type="number"
                      name="maxPreferences"
                      value={formData.maxPreferences}
                      onChange={handleChange}
                      min={1}
                      required
                      className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-3 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submission Start Date</label>
                    <input
                      type="datetime-local"
                      name="submissionStart"
                      value={formData.submissionStart}
                      onChange={handleChange}
                      min={getCurrentDateTimeISO()}
                      required
                      className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-3 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submission End Date</label>
                    <input
                      type="datetime-local"
                      name="submissionEnd"
                      value={formData.submissionEnd}
                      onChange={handleChange}
                      min={formData.submissionStart || getCurrentDateTimeISO()}
                      required
                      className="block w-full text-base bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formData.submissionEnd && formData.submissionStart && new Date(formData.submissionEnd) < new Date(formData.submissionStart) && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">End date must be after start date</p>
                    )}
                  </div>
                </div>

                <hr className="my-6 border-gray-200 dark:border-gray-700" />

                {/* Course Selection with Filtering */}
                <div className="mb-6">
                  <h4 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white mb-3">
                    <Book size={16} className="text-indigo-500" /> Available Courses
                  </h4>

                  {/* Course Filters */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Sliders size={14} className="text-indigo-500" /> Filter Courses
                      </h5>
                      <button
                        type="button"
                        onClick={resetCourseFilters}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        Reset Filters
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Department</label>
                        <select
                          value={courseFilterDept}
                          onChange={(e) => setCourseFilterDept(e.target.value)}
                          className="block w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All Departments</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
                        <select
                          value={courseFilterYear}
                          onChange={(e) => setCourseFilterYear(e.target.value)}
                          className="block w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All Years</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                          <option value="5">Year 5</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Semester</label>
                        <select
                          value={courseFilterSemester}
                          onChange={(e) => setCourseFilterSemester(e.target.value)}
                          className="block w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All Semesters</option>
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                        <div key={course._id} className={`p-2 border rounded-md ${isCourseSelected(course._id)
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700'
                          }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <div
                              onClick={() => handleCourseSelection(course._id)}
                              className={`flex h-5 w-5 items-center justify-center border rounded cursor-pointer transition-colors ${isCourseSelected(course._id)
                                  ? 'bg-indigo-500 border-indigo-500'
                                  : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                              {isCourseSelected(course._id) && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                            <label
                              onClick={() => handleCourseSelection(course._id)}
                              className="text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer font-medium"
                            >
                              {course.name}
                            </label>
                          </div>

                          {/* Show course details fields when selected */}
                          {isCourseSelected(course._id) && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Section</label>
                                <input
                                  type="text"
                                  value={selectedCourseDetails[course._id]?.section || "A"}
                                  onChange={(e) => handleCourseDetailChange(course._id, "section", e.target.value)}
                                  className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">No. of Sections</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={selectedCourseDetails[course._id]?.NoOfSections || 1}
                                  onChange={(e) => handleCourseDetailChange(course._id, "NoOfSections", parseInt(e.target.value, 10))}
                                  className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Lab Division</label>
                                <select
                                  value={selectedCourseDetails[course._id]?.labDivision || "No"}
                                  onChange={(e) => handleCourseDetailChange(course._id, "labDivision", e.target.value)}
                                  className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      )) : (
                        <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">
                          No courses available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white mb-3">
                    <Users size={16} className="text-indigo-500" /> Available Instructors
                  </h4>

                  {/* "All Instructors" toggle */}
                  <div className="mb-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-200 dark:border-indigo-800 flex items-center">
                    <div
                      onClick={handleAllInstructorsToggle}
                      className={`flex h-5 w-5 items-center justify-center border rounded cursor-pointer transition-colors mr-2 ${formData.allInstructors
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                      {formData.allInstructors && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <label
                      onClick={handleAllInstructorsToggle}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium"
                    >
                      Select All Department Instructors
                    </label>
                  </div>

                  {/* Instructor selection list */}
                  <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {instructors.length > 0 ? instructors.map((instructor) => (
                        <div key={instructor._id} className="flex items-center space-x-2">
                          <div
                            onClick={() => handleInstructorSelection(instructor._id)}
                            className={`flex h-5 w-5 items-center justify-center border rounded cursor-pointer transition-colors ${isInstructorSelected(instructor._id)
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-gray-300 dark:border-gray-600'
                              }`}
                          >
                            {isInstructorSelected(instructor._id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          <label
                            onClick={() => handleInstructorSelection(instructor._id)}
                            className="text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer"
                          >
                            {instructor.fullName}
                          </label>
                        </div>
                      )) : (
                        <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">
                          No instructors available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {selectedForm ? "Update Form" : "Create Form"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreferenceForm;