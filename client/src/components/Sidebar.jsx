// Layout.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Home,
  Users,
  Circle,
  UserCheck,
  Book,
  Settings,
  TrendingUp,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  FileText,
  AlertCircle,
  Megaphone,
  ClipboardList,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import api from "../utils/api";

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
    preferences: true
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: "announcement", message: "New announcement posted", read: false, link: "/announcementsView", time: "2 hours ago" },
    { id: 2, type: "report", message: "Monthly report available", read: false, link: "/reports", time: "Yesterday" },
    { id: 3, type: "complaint", message: "New complaint received", read: false, link: "/complaints", time: "2 days ago" },
    { id: 4, type: "assignment", message: "Course assignments updated", read: false, link: "/assignments", time: "Mar 15, 2025" }
  ]);
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

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Check window width for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen, isNotificationOpen]);

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

  const handleNotificationClick = (notification) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    navigate(notification.link);
    setIsNotificationOpen(false);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(
      notifications.map(n => ({ ...n, read: true }))
    );
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const navItemClass = `flex items-center gap-3 py-2.5 px-4 rounded-md transition-colors font-medium text-gray-200 hover:bg-indigo-600/20 hover:text-white`;
  const navGroupClass = `flex items-center justify-between gap-2 py-2.5 px-4 rounded-md transition-colors font-medium text-gray-200 hover:bg-indigo-600/20 hover:text-white cursor-pointer`;
  const subNavItemClass = `flex items-center gap-3 py-2 px-4 ml-4 rounded-md transition-colors font-medium text-gray-300 hover:bg-indigo-600/20 hover:text-white border-l border-gray-700/50`;

  const sidebarVariants = {
    open: { 
      width: windowWidth < 768 ? "250px" : "280px", 
      transition: { duration: 0.3 } 
    },
    closed: { 
      width: windowWidth < 768 ? "0" : "80px", 
      transition: { duration: 0.3 } 
    }
  };

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${navItemClass} ${isActive ? "bg-indigo-600/30 text-white" : ""}`
      }
      onClick={() => windowWidth < 768 && setIsSidebarOpen(false)}
    >
      <Icon size={20} className="flex-shrink-0" />
      {isSidebarOpen && <span className="truncate">{children}</span>}
    </NavLink>
  );

  const SubNavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${subNavItemClass} ${isActive ? "bg-indigo-600/30 text-white" : ""}`
      }
      onClick={() => windowWidth < 768 && setIsSidebarOpen(false)}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
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
          <Icon size={20} className="flex-shrink-0" />
          {isSidebarOpen && <span className="truncate">{title}</span>}
        </div>
        {isSidebarOpen && (
          expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
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
    <div className="divide-y divide-gray-100">
      {notifications.length > 0 ? (
        <>
          <div className="p-2 flex justify-between items-center border-b">
            <span className="text-xs text-gray-500">
              {notifications.filter(n => !n.read).length} unread
            </span>
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${notification.read ? "opacity-60" : ""
                }`}
            >
              <div className={`mt-1 rounded-full p-1.5 ${notification.type === "announcement" ? "bg-blue-100 text-blue-600" :
                  notification.type === "report" ? "bg-green-100 text-green-600" :
                    notification.type === "complaint" ? "bg-orange-100 text-orange-600" :
                      "bg-indigo-100 text-indigo-600"
                }`}>
                {notification.type === "announcement" ? <Megaphone size={16} /> :
                  notification.type === "report" ? <FileText size={16} /> :
                    notification.type === "complaint" ? <AlertTriangle size={16} /> :
                      <AlertCircle size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
              {!notification.read && (
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
              )}
            </button>
          ))}
        </>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );

  // Create navigation items based on user role
  const renderNavItems = () => {
    switch (user?.role) {
      case "HeadOfFaculty":
        return (
          <>
            <NavItem to="/dashboard" icon={Home}>Dashboard</NavItem>
            <NavItem to="/users" icon={Users}>User Management</NavItem>
            <NavItem to="/chairs" icon={Circle}>Chair Management</NavItem>
            <NavItem to="/positions" icon={UserCheck}>Position Management</NavItem>
            <NavItem to="/rules" icon={Settings}>Rule Management</NavItem>
            <NavGroup
              title="Reports"
              icon={TrendingUp}
              expanded={expandedGroups.reports}
              onToggle={() => toggleGroup('reports')}
            >
              <SubNavItem to="/reports">View Reports</SubNavItem>
              <SubNavItem to="/weights">Weight Management</SubNavItem>
            </NavGroup>
            <NavItem to="/announcementsView" icon={Megaphone}>Announcements</NavItem>
          </>
        );

      case "ChairHead":
        return (
          <>
            <NavItem to="/dashboard" icon={Home}>Dashboard</NavItem>

            <NavGroup
              title="Courses and Instructors"
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
            <NavItem to="/announcementsCH" icon={Megaphone}>Announcements</NavItem>
          </>
        );

      case "COC":
        return (
          <>
            <NavItem to="/dashboard" icon={Home}>Dashboard</NavItem>

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
            <NavItem to="/announcementsCOC" icon={Megaphone}>Announcements</NavItem>
          </>
        );

      case "Instructor":
        return (
          <>
            <NavItem to="/dashboard" icon={Home}>Dashboard</NavItem>
            <NavItem to="/preferencesInst" icon={ClipboardList}>Submit Preferences</NavItem>
            <NavItem to="/assignmentsInst" icon={FileText}>My Assignments</NavItem>
            <NavItem to="/complaintsInst" icon={AlertTriangle}>File Complaint</NavItem>
            <NavItem to="/announcementsInst" icon={Megaphone}>Announcements</NavItem>
            <NavItem to="/reportsInst" icon={TrendingUp}>Reports</NavItem>
          </>
        );

      default:
        return <NavItem to="/dashboard" icon={Home}>Dashboard</NavItem>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Overlay for mobile sidebar */}
      {windowWidth < 768 && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={windowWidth < 768 ? "closed" : "open"}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed left-0 top-0 h-full bg-gray-900 shadow-lg shadow-gray-900/10 z-20 overflow-hidden ${
          windowWidth < 768 && !isSidebarOpen ? "w-0" : ""
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 rounded text-white">
                  FC
                </span>
                <span>FCSE COSystem</span>
              </h2>
              <p className="text-xs text-gray-400 uppercase tracking-wider ml-1">
                {user?.role === "HeadOfFaculty" ? "Head of Faculty" :
                  user?.role === "ChairHead" ? "Chair Head" :
                    user?.role === "COC" ? "COC" : "Instructor"}
              </p>
            </motion.div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <X size={20} className="text-gray-400" /> : <Menu size={20} className="text-gray-400" />}
          </button>
        </div>

        <nav className="py-4 px-3 space-y-2 overflow-y-auto h-[calc(100vh-5rem)] custom-scrollbar">
          {renderNavItems()}
        </nav>
      </motion.aside>

      <div
        className={`flex-1 transition-all duration-300 ${
          windowWidth >= 768
            ? (isSidebarOpen ? "ml-[280px]" : "ml-[80px]")
            : "ml-0"
        }`}
      >
        <header className="bg-white shadow-md h-16 fixed top-0 right-0 z-10 w-full">
          <div className={`flex items-center justify-between h-full px-4 md:px-6 ${
            windowWidth >= 768 
              ? (isSidebarOpen ? "ml-[280px]" : "ml-[80px]") 
              : "ml-0"
          }`}>
            {/* Mobile menu button - only shown on mobile */}
            {windowWidth < 768 && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Menu size={22} />
              </button>
            )}

            {/* Logo shown on mobile */}
            {windowWidth < 768 && (
              <div className="flex items-center space-x-2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1 rounded text-white font-bold">
                  FC
                </span>
                <h2 className="text-lg font-semibold text-gray-800">FCSE COSystem</h2>
              </div>
            )}

            <div className="flex items-center ml-auto gap-2 md:gap-4">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length}
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
                      <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <button
                            onClick={() => setIsNotificationOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded-lg"
                            aria-label="Close notifications"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      {renderNotifications()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    if (isNotificationOpen) setIsNotificationOpen(false);
                  }}
                  className="flex items-center px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="User profile"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden md:block ml-2 mr-1 font-medium text-gray-700 truncate max-w-[100px] lg:max-w-[200px]">
                    {user?.fullName || "User"}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
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
                      <div className="p-2">
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
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1"
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
                          className={`w-full px-4 py-2.5 border ${passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
                          className={`w-full px-4 py-2.5 border ${passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5 flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${getStrengthColor()}`}></span>
                            {passwordStrength <= 1 && "Weak password"}
                            {passwordStrength > 1 && passwordStrength <= 3 && "Moderate password"}
                            {passwordStrength > 3 && "Strong password"}
                          </p>
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
                          className={`w-full px-4 py-2.5 border ${passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
                        {isLoading ? "Changing..." : "Change Password"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="pt-16 min-h-screen bg-gray-50 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Layout;