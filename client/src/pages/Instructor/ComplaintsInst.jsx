import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Send, 
  Clock, 
  Filter,
  RefreshCw,
  Calendar,
  AlignLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const ComplaintsInst = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ assignmentId: "", reason: "" });
  const [loading, setLoading] = useState({
    assignments: false,
    complaints: false,
    submit: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    status: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchComplaints();
  }, []);

  const fetchAssignments = async () => {
    setLoading(prev => ({ ...prev, assignments: true }));
    try {
      const { data } = await api.get(`/assignments/get/${user._id}`);
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  };

  const fetchComplaints = async () => {
    setLoading(prev => ({ ...prev, complaints: true }));
    setError(null);
    try {
      const { data } = await api.get(`/complaints/${user._id}`);
      setComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, complaints: false }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.assignmentId) {
      toast.error("Please select an assignment");
      return;
    }
    
    if (!form.reason || form.reason.trim().length < 10) {
      toast.error("Please provide a detailed reason for your complaint (minimum 10 characters)");
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    setError(null);
    setSuccess(null);

    try {
      await api.post("/complaints", { instructorId: user._id, ...form });
      await fetchComplaints();
      setForm({ assignmentId: "", reason: "" });
      setSuccess("Complaint submitted successfully!");
      toast.success("Complaint submitted successfully");
    } catch (err) {
      console.error("Error submitting complaint:", err);
      setError("Error submitting complaint: " + (err.response?.data?.message || "Unknown error"));
      toast.error("Failed to submit complaint");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Filter complaints based on status
  const filteredComplaints = complaints.filter(complaint => {
    if (filters.status === "all") return true;
    return complaint.status === filters.status;
  });

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-6">
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FileText className="text-indigo-600 " size={24} />
              File a Complaint
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Submit and track complaints about your course assignments
            </p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors"
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Filter Complaints"}
          </button>
        </div>

        {/* Notification messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-indigo-700 dark:text-red-300"
            >
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-indigo-700 dark:text-red-300 hover:text-indigo-900 dark:hover:text-red-100"
              >
                &times;
              </button>
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center text-green-700 dark:text-green-300"
            >
              <CheckCircle size={20} className="mr-2 flex-shrink-0" />
              <p>{success}</p>
              <button 
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complaint submission form */}
        <motion.div 
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Send className="text-indigo-600 dark:text-red-400" size={20} />
            Submit a New Complaint
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="assignmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                Select Course Assignment
              </label>
              <select
                id="assignmentId"
                name="assignmentId"
                value={form.assignmentId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-red-600 focus:border-indigo-500 dark:focus:border-red-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                disabled={loading.assignments || loading.submit}
                required
              >
                <option value="">-- Select an Assignment --</option>
                {loading.assignments ? (
                  <option value="" disabled>Loading assignments...</option>
                ) : assignments.length === 0 ? (
                  <option value="" disabled>No assignments available</option>
                ) : (
                  assignments.map((assignment) => (
                    <option key={assignment._id} value={assignment._id}>
                      {assignment.courseId?.name} ({assignment.courseId?.code}) - {assignment.year}, {assignment.semester}, {assignment.program}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <AlignLeft size={16} className="text-gray-500 dark:text-gray-400" />
                Complaint Reason
              </label>
              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Provide a detailed explanation of your complaint..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-red-600 focus:border-indigo-500 dark:focus:border-red-600 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                disabled={loading.submit}
                required
                minLength={10}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please be specific about your concerns to help us resolve them effectively.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading.submit}
                className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {loading.submit ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Filter section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                  Filter Complaints
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 outline-none transition dark:bg-gray-700 dark:text-white text-base"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ status: "all" })}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium flex items-center gap-1"
                  >
                    <RefreshCw size={14} />
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complaints List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 dark:bg-red-700 text-white rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText size={18} />
              My Complaints
            </h2>
            <button
              onClick={fetchComplaints}
              className="text-sm bg-white/20 hover:bg-white/30 p-1.5 rounded-md transition-colors flex items-center gap-1"
              disabled={loading.complaints}
            >
              <RefreshCw size={14} className={loading.complaints ? "animate-spin" : ""} />
              <span className="sr-only sm:not-sr-only">Refresh</span>
            </button>
          </div>
          
          {loading.complaints ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-red-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">Loading complaints...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-indigo-500 dark:text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load complaints</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={fetchComplaints}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                Retry
              </button>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center p-12">
              <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No complaints found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {filters.status !== "all" 
                  ? `You don't have any complaints with "${filters.status}" status.`
                  : "You haven't submitted any complaints yet."}
              </p>
              {filters.status !== "all" && (
                <button 
                  onClick={() => setFilters({ status: "all" })}
                  className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  <RefreshCw size={14} className="inline mr-1" />
                  Show All Complaints
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile view - cards */}
              <div className="sm:hidden space-y-4 p-4">
                {filteredComplaints.map((complaint) => (
                  <div 
                    key={complaint._id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                          {complaint.assignmentId?.courseId?.name || "N/A"}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {complaint.assignmentId?.courseId?.code || "N/A"}
                        </span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                        ${complaint.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300' : 
                          complaint.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 
                          'bg-red-100 dark:bg-red-900/40 text-indigo-800 dark:text-red-300'}`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    
                    <div className="my-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
                      {complaint.reason}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Submitted On:</span>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {complaint.status === 'resolved' || complaint.status === 'rejected' ? (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Resolved By:</span>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {complaint.resolvedBy?.fullName || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Resolution Note:</span>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {complaint.resolveNote || "No note provided"}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                          <Clock size={16} className="mr-1" />
                          <span>Awaiting resolution</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop view - table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Complaint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Resolution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredComplaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-indigo-600 dark:text-red-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {complaint.assignmentId?.courseId?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {complaint.assignmentId?.courseId?.code || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {complaint.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${complaint.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300' : 
                              complaint.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 
                              'bg-red-100 dark:bg-red-900/40 text-indigo-800 dark:text-red-300'}`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {complaint.status === 'pending' ? (
                            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                              <Clock size={16} className="mr-1" />
                              <span>Pending</span>
                            </div>
                          ) : (
                            <>
                              <div><span className="font-medium">By:</span> {complaint.resolvedBy?.fullName || "N/A"}</div>
                              <div className="mt-1 text-xs max-w-xs truncate">
                                <span className="font-medium">Note:</span> {complaint.resolveNote || "No note provided"}
                              </div>
                            </>
                          )}
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
    </div>
  );
};

export default ComplaintsInst;