import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import {
  ChevronRight,
  Megaphone,
  Users,
  Circle,
  UserCheck,
  Settings,
  AlertTriangle,
  UserCircle,
  MapPin,
  Award
} from "lucide-react";

const DashboardHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      byRole: [],
      byChair: [],
      byRank: [],
      byLocation: []
    },
    chairs: {
      total: 0,
      details: []
    },
    announcements: { 
      total: 0, 
      recent: 0, 
      unread: 0 
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [userStatsResponse, chairStatsResponse, announcementsResponse] = await Promise.all([
          api.get("/users/statics"),
          api.get("/chairs/statics"),
          api.get("/announcements")
        ]);

        // Process users statistics
        const userStats = userStatsResponse.data;

        // Process chair statistics
        const chairStats = chairStatsResponse.data;
        
        // Process announcements data
        const announcements = announcementsResponse.data;
        const currentDate = new Date();
        // Consider announcements from the last 7 days as recent
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentAnnouncements = announcements.filter(
          announcement => new Date(announcement.publishedAt) >= sevenDaysAgo
        );

        const unreadAnnouncements = announcements.filter(
          announcement => !announcement.isRead
        );

        // Update state with real data
        setStats({
          users: {
            total: userStats.totalUsers,
            byRole: userStats.usersByRole,
            byChair: userStats.usersByChair,
            byRank: userStats.usersByRank,
            byLocation: userStats.usersByLocation
          },
          chairs: {
            total: chairStats.totalChairs,
            details: chairStats.chairsWithCourseCounts
          },
          announcements: {
            total: announcements.length,
            recent: recentAnnouncements.length,
            unread: unreadAnnouncements.length
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to get top 3 items from a distribution array
  const getTopItems = (items) => {
    if (!items || !items.length) return [];
    return [...items]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => ({
        name: item._id || 'Not specified',
        count: item.count
      }));
  };

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

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-xl shadow-sm">
          <AlertTriangle size={36} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get top items for distribution displays
  const topRoles = getTopItems(stats.users.byRole);
  const topLocations = getTopItems(stats.users.byLocation);
  const topRanks = getTopItems(stats.users.byRank);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users stat card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.users.total}</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users size={24} className="text-indigo-600" />
            </div>
          </div>

          {/* User distribution by role */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <UserCircle size={16} className="mr-1 text-indigo-500" />
              Distribution by Role
            </h4>
            <div className="space-y-2">
              {topRoles.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{role.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-800 mr-2">{role.count}</span>
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(role.count / stats.users.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
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
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Chairs</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.chairs.total}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Circle size={24} className="text-orange-600" />
            </div>
          </div>

          {/* Chair listing */}
          <div className="mt-4 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Chair Overview</h4>
            <div className="space-y-2">
              {stats.chairs.details.slice(0, 5).map((chair, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{chair.name || 'Unnamed Chair'}</span>
                  
                </div>
              ))}
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

        {/* User Demographics card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award size={18} className="mr-2 text-purple-600" />
            Faculty Demographics
          </h3>

          {/* By Rank */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Award size={14} className="mr-1 text-purple-500" />
              By Rank
            </h4>
            <div className="space-y-1">
              {topRanks.map((rank, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: ['#818CF8', '#A78BFA', '#C084FC'][index] }}></span>
                  <span className="text-gray-600 flex-grow">{rank.name}</span>
                  <span className="font-medium">{rank.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Location */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin size={14} className="mr-1 text-red-500" />
              By Location
            </h4>
            <div className="space-y-1">
              {topLocations.map((location, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: ['#F87171', '#FB923C', '#FBBF24'][index] }}></span>
                  <span className="text-gray-600 flex-grow">{location.name}</span>
                  <span className="font-medium">{location.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access row */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          to="/announcementsView"
          className="mt-4 flex items-center justify-between p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Megaphone size={18} className="text-indigo-600" />
            </div>
            <span className="font-medium text-indigo-800">Announcements</span>
          </div>
          <div className="flex gap-2">
            {stats.announcements.recent > 0 && (
              <span className="bg-indigo-200 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                {stats.announcements.recent} new
              </span>
            )}
            {stats.announcements.unread > 0 && (
              <span className="bg-purple-200 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                {stats.announcements.unread} unread
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHF;