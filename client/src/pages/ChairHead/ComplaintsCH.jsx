import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  AlertCircle, 
  Check,  
  Clock, 
  Filter, 
  Search, 
  X,
  FileText,
  ThumbsUp,
  ThumbsDown,
  SlidersIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const ComplaintsCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialFetch, setInitialFetch] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    semester: "",
    program: "",
    status: ""
  });
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolveData, setResolveData] = useState({
    status: "Resolved",
    resolveNote: ""
  });
  const [resolveErrors, setResolveErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fixed options for semester and program
  const semesterOptions = ["Regular 1", "Regular 2", "Extension 1", "Extension 2", "Summer"];
  const programOptions = ["Regular", "Extension", "Summer"];
  const statusOptions = ["Pending", "Resolved", "Rejected"];

  // Fetch complaints for chair head with filters
  const fetchComplaints = async () => {
    try {
      if (!filters.year || !filters.semester) {
        toast.error("Year and semester are required");
        return;
      }
      
      setLoading(true);
      
      let queryParams = new URLSearchParams();
      queryParams.append("chair", user.chair);
      queryParams.append("year", filters.year);
      queryParams.append("semester", filters.semester);
      if (filters.program) queryParams.append("program", filters.program);
      if (filters.status) queryParams.append("status", filters.status);
      
      const response = await api.get(`/complaints/search?${queryParams}`);
      setComplaints(response.data);
      setInitialFetch(true);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveInputChange = (e) => {
    const { name, value } = e.target;
    setResolveData({
      ...resolveData,
      [name]: value,
    });
    
    if (resolveErrors[name]) {
      setResolveErrors({
        ...resolveErrors,
        [name]: "",
      });
    }
  };

  const validateResolveForm = () => {
    const errors = {};
    if (!resolveData.resolveNote.trim()) {
      errors.resolveNote = "Please provide a resolution note";
    }
    
    setResolveErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResolveForm()) return;
    
    try {
      setSubmitLoading(true);
      await api.put(`/complaints/${resolvingComplaint._id}/resolve`, {
        resolvedBy: user._id,
        status: resolveData.status,
        resolveNote: resolveData.resolveNote
      });
      
      toast.success(`Complaint ${resolveData.status.toLowerCase()} successfully`);
      setResolvingComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error("Error resolving complaint:", error);
      toast.error("Failed to resolve complaint");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Validate year input to ensure it's a valid number
  const validateYearInput = (e) => {
    const { value } = e.target;
    if (value === "" || /^\d+$/.test(value)) {
      handleFilterChange(e);
    }
  };

  const resetFilters = () => {
    setFilters({
      year: new Date().getFullYear().toString(),
      semester: "",
      program: "",
      status: ""
    });
    setSearchQuery("");
    setComplaints([]);
    setInitialFetch(false);
  };

  const startResolveProcess = (complaint) => {
    setResolvingComplaint(complaint);
    setResolveData({
      status: "Resolved",
      resolveNote: ""
    });
    setResolveErrors({});
  };

  // Apply search filter to already fetched complaints
  const filteredComplaints = complaints.filter(complaint => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const courseMatches = complaint.reportId?.assignments?.some(a => 
        a.courseId?.name?.toLowerCase().includes(query) || 
        a.courseId?.code?.toLowerCase().includes(query)
      );
      const instructorMatches = complaint.instructorId?.fullName?.toLowerCase().includes(query);
      const reasonMatches = complaint.reason?.toLowerCase().includes(query);
      
      return courseMatches || instructorMatches || reasonMatches;
    }
    
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <AlertCircle size={20} className="text-indigo-600" />
            Complaint Management
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({user.chair} Chair)
            </span>
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => fetchComplaints()}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 21h5v-5"></path>
              </svg>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors ${
                Object.values(filters).some(f => f) ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : ""
              }`}
              aria-label="Filters"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg animate-in fade-in-20 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="year"
                  value={filters.year}
                  onChange={validateYearInput}
                  placeholder="Enter year"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                  required
                  maxLength={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program
                </label>
                <select
                  name="program"
                  value={filters.program}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="">All Programs</option>
                  {programOptions.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={fetchComplaints}
                    disabled={loading || !filters.year || !filters.semester}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-colors"
                  >
                    <Search size={16} />
                    Search
                  </button>
                </div>
              </div>
            </div>
            
            {initialFetch && (
              <div className="mt-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by instructor, course or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            )}
            
            {!initialFetch && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  Select academic year and semester and click Search
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Resolve Form Modal */}
        {resolvingComplaint && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Resolve Complaint
                </h3>
                <button
                  onClick={() => setResolvingComplaint(null)}
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-5">
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor</h4>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {resolvingComplaint.instructorId?.fullName || "Unknown"}
                      </p>
                    </div>
                    
                    <div className="mt-2 sm:mt-0">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</h4>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {new Date(resolvingComplaint.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Details</h4>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {resolvingComplaint.reportId?.year} - {resolvingComplaint.reportId?.semester} - {resolvingComplaint.reportId?.program}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Complaint Reason</h4>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {resolvingComplaint.reason}
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleResolveSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Status</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setResolveData({...resolveData, status: "Resolved"})}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            resolveData.status === "Resolved" 
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <ThumbsUp size={16} />
                          Resolve
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setResolveData({...resolveData, status: "Rejected"})}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            resolveData.status === "Rejected" 
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <ThumbsDown size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Note</label>
                      <textarea
                        name="resolveNote"
                        value={resolveData.resolveNote}
                        onChange={handleResolveInputChange}
                        rows={4}
                        className={`w-full rounded-lg border ${resolveErrors.resolveNote ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent`}
                        placeholder="Provide details about how this complaint was resolved or why it was rejected..."
                      ></textarea>
                      {resolveErrors.resolveNote && (
                        <p className="mt-1 text-sm text-red-500">{resolveErrors.resolveNote}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setResolvingComplaint(null)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className={`px-4 py-2 ${
                          resolveData.status === "Resolved" 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-red-600 hover:bg-red-700"
                        } text-white rounded-lg disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                      >
                        {submitLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : resolveData.status === "Resolved" ? "Resolve Complaint" : "Reject Complaint"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Complaints List */}
      <div className="overflow-x-auto">
        {!initialFetch && !loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <SlidersIcon size={20} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Specify search criteria</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select at least the academic year and semester, then click Search
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredComplaints.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolution</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredComplaints.map((complaint) => {
                // Format date
                const submittedDate = new Date(complaint.submittedAt).toLocaleDateString();
                
                // Get status classes
                let statusClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
                if (complaint.status === "Pending") {
                  statusClasses += " bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
                } else if (complaint.status === "Resolved") {
                  statusClasses += " bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
                } else if (complaint.status === "Rejected") {
                  statusClasses += " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
                }
                
                return (
                  <tr key={complaint._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {submittedDate}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-200">
                      <div className="font-medium">
                        {complaint.instructorId?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {complaint.instructorId?.email || "No email"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-200">
                      <div className="font-medium">
                        {complaint.reportId?.year} - {complaint.reportId?.semester}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {complaint.reportId?.program}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs lg:max-w-md truncate" title={complaint.reason}>
                        {complaint.reason}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={statusClasses}>
                        {complaint.status === "Pending" && <Clock size={12} className="mr-1" />}
                        {complaint.status === "Resolved" && <Check size={12} className="mr-1" />}
                        {complaint.status === "Rejected" && <X size={12} className="mr-1" />}
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs truncate" title={complaint.status !== "Pending" ? complaint.resolveNote || "No notes provided" : "Awaiting resolution"}>
                        {complaint.status !== "Pending" ? (
                          complaint.resolveNote || "No notes provided"
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600 italic">Awaiting resolution</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      {complaint.status === "Pending" ? (
                        <button
                          onClick={() => startResolveProcess(complaint)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">Processed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <FileText size={20} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No complaints found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? "Try adjusting your search query" 
                : "There are no complaints for the selected filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsCH;