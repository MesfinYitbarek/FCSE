import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import {
  AlertCircle, CheckCircle, XCircle, Filter,
  Search, Calendar, MessageSquare, User,
  RefreshCw, Eye, BarChart2,
  Clock, CheckSquare, XSquare, AlertTriangle,
  BookOpen, Info, Loader2, ChevronDown, ChevronUp, X
} from "lucide-react";
import { toast } from "react-hot-toast";

const ComplaintsCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    period: "all",
    program: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0
  });
  
  // Track window width for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Calculate statistics whenever complaints change
  useEffect(() => {
    if (complaints && complaints.length) {
      const pending = complaints.filter(c => c.status === "Pending").length;
      const resolved = complaints.filter(c => c.status === "Resolved").length;
      const rejected = complaints.filter(c => c.status === "Rejected").length;

      setStats({
        total: complaints.length,
        pending,
        resolved,
        rejected
      });
    }
  }, [complaints]);

  // Fetch complaints related to this Chair Head's department
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // We're getting all complaints, but we'll filter for the chair's department
      const { data } = await api.get("/complaints");

      // Filter complaints for this chair's department
      const filteredComplaints = data.filter(complaint =>
        complaint.instructorId?.chair === user.chair
      );

      setComplaints(filteredComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Toggle sort order
  const toggleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      period: "all",
      program: "all",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    setSearchQuery("");
  };

  // Calculate date range for filter
  const getDateRange = () => {
    const now = new Date();
    switch (filters.period) {
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
      case "semester":
        const semesterAgo = new Date();
        semesterAgo.setMonth(now.getMonth() - 4);
        return semesterAgo;
      default:
        return new Date(0); // Beginning of time
    }
  };

  // Filtered and sorted complaints
  const filteredComplaints = useMemo(() => {
    const dateRange = getDateRange();

    return complaints
      .filter(complaint => {
        // Filter by search term (instructor name, course, reason)
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const instructorName = complaint.instructorId?.fullName?.toLowerCase() || "";
          const instructorEmail = complaint.instructorId?.email?.toLowerCase() || "";
          const reason = complaint.reason?.toLowerCase() || "";

          if (!instructorName.includes(searchLower) &&
            !instructorEmail.includes(searchLower) &&
            !reason.includes(searchLower)) {
            return false;
          }
        }

        // Filter by status
        if (filters.status !== "all" && complaint.status !== filters.status) {
          return false;
        }

        // Filter by program
        if (filters.program !== "all" && complaint.assignmentId?.program !== filters.program) {
          return false;
        }

        // Filter by time period
        if (filters.period !== "all" && new Date(complaint.createdAt) < dateRange) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort based on selected field
        switch (filters.sortBy) {
          case "createdAt":
            return filters.sortOrder === "asc"
              ? new Date(a.createdAt) - new Date(b.createdAt)
              : new Date(b.createdAt) - new Date(a.createdAt);
          case "instructor":
            const nameA = (a.instructorId?.fullName || "").toLowerCase();
            const nameB = (b.instructorId?.fullName || "").toLowerCase();
            return filters.sortOrder === "asc"
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          case "course":
            const courseA = (a.assignmentId?.courseId?.name || "").toLowerCase();
            const courseB = (b.assignmentId?.courseId?.name || "").toLowerCase();
            return filters.sortOrder === "asc"
              ? courseA.localeCompare(courseB)
              : courseB.localeCompare(courseA);
          default:
            return 0;
        }
      });
  }, [complaints, filters, searchQuery]);

  // View complaint details
  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setRejectionReason(""); // Reset rejection reason
    setResolutionNotes(""); // Reset resolution notes
  };

  // Close complaint modal
  const closeComplaintModal = () => {
    setSelectedComplaint(null);
  };

  // Update complaint status (resolve or reject)
  const handleUpdateStatus = async (complaintId, status) => {
    // Validate input
    if (status === "Rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      const updateData = {
        status,
        resolvedBy: user._id, // Include the resolver's ID
        resolveNote: status === "Resolved" ? resolutionNotes : rejectionReason, // Include the appropriate note
      };

      // Send the update request
      await api.put(`/complaints/${complaintId}`, updateData);

      // Refresh the complaints list
      await fetchComplaints();
      closeComplaintModal();

      // Show success message
      toast.success(
        status === "Resolved"
          ? "Complaint resolved successfully!"
          : "Complaint rejected successfully."
      );
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing complaint:`, error);
      // Handle backend validation errors
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Error ${status.toLowerCase()}ing complaint. Please try again.`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Get unique programs for filter options
  const programOptions = useMemo(() => {
    const programs = new Set(complaints
      .map(c => c.assignmentId?.program)
      .filter(Boolean));
    return Array.from(programs);
  }, [complaints]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-300 dark:border-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border border-red-300 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="mr-1 w-3 h-3" />;
      case "Resolved":
        return <CheckCircle className="mr-1 w-3 h-3" />;
      case "Rejected":
        return <XCircle className="mr-1 w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Department Complaint Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Review and manage instructor complaints for your department
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            </div>
            <MessageSquare className="text-indigo-500 text-xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pending}</p>
            </div>
            <Clock className="text-yellow-500 text-xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.resolved}</p>
            </div>
            <CheckSquare className="text-green-500 text-xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.rejected}</p>
            </div>
            <XSquare className="text-red-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center mb-4">
          <Filter className="text-gray-500 dark:text-gray-400 mr-2 w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Complaints</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full text-base p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Period</label>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="w-full text-base p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="semester">Current Semester</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
            <select
              name="program"
              value={filters.program}
              onChange={handleFilterChange}
              className="w-full text-base p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Programs</option>
              {programOptions.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 dark:text-gray-500 w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search instructor, reason..."
                className="w-full text-base pl-10 p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredComplaints.length} of {complaints.length} complaints
          </p>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <RefreshCw className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="text-gray-500 dark:text-gray-400 mr-2 w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Department Complaints</h2>
          </div>

          <button
            onClick={fetchComplaints}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 p-1"
            aria-label="Refresh complaints"
            title="Refresh complaints"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 text-indigo-500 dark:text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto text-yellow-500 dark:text-yellow-400 w-12 h-12 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No complaints found matching your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800">
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                    onClick={() => toggleSort("instructor")}
                  >
                    <div className="flex items-center">
                      <User className="mr-1 w-4 h-4" /> Instructor
                      {filters.sortBy === "instructor" && (
                        <span className="ml-1">{filters.sortOrder === "asc" ? 
                          <ChevronUp className="w-3 h-3" /> : 
                          <ChevronDown className="w-3 h-3" />}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <BookOpen className="mr-1 w-4 h-4" /> Course & Program
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-1 w-4 h-4" /> Semester/Year
                      {filters.sortBy === "createdAt" && (
                        <span className="ml-1">{filters.sortOrder === "asc" ? 
                          <ChevronUp className="w-3 h-3" /> : 
                          <ChevronDown className="w-3 h-3" />}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    <div className="flex items-center">
                      <Info className="mr-1 w-4 h-4" /> Reason
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {complaint.instructorId?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {complaint.instructorId?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {complaint.assignmentId?.courseId?.name || "Unknown Course"}
                      </div>
                      <div className="text-xs mt-1">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {complaint.assignmentId?.program || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {complaint.assignmentId?.semester || "Unknown"} {complaint.assignmentId?.year || ""}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Submitted: {formatDate(complaint.createdAt).split(',')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {complaint.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusBadge(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewComplaintDetails(complaint)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mr-3"
                        aria-label="View details"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {complaint.status === "Pending" && (
                        <>
                          <button
                            onClick={() => {
                              viewComplaintDetails(complaint);
                              setResolutionNotes("Approved by department chair.");
                            }}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mr-3"
                            aria-label="Resolve complaint"
                            title="Resolve complaint"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => {
                              viewComplaintDetails(complaint);
                              setRejectionReason("The complaint does not meet departmental criteria.");
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            aria-label="Reject complaint"
                            title="Reject complaint"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Complaint Details
              </h3>
              <button
                onClick={closeComplaintModal}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              {/* Complaint Information */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusBadge(selectedComplaint.status)}`}>
                    {getStatusIcon(selectedComplaint.status)}
                    {selectedComplaint.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                    Submitted on {formatDate(selectedComplaint.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Instructor Information</h4>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedComplaint.instructorId?.fullName || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedComplaint.instructorId?.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Department: {selectedComplaint.instructorId?.chair || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Course Information</h4>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedComplaint.assignmentId?.courseId?.name || "Unknown Course"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Program: {selectedComplaint.assignmentId?.program || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Semester: {selectedComplaint.assignmentId?.semester} {selectedComplaint.assignmentId?.year}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Complaint Reason</h4>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedComplaint.reason}
                    </p>
                  </div>
                </div>

                {selectedComplaint.status === "Pending" && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Take Action</h4>

                    <div className="flex flex-col gap-4">
                      {/* Resolve Complaint Section */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h5 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                          <CheckCircle className="mr-1 w-4 h-4" /> Resolve Complaint
                        </h5>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Add resolution notes (optional)"
                          className="w-full text-base p-2 border border-green-300 dark:border-green-700 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                          rows="2"
                        ></textarea>
                        <button
                          onClick={() => handleUpdateStatus(selectedComplaint._id, "Resolved")}
                          disabled={actionLoading}
                          className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition flex items-center justify-center disabled:opacity-60 dark:disabled:opacity-40"
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>Approve & Resolve</>
                          )}
                        </button>
                      </div>

                      {/* Reject Complaint Section */}
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h5 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                          <XCircle className="mr-1 w-4 h-4" /> Reject Complaint
                        </h5>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide reason for rejection (required)"
                          className="w-full text-base p-2 border border-red-300 dark:border-red-700 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                          rows="2"
                          required
                        ></textarea>
                        <button
                          onClick={() => handleUpdateStatus(selectedComplaint._id, "Rejected")}
                          disabled={actionLoading || !rejectionReason.trim()}
                          className={`mt-2 px-4 py-2 rounded-md transition flex items-center justify-center ${!rejectionReason.trim()
                              ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>Reject Complaint</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsCH;