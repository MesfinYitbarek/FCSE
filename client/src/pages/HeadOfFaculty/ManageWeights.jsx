import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Paper, Typography, Grid, Card, CardContent, IconButton, Box,
  Skeleton, Alert, Snackbar, Tooltip
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../utils/api";

const ManageWeights = () => {
  const [preferenceWeights, setPreferenceWeights] = useState([]);
  const [courseExperienceWeights, setCourseExperienceWeights] = useState([]);
  const [form, setForm] = useState({ maxWeight: "", interval: "", type: "preference" });
  const [editingId, setEditingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6"
    >
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3, background: 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Manage Weights
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and edit preference and course experience weights
        </Typography>
      </Paper>

      {/* Weights List */}
      {loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {/* Preference Weights */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Preference Weights
            </Typography>
            {preferenceWeights.map((weight) => (
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
            {courseExperienceWeights.map((weight) => (
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