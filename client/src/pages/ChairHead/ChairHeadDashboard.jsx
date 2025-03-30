import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CheckCircle,
  TrendingUp,
  Clock,
  ChevronRight,
  BookOpen,
  Megaphone,
  Users,
  ClipboardList
} from "lucide-react";
import api from "@/utils/api";

const ChairHeadDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    courses: { total: 0, assigned: 0, unassigned: 0 },
    instructors: { total: 0, active: 0, inactive: 0 },
    complaints: { total: 0, resolved: 0, pending: 0 },
    announcements: { total: 0, recent: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const chair = user?.chair;

        const [coursesRes, instructorsRes, announcementsRes] = await Promise.all([
          api.get(`/courses/${chair}`),
          api.get(`/instructors/chair/${chair}`),
          api.get(`/announcements/publisher`)
        ]);

        const courses = coursesRes.data;
        const instructors = instructorsRes.data;
        const announcements = announcementsRes.data;

        setStats({
          courses: { total: courses.length, assigned: courses.filter(c => c.assigned).length, unassigned: courses.filter(c => !c.assigned).length },
          instructors: { total: instructors.length, active: instructors.filter(i => i.active).length, inactive: instructors.filter(i => !i.active).length },
          announcements: { total: announcements.length, recent: announcements.length }
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  // Calculate completion percentage
  const calculateCompletion = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName || 'Chair Head'}
          </h1>
          <p className="text-indigo-100 mb-6">
            Here's an overview of your department's operations and current activities
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-indigo-700 font-medium transition duration-150 ease-in-out shadow-sm"
            >
              Manage Courses
              <ChevronRight size={16} className="ml-1" />
            </Link>
            <Link
              to="/instructorManagement"
              className="inline-flex items-center px-4 py-2 bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg text-white font-medium transition duration-150 ease-in-out"
            >
              Manage Instructors
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Courses stat card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Courses</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.courses.total}</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BookOpen size={24} className="text-indigo-600" />
            </div>
          </div>
          <Link
            to="/courses"
            className="mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
          >
            View all courses
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Instructors stat card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Instructors</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.instructors.total}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
          <Link
            to="/instructorManagement"
            className="mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
          >
            Manage instructors
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Quick Access card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/courses" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                <BookOpen size={20} className="text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Courses</span>
            </Link>

            <Link to="/instructorManagement" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                <Users size={20} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Instructors</span>
            </Link>

            <Link to="/preferencesForm" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                <ClipboardList size={20} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Preferences</span>
            </Link>

            <Link to="/reportsCH" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors group">
              <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
                <TrendingUp size={20} className="text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">Reports</span>
            </Link>
          </div>

          <Link
            to="/announcementsCH"
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

export default ChairHeadDashboard;