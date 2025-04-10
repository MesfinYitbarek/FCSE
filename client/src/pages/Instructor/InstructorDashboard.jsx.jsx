import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  ClipboardList,
  Megaphone,
  TrendingUp
} from "lucide-react";

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    assignments: { total: 0, completed: 0, pending: 0 },
    complaints: { total: 0, resolved: 0, pending: 0 },
    announcements: { total: 0, recent: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock statistics data for instructors
        const statsData = {
          assignments: { total: 10, completed: 7, pending: 3 },
          complaints: { total: 5, resolved: 3, pending: 2 },
          announcements: { total: 8, recent: 3 }
        };

        setStats(statsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate completion percentage
  const calculateCompletion = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-xl shadow-md overflow-hidden">
        <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName || 'Instructor'}
          </h1>
          <p className="text-indigo-100 mb-6">
            Here's an overview of your activities and current tasks
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link
              to="/assignmentsInst"
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 hover:bg-white rounded-lg text-indigo-700 font-medium transition duration-150 ease-in-out shadow-sm text-sm sm:text-base"
            >
              View Assignments
              <ChevronRight size={16} className="ml-1" />
            </Link>
            <Link
              to="/complaintsInst"
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg text-white font-medium transition duration-150 ease-in-out text-sm sm:text-base"
            >
              File Complaint
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Assignments stat card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Assignments</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.assignments.total}</h3>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
              <FileText size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Completed</span>
                <span className="text-gray-600 dark:text-gray-400">{stats.assignments.completed} / {stats.assignments.total}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                  style={{ width: `${calculateCompletion(stats.assignments.completed, stats.assignments.total)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Pending</span>
                <span className="text-gray-600 dark:text-gray-400">{stats.assignments.pending} / {stats.assignments.total}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-300 dark:bg-gray-600 rounded-full"
                  style={{ width: `${calculateCompletion(stats.assignments.pending, stats.assignments.total)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Link
            to="/assignmentsInst"
            className="mt-5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium inline-flex items-center"
          >
            View all assignments
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Complaints stat card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Complaints Status</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.complaints.total}</h3>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
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
          </div>

          <Link
            to="/complaintsInst"
            className="mt-5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium inline-flex items-center"
          >
            Manage complaints
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Quick Access card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h3>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/assignmentsInst" className="flex flex-col items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 flex items-center justify-center transition-colors">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Assignments</span>
            </Link>

            <Link to="/preferencesInst" className="flex flex-col items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-100 dark:bg-purple-900 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 flex items-center justify-center transition-colors">
                <ClipboardList size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">Preferences</span>
            </Link>

            <Link to="/complaintsInst" className="flex flex-col items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 dark:bg-amber-900 group-hover:bg-amber-200 dark:group-hover:bg-amber-800 flex items-center justify-center transition-colors">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-300">Complaints</span>
            </Link>

            <Link to="/reportsInst" className="flex flex-col items-center gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900 group-hover:bg-green-200 dark:group-hover:bg-green-800 flex items-center justify-center transition-colors">
                <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300">Reports</span>
            </Link>
          </div>

          <Link
            to="/announcementsInst"
            className="mt-4 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                <Megaphone size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-medium text-indigo-800 dark:text-indigo-300">Announcements</span>
            </div>
            {stats.announcements.recent > 0 && (
              <span className="bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-1 rounded-full">
                {stats.announcements.recent} new
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;