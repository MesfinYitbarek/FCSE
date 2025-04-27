import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  UserCheck,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Award,
  Briefcase,
  Clock,
  XCircle,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Info
} from "lucide-react";

dayjs.extend(relativeTime);

const UsersManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    chair: ""
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc"
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Instructor",
    phone: "",
    chair: "",
    rank: "",
    position: "",
    location: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [availableChairs, setAvailableChairs] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const filtersRef = useRef(null);
  const contentRef = useRef(null);

  // Track window size for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
    fetchChairs();
    fetchPositions();
  }, []);

  // Handle clicks outside of filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filtersRef]);

  // Update filtered users when filters or search term changes
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filters]);

  // Calculate total pages when filtered users or items per page changes
  useEffect(() => {
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
    setPage(1); // Reset to first page when filters change
  }, [filteredUsers, itemsPerPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchChairs = async () => {
    try {
      const response = await api.get("/chairs");
      setAvailableChairs(response.data);
    } catch (err) {
      console.error("Error fetching chairs:", err);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await api.get("/positions");
      setAvailablePositions(response.data);
    } catch (err) {
      console.error("Error fetching positions:", err);
    }
  };

  const filterUsers = () => {
    let result = [...users];

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        user =>
          user.fullName?.toLowerCase().includes(lowerCaseSearch) ||
          user.email?.toLowerCase().includes(lowerCaseSearch) ||
          user.username?.toLowerCase().includes(lowerCaseSearch) ||
          user.role?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply filters
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    if (filters.chair) {
      result = result.filter(user => user.chair === filters.chair);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        const aValue = typeof a[sortConfig.key] === 'string' 
          ? a[sortConfig.key].toLowerCase() 
          : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string' 
          ? b[sortConfig.key].toLowerCase() 
          : b[sortConfig.key];
          
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <ChevronDown size={14} className="opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-indigo-600 dark:text-indigo-400" /> 
      : <ChevronDown size={14} className="text-indigo-600 dark:text-indigo-400" />;
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({ role: "", chair: "" });
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = newUser;
      
      const response = await api.post("/users/signup", userData);
      setUsers(prev => [...prev, response.data.user]);
      toast.success("User added successfully");
      resetForm();
      setIsAddUserOpen(false);
    } catch (err) {
      console.error("Error adding user:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to add user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    setLoading(true);
    try {
      // Remove password fields if they're empty
      const { confirmPassword, password, ...userData } = newUser;
      const dataToSend = password ? { ...userData, password } : userData;
      
      const response = await api.put(`/users/${selectedUser._id}`, dataToSend);
      
      setUsers(prev => 
        prev.map(u => u._id === selectedUser._id ? response.data.user : u)
      );
      
      toast.success("User updated successfully");
      resetForm();
      setIsEditUserOpen(false);
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      await api.delete(`/users/${selectedUser._id}`);
      setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
      toast.success("User deleted successfully");
      setIsDeleteUserOpen(false);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (isEdit = false) => {
    const errors = {};
    
    // These fields are always required
    if (!newUser.fullName.trim()) errors.fullName = "Full name is required";
    if (!newUser.username.trim()) errors.username = "Username is required";
    if (!newUser.email.trim()) errors.email = "Email is required";
    if (!newUser.role) errors.role = "Role is required";
    
    // Only validate password for new users or if password field is filled for edits
    if (!isEdit || newUser.password) {
      if (!isEdit && !newUser.password) {
        errors.password = "Password is required";
      } else if (newUser.password && newUser.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
      
      if (newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newUser.email && !emailRegex.test(newUser.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Phone validation (basic)
    if (newUser.phone && !/^\+?[0-9\s-()]{8,}$/.test(newUser.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setNewUser({
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Instructor",
      phone: "",
      chair: "",
      rank: "",
      position: "",
      location: ""
    });
    setFormErrors({});
    setShowPassword(false);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewUser({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || "Instructor",
      phone: user.phone || "",
      chair: user.chair || "",
      rank: user.rank || "",
      position: user.position || "",
      location: user.location || ""
    });
    setIsEditUserOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteUserOpen(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Get paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, page, itemsPerPage]);

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "HeadOfFaculty":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "ChairHead":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "COC":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Instructor":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "HeadOfFaculty":
        return <Shield size={14} className="mr-1" />;
      case "ChairHead":
        return <Building size={14} className="mr-1" />;
      case "COC":
        return <Award size={14} className="mr-1" />;
      case "Instructor":
        return <UserCheck size={14} className="mr-1" />;
      default:
        return <UserCheck size={14} className="mr-1" />;
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Full Name", 
      "Username", 
      "Email", 
      "Role", 
      "Phone", 
      "Chair", 
      "Rank", 
      "Position", 
      "Location", 
      "Created At"
    ];
    
    const csvRows = [];
    // Add the headers
    csvRows.push(headers.join(','));
    
    // Add the data
    filteredUsers.forEach(user => {
      const values = [
        `"${user.fullName || ''}"`,
        `"${user.username || ''}"`,
        `"${user.email || ''}"`,
        `"${user.role || ''}"`,
        `"${user.phone || ''}"`,
        `"${user.chair || ''}"`,
        `"${user.rank || ''}"`,
        `"${user.position || ''}"`,
        `"${user.location || ''}"`,
        `"${user.createdAt ? dayjs(user.createdAt).format('YYYY-MM-DD') : ''}"`,
      ];
      csvRows.push(values.join(','));
    });
    
    // Create the CSV content
    const csvContent = csvRows.join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${dayjs().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
            <Users className="h-8 w-8 text-indigo-500 dark:text-indigo-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading users...</h3>
          <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch the user data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-md mx-4">
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Failed to Load Users</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isMobile = windowWidth < 768;

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage faculty members, chairs, and instructors
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddUserOpen(true);
            }}
            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-4">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 pr-9 py-2"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5"
                  onClick={() => setSearchTerm("")}
                >
                  <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative" ref={filtersRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Filter className="w-4 h-4 mr-1.5" />
                  {isMobile ? "" : "Filters"}
                  {(filters.role || filters.chair) && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                      {Object.values(filters).filter(Boolean).length}
                    </span>
                  )}
                </button>

                {/* Filter dropdown */}
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
                        <button
                          onClick={resetFilters}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          Reset all
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Role filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Role
                          </label>
                          <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange("role", e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                          >
                            <option value="">All Roles</option>
                            <option value="HeadOfFaculty">Head of Faculty</option>
                            <option value="ChairHead">Chair Head</option>
                            <option value="COC">COC</option>
                            <option value="Instructor">Instructor</option>
                          </select>
                        </div>

                        {/* Chair filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Chair
                          </label>
                          <select
                            value={filters.chair}
                            onChange={(e) => handleFilterChange("chair", e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                          >
                            <option value="">All Chairs</option>
                            {availableChairs.map((chair) => (
                              <option key={chair._id} value={chair.name}>
                                {chair.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {isMobile ? "" : "Export"}
              </button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(searchTerm || filters.role || filters.chair) && (
          <div className="px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filters:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  Search: {searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filters.role && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                  Role: {filters.role}
                  <button
                    onClick={() => handleFilterChange("role", "")}
                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filters.chair && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  Chair: {filters.chair}
                  <button
                    onClick={() => handleFilterChange("chair", "")}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-auto"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table/Cards */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex-1 flex flex-col">
        {loading && users.length > 0 ? (
          <div className="flex justify-center items-center h-16">
            <RefreshCw className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-spin" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Refreshing users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 sm:p-6 text-center">
            <Users className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1">No users found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filters.role || filters.chair
                ? "Try adjusting your search or filters"
                : "Add your first user to get started"}
            </p>
            
            {searchTerm || filters.role || filters.chair ? (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="w-4 h-4 mr-1.5" />
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  resetForm();
                  setIsAddUserOpen(true);
                }}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add New User
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile view (cards) */}
            {isMobile ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto flex-1">
                {paginatedUsers.map((user) => (
                  <div key={user._id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => openDetailModal(user)}
                        >
                          <Info size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-x-2 gap-y-1">
                      <div className="flex items-center col-span-2">
                        <Mail size={12} className="text-gray-400 dark:text-gray-500 mr-1.5" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role === "HeadOfFaculty" ? "HoF" : 
                           user.role === "ChairHead" ? "Chair" : 
                           user.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-600 dark:text-indigo-400 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/50 mr-1"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 dark:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view (table)
              <div className="overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('fullName')}
                      >
                        <div className="flex items-center">
                          <span>Name</span>
                          <div className="ml-1">{getSortIcon('fullName')}</div>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('email')}
                      >
                        <div className="flex items-center">
                          <span>Email</span>
                          <div className="ml-1">{getSortIcon('email')}</div>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('role')}
                      >
                        <div className="flex items-center">
                          <span>Role</span>
                          <div className="ml-1">{getSortIcon('role')}</div>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('chair')}
                      >
                        <div className="flex items-center">
                          <span>Chair</span>
                          <div className="ml-1">{getSortIcon('chair')}</div>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                        onClick={() => requestSort('createdAt')}
                      >
                        <div className="flex items-center">
                          <span>Created</span>
                          <div className="ml-1">{getSortIcon('createdAt')}</div>
                        </div>
                      </th>
                      <th scope="col" className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedUsers.map((user) => (
                      <tr 
                        key={user._id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px] md:max-w-none">
                                {user.fullName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail size={14} className="text-gray-400 dark:text-gray-500 mr-1.5" />
                            <span className="text-sm text-gray-900 dark:text-white truncate max-w-[120px] md:max-w-none">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center mt-0.5">
                              <Phone size={14} className="text-gray-400 dark:text-gray-500 mr-1.5" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role === "HeadOfFaculty" ? "Head of Faculty" : 
                             user.role === "ChairHead" ? "Chair Head" : 
                             user.role}
                          </span>
                                             
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {user.chair ? (
                            <div className="flex items-center">
                              <Building size={14} className="text-gray-400 dark:text-gray-500 mr-1.5" />
                              <span className="text-sm text-gray-900 dark:text-white truncate max-w-[100px]">{user.chair}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">--</span>
                          )}
                          
                          {user.location && (
                            <div className="flex items-center mt-0.5">
                              <MapPin size={12} className="text-gray-400 dark:text-gray-500 mr-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">{user.location}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          <div className="flex items-center">
                            <Clock size={14} className="text-gray-400 dark:text-gray-500 mr-1.5" />
                            <span>
                              {user.createdAt 
                                ? dayjs(user.createdAt).format('MMM D, YYYY') 
                                : "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                            >
                              <Edit2 size={16} />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"
                            >
                              <Trash2 size={16} />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            <div className="bg-white dark:bg-gray-800 px-3 py-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                    page <= 1 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Previous
                </button>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                    page >= totalPages 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{filteredUsers.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * itemsPerPage, filteredUsers.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                        page <= 1 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers - show 3 pages max plus ellipsis */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                      // Calculate which pages to show
                      const pageNum = i + 1;
                      const isCurrentPage = pageNum === page;
                      const isFirstPage = pageNum === 1;
                      const isLastPage = pageNum === totalPages;
                      const isWithinTwoPages = Math.abs(pageNum - page) <= 1;
                      
                      // Only show first, last, and pages within +/- 1 of current
                      if (isFirstPage || isLastPage || isWithinTwoPages) {
                        return (
                          <button
                            key={i}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                              isCurrentPage
                                ? 'z-10 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-300'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        (pageNum === 2 && page > 3) || 
                        (pageNum === totalPages - 1 && page < totalPages - 2)
                      ) {
                        // Show ellipsis
                        return (
                          <span
                            key={i}
                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                        page >= totalPages 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal for Mobile */}
      <AnimatePresence>
        {isDetailOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 dark:bg-opacity-70"
              onClick={() => setIsDetailOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Details</h3>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-medium">
                      {selectedUser?.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{selectedUser?.fullName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{selectedUser?.username}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser?.email}</p>
                      </div>
                    </div>
                    
                    {selectedUser?.phone && (
                      <div className="flex items-start">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Role</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser?.role)}`}>
                            {getRoleIcon(selectedUser?.role)}
                            {selectedUser?.role === "HeadOfFaculty" ? "Head of Faculty" : 
                             selectedUser?.role === "ChairHead" ? "Chair Head" : 
                             selectedUser?.role}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    {selectedUser?.chair && (
                      <div className="flex items-start">
                        <Building className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Chair</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.chair}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedUser?.position && (
                      <div className="flex items-start">
                        <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Position</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.position}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedUser?.rank && (
                      <div className="flex items-start">
                        <Award className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Rank</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.rank}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedUser?.location && (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedUser?.createdAt && (
                      <div className="flex items-start">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dayjs(selectedUser.createdAt).format('MMM D, YYYY')}
                            {' '}({dayjs(selectedUser.createdAt).fromNow()})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsDetailOpen(false);
                        openEditModal(selectedUser);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit2 className="w-4 h-4 mr-1.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setIsDetailOpen(false);
                        openDeleteModal(selectedUser);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddUserOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 dark:bg-opacity-70"
              onClick={() => setIsAddUserOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Add New User</h2>
                  <button 
                    onClick={() => setIsAddUserOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddUser} className="px-4 sm:px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={newUser.fullName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.fullName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.fullName && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.fullName}</p>
                      )}
                    </div>
                    
                    {/* Username field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={newUser.username}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.username ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.username && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.username}</p>
                      )}
                    </div>
                    
                    {/* Email field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>
                      )}
                    </div>
                    
                    {/* Phone field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newUser.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.phone ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.phone}</p>
                      )}
                    </div>
                    
                    {/* Password field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={newUser.password}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${
                            formErrors.password ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.password}</p>
                      )}
                    </div>
                    
                    {/* Confirm Password field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.confirmPassword ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                    
                    {/* Role field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <select
                        name="role"
                        value={newUser.role}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.role ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      >
                        <option value="Instructor">Instructor</option>
                        <option value="COC">COC</option>
                        <option value="ChairHead">Chair Head</option>
                        <option value="HeadOfFaculty">Head of Faculty</option>
                      </select>
                      {formErrors.role && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.role}</p>
                      )}
                    </div>
                    
                    {/* Chair field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chair
                      </label>
                      <select
                        name="chair"
                        value={newUser.chair}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Chair</option>
                        {availableChairs.map((chair) => (
                          <option key={chair._id} value={chair.name}>
                            {chair.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Position field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <select
                        name="position"
                        value={newUser.position}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Position</option>
                        {availablePositions.map((position) => (
                          <option key={position._id} value={position.name}>
                            {position.name} {position.exemption ? `(Exemption: ${position.exemption})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Rank field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rank
                      </label>
                      <input
                        type="text"
                        name="rank"
                        value={newUser.rank}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    {/* Location field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={newUser.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-700 disabled:cursor-not-allowed"
                    >
                      {loading ? "Adding..." : "Add User"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditUserOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 dark:bg-opacity-70"
              onClick={() => setIsEditUserOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Edit User: {selectedUser?.fullName}
                  </h2>
                  <button 
                    onClick={() => setIsEditUserOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleEditUser} className="px-4 sm:px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={newUser.fullName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.fullName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.fullName && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.fullName}</p>
                      )}
                    </div>
                    
                    {/* Username field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={newUser.username}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.username ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.username && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.username}</p>
                      )}
                    </div>
                    
                    {/* Email field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>
                      )}
                    </div>
                    
                    {/* Phone field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newUser.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.phone ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.phone}</p>
                      )}
                    </div>
                    
                    {/* Password field (optional for edit) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password <span className="text-gray-500 dark:text-gray-400 text-xs">(leave empty to keep current)</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={newUser.password}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${
                            formErrors.password ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.password}</p>
                      )}
                    </div>
                    
                    {/* Confirm Password field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.confirmPassword ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                    
                    {/* Role field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <select
                        name="role"
                        value={newUser.role}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.role ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      >
                        <option value="Instructor">Instructor</option>
                        <option value="COC">COC</option>
                        <option value="ChairHead">Chair Head</option>
                        <option value="HeadOfFaculty">Head of Faculty</option>
                      </select>
                      {formErrors.role && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.role}</p>
                      )}
                    </div>
                    
                    {/* Chair field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chair
                      </label>
                      <select
                        name="chair"
                        value={newUser.chair}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Chair</option>
                        {availableChairs.map((chair) => (
                          <option key={chair._id} value={chair.name}>
                            {chair.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Position field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <select
                        name="position"
                        value={newUser.position}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Position</option>
                        {availablePositions.map((position) => (
                          <option key={position._id} value={position.name}>
                            {position.name} {position.exemption ? `(Exemption: ${position.exemption})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Rank field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rank
                      </label>
                      <input
                        type="text"
                        name="rank"
                        value={newUser.rank}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    {/* Location field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={newUser.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditUserOpen(false)}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-700 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Update User"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteUserOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 dark:bg-opacity-70"
              onClick={() => setIsDeleteUserOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:max-w-md w-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/50 rounded-full mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
                    Delete User
                  </h3>
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                    Are you sure you want to delete <strong className="text-gray-700 dark:text-gray-300">{selectedUser?.fullName}</strong>? This action cannot be undone.
                  </p>
                  
                  <div className="flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsDeleteUserOpen(false)}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteUser}
                      disabled={loading}
                      className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:disabled:bg-red-700 disabled:cursor-not-allowed"
                    >
                      {loading ? "Deleting..." : "Delete User"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UsersManagement;