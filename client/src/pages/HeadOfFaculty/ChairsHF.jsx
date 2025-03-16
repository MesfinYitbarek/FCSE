import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem,
  Paper, Typography, Grid, Card, CardContent, Chip, IconButton, InputAdornment, Box,
  FormControl, InputLabel, Divider, Skeleton, Alert, Snackbar, Tooltip, Avatar
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  SortByAlpha as SortIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const ChairsHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [chairs, setChairs] = useState([]);
  const [chairHeads, setChairHeads] = useState([]);
  const [newChair, setNewChair] = useState({ name: "", head: "" });
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedChair, setSelectedChair] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHead, setFilterHead] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchChairs(), fetchChairHeads()]);
      } catch (error) {
        showNotification("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  const fetchChairHeads = async () => {
    try {
      const { data } = await api.get(`/users/role/${"ChairHead"}`);
      setChairHeads(data);
      return data;
    } catch (error) {
      console.error("Error fetching Chair Heads:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
    setNewChair({ ...newChair, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setNewChair({ name: "", head: "" });
  };

  const handleAddChair = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/chairs/create", newChair);
      resetForm();
      await fetchChairs();
      setOpenAddModal(false);
      showNotification("Chair added successfully");
    } catch (error) {
      console.error("Error adding chair:", error);
      showNotification("Failed to add chair", "error");
    }
    setLoading(false);
  };

  const handleEditChair = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/chairs/${selectedChair._id}`, newChair);
      resetForm();
      await fetchChairs();
      setOpenEditModal(false);
      showNotification("Chair updated successfully");
    } catch (error) {
      console.error("Error updating chair:", error);
      showNotification("Failed to update chair", "error");
    }
    setLoading(false);
  };

  const handleDeleteChair = async () => {
    setLoading(true);
    try {
      await api.delete(`/chairs/${selectedChair._id}`);
      await fetchChairs();
      setOpenDeleteModal(false);
      showNotification("Chair deleted successfully");
    } catch (error) {
      console.error("Error deleting chair:", error);
      showNotification("Failed to delete chair", "error");
    }
    setLoading(false);
  };

  const openEditChairModal = (chair) => {
    setSelectedChair(chair);
    setNewChair({ name: chair.name, head: chair.head?._id || "" });
    setOpenEditModal(true);
  };

  const openDeleteChairModal = (chair) => {
    setSelectedChair(chair);
    setOpenDeleteModal(true);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ open: true, message, type });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterHead("");
  };

  const toggleFiltersVisibility = () => {
    setFiltersVisible(!filtersVisible);
  };

  // Memoized filtered and sorted chairs
  const filteredChairs = useMemo(() => {
    let result = chairs.filter((chair) => {
      const matchesSearchTerm = chair.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHead = filterHead ? chair.head?._id === filterHead : true;
      return matchesSearchTerm && matchesHead;
    });

    // Sort by name
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    return result;
  }, [chairs, searchTerm, filterHead, sortOrder]);

  // Loading skeleton
  if (loading && chairs.length === 0) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
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
              Chair Departments
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage academic chair departments and their heads
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenAddModal(true)}
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00B0FF 90%)',
                }
              }}
            >
              New Chair
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box mb={3}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by chair name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm("")}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={8} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Filter by Chair Head</InputLabel>
                  <Select
                    value={filterHead}
                    onChange={(e) => setFilterHead(e.target.value)}
                    label="Filter by Chair Head"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Chair Heads</MenuItem>
                    {chairHeads.map((ch) => (
                      <MenuItem key={ch._id} value={ch._id}>
                        {ch.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4} md={2}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Tooltip title="Toggle sort order">
                    <IconButton onClick={toggleSortOrder} color={sortOrder === "desc" ? "primary" : "default"}>
                      <SortIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset filters">
                    <IconButton onClick={resetFilters} disabled={!searchTerm && !filterHead}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      ) : (
        <>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="subtitle1">
                Showing {filteredChairs.length} of {chairs.length} chairs
              </Typography>
            </Box>

            {filteredChairs.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No chairs found matching your search criteria.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredChairs.map((chair) => (
                  <Grid item xs={12} sm={6} md={4} key={chair._id}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card sx={{ 
                        borderRadius: 2,
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                        }
                      }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {chair.name}
                            </Typography>
                            <Box>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small" 
                                  onClick={() => openEditChairModal(chair)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => openDeleteChairModal(chair)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                mr: 2,
                                background: chair.head 
                                  ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                  : 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                              }}
                            >
                              {chair.head?.fullName?.charAt(0) || '?'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Chair Head
                              </Typography>
                              <Typography variant="body1">
                                {chair.head ? chair.head.fullName : "Not Assigned"}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

      {/* Add Chair Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Add New Chair</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chair Name"
                name="name"
                value={newChair.name}
                onChange={handleChange}
                required
                variant="outlined"
                autoFocus
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Chair Head</InputLabel>
                <Select
                  name="head"
                  value={newChair.head}
                  onChange={handleChange}
                  label="Chair Head"
                >
                  <MenuItem value="">Select Chair Head</MenuItem>
                  {chairHeads.map((ch) => (
                    <MenuItem key={ch._id} value={ch._id}>
                      {ch.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenAddModal(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddChair} 
            variant="contained" 
            color="primary"
            disabled={loading || !newChair.name}
            startIcon={loading ? null : <AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Adding..." : "Add Chair"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Chair Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Edit Chair</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chair Name"
                name="name"
                value={newChair.name}
                onChange={handleChange}
                required
                variant="outlined"
                autoFocus
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Chair Head</InputLabel>
                <Select
                  name="head"
                  value={newChair.head}
                  onChange={handleChange}
                  label="Chair Head"
                >
                  <MenuItem value="">Select Chair Head</MenuItem>
                  {chairHeads.map((ch) => (
                    <MenuItem key={ch._id} value={ch._id}>
                      {ch.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenEditModal(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditChair} 
            variant="contained" 
            color="primary"
            disabled={loading || !newChair.name}
            startIcon={loading ? null : <EditIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Updating..." : "Update Chair"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Delete Chair</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the chair "{selectedChair?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDeleteModal(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteChair} 
            variant="contained" 
            color="error"
            disabled={loading}
            startIcon={loading ? null : <DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ChairsHF;