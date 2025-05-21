import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Home,
  Book,
  TrendingUp,
  Bell,
  LogOut,
  Menu,
  X,
  FileText,
  Megaphone,
  ClipboardList,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  PieChart,
  Database,
  ChevronLeft
} from "lucide-react";
import api from "../utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    courses: true,
    assignments: true,
    reports: true,
    preferences: true,
    management: true
  });
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activePath, setActivePath] = useState("");

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);

// In Layout.jsx, find the useEffect for session expiration and update it:

useEffect(() => {
  // Event listener for session expiration
  const handleSessionExpired = () => {
    console.log("Session expired event received. Logging out...");
    
    // Clear any user data from the Redux store
    dispatch(logout());
    
    // Redirect to login page
    navigate("/");
    
    // Show a persistent notification to explain what happened
    toast.error(
      "Your session has expired due to inactivity. Please log in again to continue.",
      { duration: 5000, id: "session-expired-detail" }
    );
  };

  // Add event listener
  window.addEventListener('sessionExpired', handleSessionExpired);

  // Clean up event listener on component unmount
  return () => {
    window.removeEventListener('sessionExpired', handleSessionExpired);
  };
}, [dispatch, navigate]);

  
  // Fetch announcements for the current user's role
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements');
        const now = new Date();

        // Filter announcements that are still valid AND not already read
        const validAnnouncements = response.data.filter(ann =>
          (!ann.validUntil || new Date(ann.validUntil) > now) &&
          !ann.isRead
        );

        setAnnouncements(validAnnouncements);

        // Calculate unread count
        setUnreadCount(validAnnouncements.length);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();

    // Poll every 5 minutes
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.role, user?.chair]);


  // Track active path for sidebar highlights
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  // Check window width for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }

      if (isNotificationOpen && notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }

      if (windowWidth < 1024 && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen, isNotificationOpen, isSidebarOpen, windowWidth]);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Password strength checker
  useEffect(() => {
    if (!passwordData.newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (passwordData.newPassword.length >= 8) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(passwordData.newPassword)) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(passwordData.newPassword)) strength += 1;
    // Contains number
    if (/[0-9]/.test(passwordData.newPassword)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(passwordData.newPassword)) strength += 1;

    setPasswordStrength(strength);
  }, [passwordData.newPassword]);

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (passwordStrength < 3) {
      errors.newPassword = "Password is too weak";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/users/change-password', {
        userId: user._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success("Password changed successfully!");
      setIsChangePasswordOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      if (error.response?.data?.message === "Current password is incorrect") {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: "Current password is incorrect"
        }));
      } else {
        toast.error("Failed to change password. Please try again.");
      }
      console.error("Password change error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleNotificationClick = async (announcement) => {
    try {
      // Mark announcement as read if not already read
      if (!announcement.isRead) {
        await api.post(`/announcements/${announcement._id}/read`);

        // Update local state
        setAnnouncements(prev =>
          prev.map(ann =>
            ann._id === announcement._id ? { ...ann, isRead: true } : ann
          )
        );

        setUnreadCount(prev => prev - 1);
      }

      // Navigate to announcements page with the clicked announcement highlighted
      navigate(user.role == "Instructor" ? `/announcementsInst` : user.role == "HeadOfFaculty" ? "/announcementsView" : user.role == "COC" ? "/announcementsViewByCOC" : "/announcementsViewByCH", { state: { highlightId: announcement._id } });
      setIsNotificationOpen(false);
    } catch (error) {
      console.error("Error handling announcement click:", error);
    }
  };

  const markAllAnnouncementsAsRead = async () => {
    try {
      // Mark all announcements as read
      await Promise.all(
        announcements
          .filter(ann => !ann.isRead)
          .map(ann => api.post(`/announcements/${ann._id}/read`))
      );

      // Update local state
      setAnnouncements(prev =>
        prev.map(ann => ({ ...ann, isRead: true }))
      );

      setUnreadCount(0);
      toast.success("All announcements marked as read");
    } catch (error) {
      console.error("Error marking all announcements as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  //sidebar styles
  const navItemClass = `flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all font-medium text-gray-300 hover:bg-gray-700 hover:text-white group`;
  const navGroupClass = `flex items-center justify-between gap-2 py-2.5 px-4 rounded-lg transition-all font-medium text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer group`;
  const subNavItemClass = `flex items-center gap-3 py-2 px-4 ml-6 rounded-lg transition-all font-medium text-gray-400 hover:bg-gray-700 hover:text-white`;
  const activeNavItemClass = `bg-gray-700 text-white border-l-4 border-indigo-500`;

  const sidebarVariants = {
    open: {
      width: windowWidth < 1024 ? "240px" : "260px", // Reduced from 280px/300px
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    closed: {
      width: windowWidth < 1024 ? "0" : "80px",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${navItemClass} ${isActive ? activeNavItemClass : ""}`
      }
      onClick={() => windowWidth < 1024 && setIsSidebarOpen(false)}
    >
      <div className={`p-1.5 rounded-lg group-hover:bg-gray-600 ${activePath === to ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400"}`}>
        <Icon size={18} className="flex-shrink-0" />
      </div>
      {isSidebarOpen && <span className="truncate">{children}</span>}
    </NavLink>
  );

  const SubNavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${subNavItemClass} ${isActive ? activeNavItemClass : ""}`
      }
      onClick={() => windowWidth < 1024 && setIsSidebarOpen(false)}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-indigo-400"></div>
      {isSidebarOpen && <span className="truncate">{children}</span>}
    </NavLink>
  );

  const NavGroup = ({ title, icon: Icon, expanded, onToggle, children }) => (
    <div className="space-y-1">
      <button
        className={navGroupClass}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg group-hover:bg-gray-600 ${expanded ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400"}`}>
            <Icon size={18} className="flex-shrink-0" />
          </div>
          {isSidebarOpen && <span className="truncate">{title}</span>}
        </div>
        {isSidebarOpen && (
          expanded ? <ChevronDown size={16} className="text-gray-400 group-hover:text-white" />
            : <ChevronRight size={16} className="text-gray-400 group-hover:text-white" />
        )}
      </button>

      {isSidebarOpen && expanded && (
        <div className="mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="divide-y divide-gray-200">
      {announcements.length > 0 ? (
        <>
          <div className="p-3 flex justify-between items-center border-b">
            <h3 className="text-sm font-semibold text-gray-900">
              Announcements
              {unreadCount > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <button
              onClick={markAllAnnouncementsAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {announcements.map((announcement) => {
              const isExpired = new Date(announcement.validUntil) < new Date();

              return (
                <button
                  key={announcement._id}
                  onClick={() => handleNotificationClick(announcement)}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${announcement.read ? "opacity-75" : "bg-indigo-50/50"
                    } ${isExpired ? "bg-gray-100" : ""}`}
                  disabled={isExpired}
                >
                  <div className={`mt-1 rounded-full p-2 ${isExpired ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-blue-600"
                    }`}>
                    <Megaphone size={16} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium ${isExpired ? "text-gray-500" : "text-gray-900"
                        }`}>
                        {announcement.title}
                      </p>
                      {isExpired && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {dayjs(announcement.publishedAt).fromNow()}
                      {announcement.validUntil && (
                        <span className="ml-2">
                          · Valid until: {dayjs(announcement.validUntil).format('MMM D, YYYY')}
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-1 line-clamp-2 ${isExpired ? "text-gray-500" : "text-gray-700"
                      }`}>
                      {announcement.message}
                    </p>
                  </div>
                  {!announcement.read && !isExpired && (
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Bell size={20} className="text-gray-500" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
          <p className="mt-1 text-sm text-gray-500">You'll see announcements here when they appear.</p>
        </div>
      )}
    </div>
  );

  const renderNavItems = () => {
    switch (user?.role) {
      case "HeadOfFaculty":
        return (
          <>
            <NavItem to="/dashboard" icon={PieChart}>Dashboard</NavItem>

            <NavGroup
              title="Management"
              icon={Database}
              expanded={expandedGroups.management}
              onToggle={() => toggleGroup('management')}
            >
              <SubNavItem to="/users">User Management</SubNavItem>
              <SubNavItem to="/coursesHF">Course Management</SubNavItem>
              <SubNavItem to="/chairs">Chair Management</SubNavItem>
              <SubNavItem to="/positions">Position Management</SubNavItem>
              <SubNavItem to="/rules">Rule Management</SubNavItem>
              <SubNavItem to="/weights">Weight Management</SubNavItem>
            </NavGroup>
            <NavItem to="/reports" icon={Megaphone}>Reports</NavItem>
            <NavItem to="/announcementsView" icon={Megaphone}>View Announcements</NavItem>
            <NavItem to="/announcementsHF" icon={Megaphone}>Manage Announcements</NavItem>
          </>
        );

      case "ChairHead":
        return (
          <>
            <NavItem to="/dashboard" icon={PieChart}>Dashboard</NavItem>

            <NavGroup
              title="Academic Management"
              icon={Book}
              expanded={expandedGroups.courses}
              onToggle={() => toggleGroup('courses')}
            >
              <SubNavItem to="/courses">Course Management</SubNavItem>
              <SubNavItem to="/instructorManagement">Instructor Management</SubNavItem>
            </NavGroup>

            <NavGroup
              title="Preferences"
              icon={ClipboardList}
              expanded={expandedGroups.preferences}
              onToggle={() => toggleGroup('preferences')}
            >
              <SubNavItem to="/preferencesForm">Preference Management</SubNavItem>
              <SubNavItem to="/preferences">Instructor Preference</SubNavItem>
            </NavGroup>

            <NavItem to="/assignments/auto/regular" icon={FileSpreadsheet}>Regular Assignment</NavItem>
            <NavItem to="/complaintsCH" icon={AlertTriangle}>Complaints</NavItem>
            <NavItem to="/reportsCH" icon={TrendingUp}>Reports</NavItem>
            <NavItem to="/announcementsCH" icon={Megaphone}>Manage Announcements</NavItem>
            <NavItem to="/announcementsViewByCH" icon={Megaphone}>View Announcements</NavItem>
          </>
        );

      case "COC":
        return (
          <>
            <NavItem to="/dashboard" icon={PieChart}>Dashboard</NavItem>
            <NavItem to="/coursesCOC" icon={AlertTriangle}>Course Management</NavItem>
            <NavGroup
              title="Course Assignments"
              icon={FileSpreadsheet}
              expanded={expandedGroups.assignments}
              onToggle={() => toggleGroup('assignments')}
            >
              <SubNavItem to="/assignments/auto/common">Common Courses</SubNavItem>
              <SubNavItem to="/assignments/auto/extension">Extension Courses</SubNavItem>
              <SubNavItem to="/assignments/auto/summer">Summer Courses</SubNavItem>
            </NavGroup>

            <NavItem to="/complaintsCOC" icon={AlertTriangle}>Complaints</NavItem>
            <NavItem to="/reportsCOC" icon={TrendingUp}>Reports</NavItem>
            <NavItem to="/announcementsCOC" icon={Megaphone}>Manage Announcements</NavItem>
            <NavItem to="/announcementsViewByCOC" icon={Megaphone}>View Announcements</NavItem>
          </>
        );

      case "Instructor":
        return (
          <>
            <NavItem to="/dashboard" icon={PieChart}>Dashboard</NavItem>
            <NavItem to="/preferencesInst" icon={ClipboardList}>Submit Preferences</NavItem>
            <NavItem to="/reportsInst" icon={FileText}>My Assignments</NavItem>
            <NavItem to="/complaintsInst" icon={AlertTriangle}>File Complaint</NavItem>
            <NavItem to="/announcementsInst" icon={Megaphone}>Announcements</NavItem>
            <NavItem to="/reportInst" icon={TrendingUp}>Reports</NavItem>
          </>
        );

      default:
        return (
          <>
            <NavItem to="/dashboard" icon={PieChart}>Dashboard</NavItem>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans antialiased">
      {/* Mobile sidebar overlay */}
      {windowWidth < 1024 && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Updated with dark theme */}
      <motion.aside
        ref={sidebarRef}
        initial={windowWidth < 1024 ? "closed" : "open"}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed left-0 top-0 h-full bg-gray-900 shadow-lg z-30 overflow-hidden ${windowWidth < 1024 && !isSidebarOpen ? "w-0" : ""
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {isSidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">FCSE COSystem</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    {user?.role === "HeadOfFaculty" ? "Head of Faculty" :
                      user?.role === "ChairHead" ? "Chair Head" :
                        user?.role === "COC" ? "COC" : "Instructor"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg text-white mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            )}
            {windowWidth >= 1024 && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isSidebarOpen ? (
                  <ChevronLeft size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {renderNavItems()}
          </nav>

          {/* Sidebar footer */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white truncate">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 ${windowWidth >= 1024
          ? (isSidebarOpen ? "ml-[260px]" : "ml-[80px]") // Changed from ml-[290px]
          : "ml-0"
          }`}
      >
        {/* Top navigation bar */}
        <header className="bg-white shadow-sm h-16 fixed top-0 right-0 z-10 w-full border-b border-gray-200">
          <div className={`flex items-center justify-between h-full px-4 md:px-6 ${windowWidth >= 1024
            ? (isSidebarOpen ? "ml-[260px]" : "ml-[80px]") // Changed from ml-[300px]
            : "ml-0"
            } transition-all duration-300`}>
            {/* Mobile menu button */}
            {windowWidth < 1024 && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Menu size={22} />
              </button>
            )}

            {/* breadcrumbs */}
            <div className="mb-6 mt-10 hidden md:block">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2">
                  <li className="inline-flex items-center">
                    <NavLink to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600">
                      <Home size={16} className="mr-2" />
                      Dashboard
                    </NavLink>
                  </li>
                  {location.pathname !== '/dashboard' && (
                    <li>
                      <div className="flex items-center">
                        <ChevronRight size={16} className="text-gray-400" />
                        <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2 capitalize">
                          {location.pathname.split('/').filter(Boolean).pop()}
                        </span>
                      </div>
                    </li>
                  )}
                </ol>
              </nav>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg shadow-lg bg-white border z-30"
                    >
                      {renderNotifications()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    if (isNotificationOpen) setIsNotificationOpen(false);
                  }}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="User profile"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                  {windowWidth >= 1024 && (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border z-30"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user?.fullName || "User"}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || "user@example.com"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">

                        <button
                          onClick={() => {
                            setIsChangePasswordOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <Lock size={16} />
                          <span>Change Password</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Change Password Modal */}
        <AnimatePresence>
          {isChangePasswordOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsChangePasswordOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6 mx-4"
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                  <button
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitPasswordChange}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2.5 border ${passwordErrors.currentPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                            } rounded-lg focus:ring-2 focus:border-transparent`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2.5 border ${passwordErrors.newPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                            } rounded-lg focus:ring-2 focus:border-transparent`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}

                      {/* Password strength indicator */}
                      {passwordData.newPassword && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">Password strength</span>
                            <span className="text-xs font-medium text-gray-600">
                              {passwordStrength <= 1 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong"}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <ul className="text-xs text-gray-600 mt-2 grid grid-cols-2 gap-x-2 gap-y-1 pl-1">
                            <li className={`flex items-center ${passwordData.newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${passwordData.newPassword.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}></span>
                              At least 8 characters
                            </li>
                            <li className={`flex items-center ${/[A-Z]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${/[A-Z]/.test(passwordData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                              Uppercase letter
                            </li>
                            <li className={`flex items-center ${/[a-z]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${/[a-z]/.test(passwordData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                              Lowercase letter
                            </li>
                            <li className={`flex items-center ${/[0-9]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${/[0-9]/.test(passwordData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                              Contains number
                            </li>
                            <li className={`flex items-center ${/[^A-Za-z0-9]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${/[^A-Za-z0-9]/.test(passwordData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                              Special character
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2.5 border ${passwordErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                            } rounded-lg focus:ring-2 focus:border-transparent`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end pt-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsChangePasswordOpen(false)}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Changing...
                          </span>
                        ) : "Change Password"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main
          ref={mainContentRef}
          className="pt-16 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50"
        >
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Page content */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Layout;