import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
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
  MessageSquare,
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
  EyeOff
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
  const [notifications, setNotifications] = useState([
    { id: 1, type: "announcement", message: "New announcement posted", read: false, link: "/announcementsView" },
    { id: 2, type: "report", message: "Monthly report available", read: false, link: "/reports" },
    { id: 3, type: "complaint", message: "New complaint received", read: false, link: "/complaints" },
    { id: 4, type: "assignment", message: "Course assignments updated", read: false, link: "/assignments" }
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

  const navItemClass = `flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200 font-medium text-gray-300 hover:bg-indigo-500/10 hover:text-white`;

  const sidebarVariants = {
    open: { width: "16rem", transition: { duration: 0.3 } },
    closed: { width: "5rem", transition: { duration: 0.3 } }
  };

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${navItemClass} ${isActive ? "bg-indigo-500/20 text-white" : ""}`
      }
    >
      <Icon size={20} />
      {isSidebarOpen && <span className="truncate">{children}</span>}
    </NavLink>
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
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Mark all as read
            </button>
          </div>
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                notification.read ? "opacity-60" : ""
              }`}
            >
              <div className={`mt-1 rounded-full p-1 ${
                notification.type === "announcement" ? "bg-blue-100 text-blue-600" :
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
                <p className="text-xs text-gray-500 mt-1">Just now</p>
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

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <motion.aside
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white z-20 transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1"
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                FCSE COSystem
              </h2>
              <p className="text-sm text-gray-400">Role: {user?.role}</p>
            </motion.div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem)]">
          <NavItem to="/dashboard" icon={Home}>Dashboard</NavItem>

          {user?.role === "HeadOfFaculty" && (
            <>
              <NavItem to="/users" icon={Users}>User Management</NavItem>
              <NavItem to="/chairs" icon={Circle}>Chair Management</NavItem>
              <NavItem to="/positions" icon={UserCheck}>Position Management</NavItem>
              <NavItem to="/rules" icon={Settings}>Rule Management</NavItem>
              <NavItem to="/reports" icon={TrendingUp}>Reports</NavItem>
              <NavItem to="/weights" icon={TrendingUp}>Weight Management</NavItem>
              <NavItem to="/announcementsView" icon={Megaphone}>Announcements</NavItem>
            </>
          )}

          {user?.role === "ChairHead" && (
            <>
              <NavItem to="/courses" icon={Book}>Course Management</NavItem>
              <NavItem to="/instructorManagement" icon={Book}>Instructor Management</NavItem>
              <NavItem to="/preferencesForm" icon={ClipboardList}>Preference Management</NavItem>
              <NavItem to="/preferences" icon={Calendar}>Instructor Preference</NavItem>
              <NavItem to="/assignments/auto/regular" icon={FileSpreadsheet}>Regular Assignment</NavItem>
              <NavItem to="/complaintsCH" icon={AlertTriangle}>Complaints</NavItem>
              <NavItem to="/reportsCH" icon={TrendingUp}>Reports</NavItem>
              <NavItem to="/announcementsCH" icon={Megaphone}>Announcements</NavItem>
            </>
          )}

          {user?.role === "COC" && (
            <>
              <NavItem to="/assignments/auto/common" icon={BookOpen}>Common Courses</NavItem>
              <NavItem to="/assignments/auto/extension" icon={FileSpreadsheet}>Extension Courses</NavItem>
              <NavItem to="/assignments/auto/summer" icon={Calendar}>Summer Courses</NavItem>
              <NavItem to="/complaintsCOC" icon={AlertTriangle}>Complaints</NavItem>
              <NavItem to="/reportsCOC" icon={TrendingUp}>Reports</NavItem>
              <NavItem to="/announcementsCOC" icon={Megaphone}>Announcements</NavItem>
            </>
          )}

          {user?.role === "Instructor" && (
            <>
              <NavItem to="/preferencesInst" icon={ClipboardList}>Submit Preferences</NavItem>
              <NavItem to="/assignmentsInst" icon={FileText}>My Assignments</NavItem>
              <NavItem to="/complaintsInst" icon={AlertTriangle}>File Complaint</NavItem>
              <NavItem to="/announcementsInst" icon={Megaphone}>Announcements</NavItem>
              <NavItem to="/reportsInst" icon={TrendingUp}>Reports</NavItem>
            </>
          )}
        </nav>
      </motion.aside>

      <div className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-0 z-10 ml-[inherit] transition-all duration-300">
          <div className="flex items-center justify-end h-full px-6 gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
                  if (isChangePasswordOpen) setIsChangePasswordOpen(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
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
                    className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white border z-30"
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

            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  if (isNotificationOpen) setIsNotificationOpen(false);
                  if (isChangePasswordOpen) setIsChangePasswordOpen(false);
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="User profile"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="text-indigo-600" size={20} />
                </div>
                <span className="font-medium text-gray-700">{user?.name}</span>
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 z-30"
                  >
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsChangePasswordOpen(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Lock size={18} />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6"
              >
                <div className="flex justify-between items-center mb-4">
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
                          className={`w-full px-4 py-2 border ${
                            passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
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
                          className={`w-full px-4 py-2 border ${
                            passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
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
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getStrengthColor()}`} 
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {passwordStrength <= 1 && "Weak password"}
                            {passwordStrength > 1 && passwordStrength <= 3 && "Moderate password"}
                            {passwordStrength > 3 && "Strong password"}
                          </p>
                          <ul className="text-xs text-gray-600 mt-1 list-disc pl-5">
                            <li className={passwordData.newPassword.length >= 8 ? "text-green-600" : ""}>
                              At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(passwordData.newPassword) ? "text-green-600" : ""}>
                              Contains uppercase letter
                            </li>
                            <li className={/[a-z]/.test(passwordData.newPassword) ? "text-green-600" : ""}>
                              Contains lowercase letter
                            </li>
                            <li className={/[0-9]/.test(passwordData.newPassword) ? "text-green-600" : ""}>
                              Contains a number
                            </li>
                            <li className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? "text-green-600" : ""}>
                              Contains special character
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
                          className={`w-full px-4 py-2 border ${
                            passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
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
                    
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setIsChangePasswordOpen(false)}
                        className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          isLoading ? "opacity-70 cursor-not-allowed" : ""
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

        <main className="pt-16 min-h-screen bg-gray-50">
          <div className=" max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;