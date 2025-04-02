import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
// import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { 
  Box, Paper, Typography, Grid, Button, TextField, IconButton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  Avatar, Chip, FormControl, InputLabel, Select, MenuItem, Tooltip, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
 CircularProgress, Alert, Snackbar, Skeleton,  useTheme,
  Accordion, AccordionSummary, AccordionDetails,
  TableSortLabel
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  FilterAlt as FilterAltIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ChairHeadIcon,
  Groups as FacultyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const UsersHF = () => {
  const theme = useTheme();
  // const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "Instructor",
    phone: "",
    chair: "",
    rank: "",
    position: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chairs, setChairs] = useState([]);
  const [positions, setPositions] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showPassword, setShowPassword] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [filters, setFilters] = useState({
    role: "",
    chair: "",
    search: "",
    position: "",
    location: "",
  });
  
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchChairs(),
          fetchPositions(),
        ]);
      } catch (error) {
        showNotification("Failed to initialize data", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
      setFilteredUsers(data);
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const fetchChairs = async () => {
    try {
      const { data } = await api.get("/chairs");
      setChairs(data);
      return data;
    } catch (error) {
      console.error("Error fetching chairs:", error);
      throw error;
    }
  };

  const fetchPositions = async () => {
    try {
      const { data } = await api.get("/positions");
      setPositions(data);
      return data;
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleEditUserChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setNewUser({
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "Instructor",
      phone: "",
      chair: "",
      rank: "",
      position: "",
      location: "",
    });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      role: "",
      chair: "",
      search: "",
      position: "",
      location: "",
    });
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Apply text search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((user) => 
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(filters.search))
      );
    }

    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    // Apply chair filter
    if (filters.chair) {
      filtered = filtered.filter((user) => 
        user.chair && user.chair.name === filters.chair
      );
    }

    // Apply position filter
    if (filters.position) {
      filtered = filtered.filter((user) => 
        user.position && user.position._id === filters.position
      );
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter((user) => 
        user.location && user.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA = a[sortField] || "";
      let valueB = b[sortField] || "";
      
      // Handle nested properties for chair and position
      if (sortField === "chair") {
        valueA = a.chair ? a.chair.name : "";
        valueB = b.chair ? b.chair.name : "";
      } else if (sortField === "position") {
        valueA = a.position ? a.position.name : "";
        valueB = b.position ? b.position.name : "";
      }

      if (typeof valueA === 'string') {
        if (sortDirection === "asc") {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      } else {
        if (sortDirection === "asc") {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      }
    });

    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      await api.post("/users/signup", newUser);
      showNotification("User added successfully");
      resetForm();
      await fetchUsers();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      showNotification("Failed to add user", "error");
    }
    setLoadingAction(false);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      await api.put(`/users/${selectedUser._id}`, selectedUser);
      showNotification("User updated successfully");
      setIsEditModalOpen(false);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification("Failed to update user", "error");
    }
    setLoadingAction(false);
  };

  const handleDeleteUser = async () => {
    setLoadingAction(true);
    try {
      await api.delete(`/users/${selectedUser._id}`);
      showNotification("User deleted successfully");
      setIsDeleteModalOpen(false);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user", "error");
    }
    setLoadingAction(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ open: true, message, type });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "HeadOfFaculty":
        return <AdminIcon />;
      case "ChairHead":
        return <ChairHeadIcon />;
      case "Instructor":
        return <ChairHeadIcon />;
      case "COC":
        return <FacultyIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "HeadOfFaculty":
        return "error";
      case "ChairHead":
        return "primary";
      case "Instructor":
        return "success";
      case "COC":
        return "success";
      default:
        return "default";
    }
  };

  // Calculate paged data
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // Loading skeletons
  if (loading && users.length === 0) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6"
    >
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3, background: 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)' }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              User Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage faculty, chair heads, and admin users
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setIsAddModalOpen(true)}
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                background: 'linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #303f9f 30%, #3d5afe 90%)',
                }
              }}
            >
              New User
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box mb={3}>
        <Accordion 
          expanded={expandedFilter} 
          onChange={() => setExpandedFilter(!expandedFilter)}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            '&:before': { display: 'none' },
            '& .MuiAccordionSummary-root': { minHeight: '64px' }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="medium">
                Filters & Search
              </Typography>
              {Object.values(filters).some(filter => filter) && (
                <Chip 
                  label={`${Object.values(filters).filter(Boolean).length} active`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search users..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: filters.search && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFilters({ ...filters, search: "" })}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    label="Role"
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="HeadOfFaculty">Head Of Faculty</MenuItem>
                    <MenuItem value="ChairHead">Chair Head</MenuItem>
                    <MenuItem value="Instructor">Instructor</MenuItem>
                    <MenuItem value="COC">COC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Chair Department</InputLabel>
                  <Select
                    name="chair"
                    value={filters.chair}
                    onChange={handleFilterChange}
                    label="Chair Department"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {chairs.map(chair => (
                      <MenuItem key={chair._id} value={chair.name}>
                        {chair.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Rank</InputLabel>
                  <Select
                    name="role"
                    value={filters.rank}
                    onChange={handleFilterChange}
                    label="Role"
                  >
                    <MenuItem value="">All Ranks</MenuItem>
                    <MenuItem value="HeadOfFaculty">Head Of Faculty</MenuItem>
                    <MenuItem value="ChairHead">Chair Head</MenuItem>
                    <MenuItem value="Instructor">Instructor</MenuItem>
                    <MenuItem value="COC">COC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Position</InputLabel>
                  <Select
                    name="position"
                    value={filters.position}
                    onChange={handleFilterChange}
                    label="Position"
                  >
                    <MenuItem value="">All Positions</MenuItem>
                    {positions.map(position => (
                      <MenuItem key={position._id} value={position._id}>
                        {position.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Filter by location..."
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={9}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<RefreshIcon />}
                    onClick={resetFilters}
                    disabled={!Object.values(filters).some(Boolean)}
                  >
                    Reset Filters
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredUsers.length} of {users.length} users
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3,
          '& .MuiTab-root': {
            fontWeight: 'bold',
            textTransform: 'none',
          } 
        }}
      >
        <Tab icon={<PersonIcon />} label="All Users" />
        <Tab icon={<AdminIcon />} label="Head Of Faculty" />
        <Tab icon={<ChairHeadIcon />} label="Chair Heads" />
        <Tab icon={<FacultyIcon />} label="Instructors" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'fullName'}
                      direction={sortField === 'fullName' ? sortDirection : 'asc'}
                      onClick={() => toggleSort('fullName')}
                    >
                      <Typography fontWeight="bold">Name</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'email'}
                      direction={sortField === 'email' ? sortDirection : 'asc'}
                      onClick={() => toggleSort('email')}
                    >
                      <Typography fontWeight="bold">Contact</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'role'}
                      direction={sortField === 'role' ? sortDirection : 'asc'}
                      onClick={() => toggleSort('role')}
                    >
                      <Typography fontWeight="bold">Role</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'chair'}
                      direction={sortField === 'chair' ? sortDirection : 'asc'}
                      onClick={() => toggleSort('chair')}
                    >
                      <Typography fontWeight="bold">Department</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Alert severity="info" sx={{ m: 2 }}>
                        No users found matching the current filters.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    // Skip users based on selected tab
                    if (
                      (currentTab === 1 && user.role !== "HeadOfFaculty") ||
                      (currentTab === 2 && user.role !== "ChairHead") ||
                      (currentTab === 3 && user.role !== "Instructor")||
                      (currentTab === 4 && user.role !== "COC")
                    ) {
                      return null;
                    }
                    
                    return (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: theme.palette[getRoleColor(user.role)] 
                              }}
                            >
                              {user.fullName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {user.fullName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            {user.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">{user.phone}</Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role}
                            color={getRoleColor(user.role)}
                            size="small"
                            sx={{ fontWeight: 'medium' }}
                          />
                          {user.position && (
                            <Chip
                              icon={<WorkIcon />}
                              label={user.position.name}
                              variant="outlined"
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {user.chair ? (
                            <Box>
                              <Typography variant="body2">
                                {user.chair}
                              </Typography>
                              {user.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {user.location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not assigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton 
                              color="primary"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditModalOpen(true);
                              }}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton 
                              color="error"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteModalOpen(true);
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Add User Modal */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Add New User</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={newUser.fullName}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={newUser.username}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="HeadOfFaculty">HeadOfFaculty</MenuItem>
                  <MenuItem value="ChairHead">Chair Head</MenuItem>
                  <MenuItem value="Instructor">Instructor</MenuItem>
                  <MenuItem value="COC">COC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={newUser.phone}
                onChange={handleChange}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Chair Department</InputLabel>
                <Select
                  name="chair"
                  value={newUser.chair}
                  onChange={handleChange}
                  label="Chair Department"
                >
                  <MenuItem value="">None</MenuItem>
                  {chairs.map(chair => (
                    <MenuItem key={chair._id} value={chair.name}>
                      {chair.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Rank</InputLabel>
                <Select
                  name="rank"
                  value={newUser.rank}
                  onChange={handleChange}
                  label="rank"
                >
                  <MenuItem value="Lecturer">Lecturer</MenuItem>
                  <MenuItem value="AssistantProfessor">Assistant Professor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Position</InputLabel>
                <Select
                  name="position"
                  value={newUser.position}
                  onChange={handleChange}
                  label="Position"
                >
                  <MenuItem value="">None</MenuItem>
                  {positions.map(position => (
                    <MenuItem key={position._id} value={position._id}>
                      {position.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location/Office"
                name="location"
                value={newUser.location}
                onChange={handleChange}
                variant="outlined"
                margin="normal"
                placeholder="Building and room number"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setIsAddModalOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            color="primary"
            disabled={
              loadingAction ||
              !newUser.fullName ||
              !newUser.username ||
              !newUser.email ||
              !newUser.password ||
              !newUser.role
            }
            startIcon={loadingAction ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loadingAction ? "Adding..." : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Modal */}
      {selectedUser && (
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">Edit User</Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={selectedUser.fullName}
                  onChange={handleEditUserChange}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={selectedUser.username}
                  onChange={handleEditUserChange}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={selectedUser.email}
                  onChange={handleEditUserChange}
                  required
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={selectedUser.phone || ""}
                  onChange={handleEditUserChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={selectedUser.role}
                    onChange={handleEditUserChange}
                    label="Role"
                  >
                    <MenuItem value="HeadOfFaculty">Head Of Faculty</MenuItem>
                    <MenuItem value="ChairHead">Chair Head</MenuItem>
                    <MenuItem value="Instructor">Instructor</MenuItem>
                    <MenuItem value="COC">COC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Chair Department</InputLabel>
                  <Select
                    name="chair"
                    value={selectedUser.chair?._id || ""}
                    onChange={(e) => {
                      setSelectedUser({
                        ...selectedUser,
                        chair: e.target.value ? { _id: e.target.value } : null
                      });
                    }}
                    label="Chair Department"
                  >
                    <MenuItem value="">None</MenuItem>
                    {chairs.map(chair => (
                      <MenuItem key={chair._id} value={chair.name}>
                        {chair.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Position</InputLabel>
                  <Select
                    name="position"
                    value={selectedUser.position?._id || ""}
                    onChange={(e) => {
                      setSelectedUser({
                        ...selectedUser,
                        position: e.target.value ? { _id: e.target.value } : null
                      });
                    }}
                    label="Position"
                  >
                    <MenuItem value="">None</MenuItem>
                    {positions.map(position => (
                      <MenuItem key={position._id} value={position._id}>
                        {position.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location/Office"
                  name="location"
                  value={selectedUser.location || ""}
                  onChange={handleEditUserChange}
                  variant="outlined"
                  margin="normal"
                  placeholder="Building and room number"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setIsEditModalOpen(false)}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              variant="contained"
              color="primary"
              disabled={
                loadingAction ||
                !selectedUser.fullName ||
                !selectedUser.username ||
                !selectedUser.email ||
                !selectedUser.role
              }
              startIcon={loadingAction ? <CircularProgress size={20} /> : <EditIcon />}
              sx={{ borderRadius: 2 }}
            >
              {loadingAction ? "Updating..." : "Update User"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {selectedUser && (
        <Dialog
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold" color="error">
              Delete User
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to delete the user <strong>{selectedUser.fullName}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              variant="contained"
              color="error"
              disabled={loadingAction}
              startIcon={loadingAction ? <CircularProgress size={20} /> : <DeleteIcon />}
              sx={{ borderRadius: 2 }}
            >
              {loadingAction ? "Deleting..." : "Delete User"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default UsersHF;