// PreferenceForm.jsx
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
  Loader,
  Info,
  Check
} from 'lucide-react';

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
  });
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  
  // Filter states
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterSemester, setFilterSemester] = useState("");
  const [filterChair, setFilterChair] = useState(user.chair);
  const [isFiltered, setIsFiltered] = useState(false);
  const [chairs, setChairs] = useState([]);

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
    
    if (user.role === "admin") {
      fetchChairs();
    }
  }, [user.role]);

  // Fetch courses and instructors on component mount
  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchPreferenceForms = async () => {
    setFetchingData(true);
    try {
      const { data } = await api.get(
        `/preference-forms/filter?year=${filterYear}&semester=${filterSemester}&chair=${filterChair}`
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

  const fetchCourses = async () => {
    try {
      const { data } = await api.get(`/courses/${filterChair || user.chair}`);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
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

  // Handle course selection
  const handleCourseSelection = (courseId) => {
    const updatedCourses = formData.courses.includes(courseId)
      ? formData.courses.filter((id) => id !== courseId)
      : [...formData.courses, courseId];
    setFormData({ ...formData, courses: updatedCourses });
  };

  // Handle instructor selection
  const handleInstructorSelection = (instructorId) => {
    const updatedInstructors = formData.instructors.includes(instructorId)
      ? formData.instructors.filter((id) => id !== instructorId)
      : [...formData.instructors, instructorId];
    setFormData({ ...formData, instructors: updatedInstructors });
  };

  // Reset filters
  const resetFilters = () => {
    setFilterYear(new Date().getFullYear());
    setFilterSemester("");
    setFilterChair(user.chair);
    setIsFiltered(false);
  };

  // Handle creating or updating a preference form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedForm) {
        await api.put(`/preference-forms/${selectedForm._id}`, formData);
      } else {
        await api.post("/preference-forms", { ...formData, chair: filterChair || user.chair });
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
      });
      setSelectedForm(null);
      
      // Refresh the list with current filters
      if (isFiltered) {
        fetchPreferenceForms();
      }
    } catch (error) {
      console.error("Error saving preference form:", error);
    }
    setLoading(false);
  };

  // Open edit modal and pre-fill form
  const openEditFormModal = (form) => {
    setSelectedForm(form);
    setFormData({
      year: form.year,
      semester: form.semester,
      maxPreferences: form.maxPreferences,
      submissionStart: form.submissionStart,
      submissionEnd: form.submissionEnd,
      courses: form.courses.map(course => course._id || course),
      instructors: form.instructors.map(instructor => instructor._id || instructor),
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
    } catch (error) {
      console.error("Error deleting preference form:", error);
    }
    setLoading(false);
  };

  // Handle search button click
  const handleSearch = () => {
    fetchPreferenceForms();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">Course Preference Forms</h1>
        <p className="text-gray-600 dark:text-gray-300">Create and manage preference forms for instructors to submit their course preferences.</p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border-l-4 border-blue-500 rounded-lg shadow-sm p-4 lg:p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white mb-4">
          <Filter size={18} className="text-blue-500" /> Filter Preference Forms
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
            <div className="relative">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
            <div className="relative">
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Semesters</option>
                <option value="Regular 1">Regular 1</option>
                <option value="Regular 2">Regular 2</option>
                <option value="Summer">Summer</option>
                <option value="Extension">Extension</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
          
          {user.role === "admin" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <div className="relative">
                <select
                  value={filterChair}
                  onChange={(e) => setFilterChair(e.target.value)}
                  className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
            >
              {fetchingData ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Search
            </button>
            
            <button 
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} />
              Reset
            </button>
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
            });
            setOpenModal(true);
          }}
          className="w-full sm:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus size={16} /> Create Preference Form
        </button>
        
        {isFiltered && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
            Found {preferenceForms.length} forms
          </span>
        )}
      </div>

      {/* Preference Forms List */}
      {isFiltered && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          {fetchingData ? (
            <div className="flex justify-center items-center p-12">
              <Loader size={24} className="animate-spin text-blue-500" />
            </div>
          ) : preferenceForms.length > 0 ? (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                {preferenceForms.map((form) => {
                  const now = new Date();
                  const startDate = new Date(form.submissionStart);
                  const endDate = new Date(form.submissionEnd);
                  let status = "Upcoming";
                  let statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
                  
                  if (now > endDate) {
                    status = "Closed";
                    statusClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                  } else if (now >= startDate) {
                    status = "Active";
                    statusClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
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
                          className="flex-1 flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 py-2 px-3 rounded-md text-sm transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteFormModal(form)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 py-2 px-3 rounded-md text-sm transition-colors"
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
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
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
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                    {preferenceForms.map((form) => {
                      const now = new Date();
                      const startDate = new Date(form.submissionStart);
                      const endDate = new Date(form.submissionEnd);
                      let status = "Upcoming";
                      let statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
                      
                      if (now > endDate) {
                        status = "Closed";
                        statusClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                      } else if (now >= startDate) {
                        status = "Active";
                        statusClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
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
                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {selectedForm ? "Edit Preference Form" : "Create Preference Form"}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={() => setOpenModal(false)}
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
                      min={currentYear - 2}
                      max={currentYear + 2}
                      required
                      className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="Regular 1">Regular 1</option>
                        <option value="Regular 2">Regular 2</option>
                        <option value="Summer">Summer</option>
                        <option value="Extension">Extension</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
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
                      max={10}
                      required
                      className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 md:col-span-3 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submission Start Date</label>
                    <input
                      type="datetime-local"
                      name="submissionStart"
                      value={formData.submissionStart}
                      onChange={handleChange}
                      required
                      className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 md:col-span-3 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submission End Date</label>
                    <input
                      type="datetime-local"
                      name="submissionEnd"
                      value={formData.submissionEnd}
                      onChange={handleChange}
                      required
                      className="block w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                <hr className="my-6 border-gray-200 dark:border-slate-700" />
                
                <div className="mb-6">
                  <h4 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white mb-3">
                    <Book size={16} className="text-blue-500" /> Available Courses
                  </h4>
                  <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {courses.length > 0 ? courses.map((course) => (
                        <div key={course._id} className="flex items-center space-x-2">
                          <div 
                            onClick={() => handleCourseSelection(course._id)}
                            className={`flex h-5 w-5 items-center justify-center border rounded cursor-pointer transition-colors ${
                              formData.courses.includes(course._id) 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {formData.courses.includes(course._id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          <label
                            onClick={() => handleCourseSelection(course._id)}
                            className="text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer"
                          >
                            {course.name}
                          </label>
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
                    <Users size={16} className="text-blue-500" /> Available Instructors
                  </h4>
                  <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {instructors.length > 0 ? instructors.map((instructor) => (
                        <div key={instructor._id} className="flex items-center space-x-2">
                          <div 
                            onClick={() => handleInstructorSelection(instructor._id)}
                            className={`flex h-5 w-5 items-center justify-center border rounded cursor-pointer transition-colors ${
                              formData.instructors.includes(instructor._id) 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {formData.instructors.includes(instructor._id) && (
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
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader size={16} className="animate-spin" />
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