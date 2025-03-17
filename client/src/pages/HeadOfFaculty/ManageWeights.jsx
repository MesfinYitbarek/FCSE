import { useEffect, useState } from "react";
import axios from "axios";
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
import api from "../../utils/api";

const ManageWeights = () => {
  const [preferenceWeights, setPreferenceWeights] = useState([]);
  const [courseExperienceWeights, setCourseExperienceWeights] = useState([]);
  const [form, setForm] = useState({ maxWeight: "", interval: "", type: "preference" });
  const [editingId, setEditingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      const prefRes = await api.get("/preference-weights");
      const expRes = await api.get("/course-experience-weights");
      setPreferenceWeights(prefRes.data);
      setCourseExperienceWeights(expRes.data);
    } catch (error) {
      console.error("Error fetching weights", error);
      showNotification("Failed to fetch weights", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { maxWeight, interval, type } = form;
    const url = type === "preference" ? "/preference-weights" : "/course-experience-weights";
    const endpoint = editingId ? `${url}/${editingId}` : url;

    try {
      if (editingId) {
        await api.put(endpoint, { maxWeight, interval });
        showNotification("Weight updated successfully");
      } else {
        await api.post(endpoint, { maxWeight, interval });
        showNotification("Weight created successfully");
      }
      fetchWeights();
      setForm({ maxWeight: "", interval: "", type: "preference" });
      setEditingId(null);
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving weight", error);
      showNotification("Failed to save weight", "error");
    }
  };

  const handleEdit = (weight, type) => {
    setForm({ maxWeight: weight.maxWeight, interval: weight.interval, type });
    setEditingId(weight._id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/${selectedWeight.type === "preference" ? "preference-weights" : "course-experience-weights"}/${selectedWeight._id}`);
      fetchWeights();
      setIsDeleteModalOpen(false);
      showNotification("Weight deleted successfully");
    } catch (error) {
      console.error("Error deleting weight", error);
      showNotification("Failed to delete weight", "error");
    }
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
    setFilterType("");
  };

  const filteredWeights = (weights, type) => {
    return weights
      .filter((weight) => {
        const matchesSearchTerm = weight.maxWeight.toString().includes(searchTerm) || weight.interval.toString().includes(searchTerm);
        const matchesType = filterType ? type === filterType : true;
        return matchesSearchTerm && matchesType;
      })
      .sort((a, b) => {
        if (sortOrder === "asc") {
          return a.maxWeight - b.maxWeight;
        } else {
          return b.maxWeight - a.maxWeight;
        }
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6"
    >
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3, background: 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)' }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              Manage Weights
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage preference and course experience weights
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
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00B0FF 90%)',
                }
              }}
            >
              New Weight
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters and Search */}
      <Box mb={3}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by max weight or interval..."
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
                  <InputLabel>Filter by Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Filter by Type"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="preference">Preference Weights</MenuItem>
                    <MenuItem value="course">Course Experience Weights</MenuItem>
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
                    <IconButton onClick={resetFilters} disabled={!searchTerm && !filterType}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Weights List */}
      {loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {/* Preference Weights */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Preference Weights
              </Typography>
              {filteredWeights(preferenceWeights, "preference").map((weight) => (
                <Card key={weight._id} sx={{ mb: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Max Weight: {weight.maxWeight}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Interval: {weight.interval}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(weight, "preference")}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => {
                            setSelectedWeight({ ...weight, type: "preference" });
                            setIsDeleteModalOpen(true);
                          }}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* Course Experience Weights */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Course Experience Weights
              </Typography>
              {filteredWeights(courseExperienceWeights, "course").map((weight) => (
                <Card key={weight._id} sx={{ mb: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Max Weight: {weight.maxWeight}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Interval: {weight.interval}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(weight, "course")}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => {
                            setSelectedWeight({ ...weight, type: "course" });
                            setIsDeleteModalOpen(true);
                          }}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </>
      )}

      {/* Add Weight Modal */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Weight</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Max Weight"
                  type="number"
                  value={form.maxWeight}
                  onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Interval"
                  type="number"
                  value={form.interval}
                  onChange={(e) => setForm({ ...form, interval: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="preference">Preference Weight</MenuItem>
                    <MenuItem value="course">Course Experience Weight</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setIsAddModalOpen(false)} variant="outlined" color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Weight</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete this weight?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteModalOpen(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
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
        <Alert onClose={closeNotification} severity={notification.type} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default ManageWeights;