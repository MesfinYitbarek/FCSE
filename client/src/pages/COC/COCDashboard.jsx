import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  BookOpen,
  Megaphone,
  XCircle,
  Layers
} from "lucide-react";
import api from "@/utils/api";

const COCDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    complaints: { 
      total: 0, 
      resolved: 0, 
      pending: 0, 
      rejected: 0,
      groupedByYearSemester: {} 
    },
    announcements: { total: 0, unread: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch complaints stats
        const complaintsResponse = await api.get('/complaints/stats');
        const complaintsData = complaintsResponse.data;
        
        // Fetch announcements data
        const announcementsResponse = await api.get('/announcements');
        const announcements = announcementsResponse.data;
        
        // Process announcements data
        const totalAnnouncements = announcements.length;
        const unreadAnnouncements = announcements.filter(a => !a.isRead).length;
        
        setStats({
          complaints: {
            total: complaintsData.totalComplaints || 0,
            resolved: complaintsData.resolved || 0,
            pending: complaintsData.pending || 0,
            rejected: complaintsData.rejected || 0,
            groupedByYearSemester: complaintsData.groupedByYearSemester || {}
          },
          announcements: {
            total: totalAnnouncements,
            unread: unreadAnnouncements
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  // Format semester data for display
  const formatSemesterData = () => {
    const semesters = stats.complaints.groupedByYearSemester;
    if (!semesters || Object.keys(semesters).length === 0) {
      return null;
    }

    return Object.entries(semesters).map(([key, data]) => {
      const [year, semester] = key.split('-');
      return (
        <div key={key} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {year} - Semester {semester} ({data.total} complaints)
            </span>
          </div>
          <div className="pl-2">
            {Object.entries(data.programMap).map(([program, count]) => (
              <div key={program} className="flex items-center justify-between py-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{program}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{count}</span>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 dark:bg-indigo-800 rounded-full mb-4"></div>
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={36} className="mx-auto text-red-500 mb-4" />
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName || 'Course Coordinator'}
          </h1>
          <p className="text-indigo-100 mb-6">
            Here's an overview of course operations and current activities
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/complaintsCOC"
              className="inline-flex items-center px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-indigo-700 font-medium transition duration-150 ease-in-out shadow-sm"
            >
              View Complaints
              <ChevronRight size={16} className="ml-1" />
            </Link>
            <Link
              to="/announcementsCOC"
              className="inline-flex items-center px-4 py-2 bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg text-white font-medium transition duration-150 ease-in-out"
            >
              Announcements
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints stat card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Complaints Status</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.complaints.total}</h3>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Resolved</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-300">{stats.complaints.resolved}</p>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                <Clock size={18} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">Pending</p>
                <p className="text-lg font-bold text-orange-800 dark:text-orange-300">{stats.complaints.pending}</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                <XCircle size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">Rejected</p>
                <p className="text-lg font-bold text-red-800 dark:text-red-300">{stats.complaints.rejected}</p>
              </div>
            </div>
          </div>

          {/* Semester-wise complaints */}
          {Object.keys(stats.complaints.groupedByYearSemester).length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={18} className="text-gray-500 dark:text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Complaints by Semester and Program
                </h4>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {formatSemesterData()}
              </div>
            </div>
          )}

          <Link
            to="/complaintsCOC"
            className="mt-5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium inline-flex items-center"
          >
            Manage complaints
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Quick Access card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h3>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/assignments/auto/common" className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 flex items-center justify-center transition-colors">
                <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Common Courses</span>
            </Link>

            <Link to="/assignments/auto/extension" className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 flex items-center justify-center transition-colors">
                <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">Extension</span>
            </Link>

            <Link to="/assignments/auto/summer" className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 group-hover:bg-amber-200 dark:group-hover:bg-amber-800 flex items-center justify-center transition-colors">
                <Calendar size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-300">Summer</span>
            </Link>

            <Link to="/reportsCOC" className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 group-hover:bg-green-200 dark:group-hover:bg-green-800 flex items-center justify-center transition-colors">
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300">Reports</span>
            </Link>
          </div>

          <Link
            to="/announcementsCOC"
            className="mt-4 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                <Megaphone size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-medium text-indigo-800 dark:text-indigo-300">Announcements</span>
            </div>
            {stats.announcements.unread > 0 && (
              <span className="bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-1 rounded-full">
                {stats.announcements.unread} unread
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default COCDashboard;