import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  BookOpen,
  Megaphone,
  Users,
  Circle,
  UserCheck,
  Settings
} from "lucide-react";

const DashboardHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    chairs: { total: 0, active: 0, inactive: 0 },
    positions: { total: 0, filled: 0, vacant: 0 },
    announcements: { total: 0, recent: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock statistics data
        const statsData = {
          users: { total: 150, active: 120, inactive: 30 },
          chairs: { total: 10, active: 8, inactive: 2 },
          positions: { total: 50, filled: 45, vacant: 5 },
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

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
          <div className="h-4 w-36 bg-gray-200 rounded mb-3"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName || 'Head of Faculty'}
          </h1>
          <p className="text-indigo-100 mb-6">
            Here's an overview of faculty operations and current activities
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/users"
              className="inline-flex items-center px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-indigo-700 font-medium transition duration-150 ease-in-out shadow-sm"
            >
              Manage Users
              <ChevronRight size={16} className="ml-1" />
            </Link>
            <Link
              to="/chairs"
              className="inline-flex items-center px-4 py-2 bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg text-white font-medium transition duration-150 ease-in-out"
            >
              Manage Chairs
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users stat card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.users.total}</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users size={24} className="text-indigo-600" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Active Users</span>
                <span className="text-gray-600">{stats.users.active}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(stats.users.active / stats.users.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Inactive Users</span>
                <span className="text-gray-600">{stats.users.inactive}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-300 rounded-full"
                  style={{ width: `${(stats.users.inactive / stats.users.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Link
            to="/users"
            className="mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
          >
            View all users
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Chairs stat card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Chairs</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.chairs.total}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Circle size={24} className="text-orange-600" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-700 font-medium">Active</p>
                <p className="text-lg font-bold text-green-800">{stats.chairs.active}</p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-orange-700 font-medium">Inactive</p>
                <p className="text-lg font-bold text-orange-800">{stats.chairs.inactive}</p>
              </div>
            </div>
          </div>

          <Link
            to="/chairs"
            className="mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
          >
            Manage chairs
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Quick Access card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/users" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                <Users size={20} className="text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">User Management</span>
            </Link>

            <Link to="/chairs" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                <Circle size={20} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Chair Management</span>
            </Link>

            <Link to="/positions" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
                <UserCheck size={20} className="text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">Position Management</span>
            </Link>

            <Link to="/rules" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                <Settings size={20} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Rule Management</span>
            </Link>
          </div>

          <Link
            to="/announcements"
            className="mt-4 flex items-center justify-between p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Megaphone size={18} className="text-indigo-600" />
              </div>
              <span className="font-medium text-indigo-800">Announcements</span>
            </div>
            <span className="bg-indigo-200 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
              {stats.announcements.recent} new
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHF;