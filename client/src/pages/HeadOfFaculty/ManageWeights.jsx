import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem,
  Paper, Typography, Grid, Card, CardContent, IconButton, InputAdornment, Box,
  FormControl, InputLabel, Divider, Skeleton, Alert, Snackbar, Tooltip
} from "@mui/material";
import {
  Edit as EditIcon,
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    try {
      await api.put(`${url}/${editingId}`, { maxWeight, interval });
      showNotification("Weight updated successfully");
      fetchWeights();
      setForm({ maxWeight: "", interval: "", type: "preference" });
      setEditingId(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating weight", error);
      showNotification("Failed to update weight", "error");
    }
  };

  const handleEdit = (weight, type) => {
    setForm({ maxWeight: weight.maxWeight, interval: weight.interval, type });
    setEditingId(weight._id);
    setIsEditModalOpen(true);
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
              View and edit preference and course experience weights
            </Typography>
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
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </>
      )}

      {/* Edit Weight Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Weight</DialogTitle>
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
                <Typography variant="body2" color="text.secondary">
                  Type: {form.type === "preference" ? "Preference Weight" : "Course Experience Weight"}
                </Typography>
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setIsEditModalOpen(false)} variant="outlined" color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Update
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
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