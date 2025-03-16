import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Divider,
  useTheme,
} from "@mui/material";

const PreferenceForm = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [preferenceForms, setPreferenceForms] = useState([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    semester: "Regular 1",
    maxPreferences: 5,
    submissionStart: "",
    submissionEnd: "",
    courses: [],
    instructors: [],
  });
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  
  // Filter states
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterSemester, setFilterSemester] = useState("");
  const [filterChair, setFilterChair] = useState(user.chair);
  const [isFiltered, setIsFiltered] = useState(false);
  const [chairs, setChairs] = useState([]);

  // Get available years for the filter dropdown
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Fetch available chairs (for admin users) 
  useEffect(() => {
    const fetchChairs = async () => {
      try {
        const { data } = await api.get("/chairs");
        setChairs(data);
      } catch (error) {
        console.error("Error fetching chairs:", error);
      }
    };
    
    if (user.role === "admin") {
      fetchChairs();
    }
  }, [user.role]);

  // Fetch courses and instructors on component mount
  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchPreferenceForms = async () => {
    setFetchingData(true);
    try {
      const { data } = await api.get(
        `/preference-forms/filter?year=${filterYear}&semester=${filterSemester}&chair=${filterChair}`
      );
      setPreferenceForms(Array.isArray(data) ? data : []);
      setIsFiltered(true);
    } catch (error) {
      console.error("Error fetching preference forms:", error);
      setPreferenceForms([]);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get(`/courses/${filterChair || user.chair}`);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data } = await api.get(`/users/users/${filterChair || user.chair}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle course selection
  const handleCourseSelection = (courseId) => {
    const updatedCourses = formData.courses.includes(courseId)
      ? formData.courses.filter((id) => id !== courseId)
      : [...formData.courses, courseId];
    setFormData({ ...formData, courses: updatedCourses });
  };

  // Handle instructor selection
  const handleInstructorSelection = (instructorId) => {
    const updatedInstructors = formData.instructors.includes(instructorId)
      ? formData.instructors.filter((id) => id !== instructorId)
      : [...formData.instructors, instructorId];
    setFormData({ ...formData, instructors: updatedInstructors });
  };

  // Reset filters
  const resetFilters = () => {
    setFilterYear(new Date().getFullYear());
    setFilterSemester("");
    setFilterChair(user.chair);
    setIsFiltered(false);
  };

  // Handle creating or updating a preference form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedForm) {
        await api.put(`/preference-forms/${selectedForm._id}`, formData);
      } else {
        await api.post("/preference-forms", { ...formData, chair: filterChair || user.chair });
      }
      setOpenModal(false);
      setFormData({
        year: new Date().getFullYear(),
        semester: "Regular 1",
        maxPreferences: 5,
        submissionStart: "",
        submissionEnd: "",
        courses: [],
        instructors: [],
      });
      setSelectedForm(null);
      
      // Refresh the list with current filters
      if (isFiltered) {
        fetchPreferenceForms();
      }
    } catch (error) {
      console.error("Error saving preference form:", error);
    }
    setLoading(false);
  };

  // Open edit modal and pre-fill form
  const openEditFormModal = (form) => {
    setSelectedForm(form);
    setFormData({
      year: form.year,
      semester: form.semester,
      maxPreferences: form.maxPreferences,
      submissionStart: form.submissionStart,
      submissionEnd: form.submissionEnd,
      courses: form.courses.map(course => course._id || course),
      instructors: form.instructors.map(instructor => instructor._id || instructor),
    });
    setOpenModal(true);
  };

  // Open delete confirmation modal
  const openDeleteFormModal = (form) => {
    setSelectedForm(form);
    if (window.confirm("Are you sure you want to delete this form?")) {
      handleDeleteForm(form._id);
    }
  };

  // Handle deleting a form
  const handleDeleteForm = async (formId) => {
    setLoading(true);
    try {
      await api.delete(`/preference-forms/${formId}`);
      if (isFiltered) {
        fetchPreferenceForms();
      }
    } catch (error) {
      console.error("Error deleting preference form:", error);
    }
    setLoading(false);
  };

  // Handle search button click
  const handleSearch = () => {
    fetchPreferenceForms();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Course Preference Forms
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* Search and Filter Section */}
      <Card 
        elevation={2} 
        sx={{ 
          mb: 4, 
          p: 3, 
          background: `linear-gradient(to right, ${theme.palette.primary.light}11, ${theme.palette.background.paper})` 
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Filter Preference Forms
        </Typography>
        
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                label="Academic Year"
              >
                {availableYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Semester</InputLabel>
              <Select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                label="Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                <MenuItem value="Regular 1">Regular 1</MenuItem>
                <MenuItem value="Regular 2">Regular 2</MenuItem>
                <MenuItem value="Summer">Summer</MenuItem>
                <MenuItem value="Extension">Extension</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {user.role === "admin" && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterChair}
                  onChange={(e) => setFilterChair(e.target.value)}
                  label="Department"
                >
                  {chairs.map(chair => (
                    <MenuItem key={chair._id} value={chair._id}>{chair.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={user.role === "admin" ? 3 : 6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleSearch}
                disabled={fetchingData}
              >
                {fetchingData ? <CircularProgress size={24} /> : "Search"}
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            setSelectedForm(null);
            setFormData({
              year: new Date().getFullYear(),
              semester: "Regular 1",
              maxPreferences: 5,
              submissionStart: "",
              submissionEnd: "",
              courses: [],
              instructors: [],
            });
            setOpenModal(true);
          }}
        >
          Create Preference Form
        </Button>
        
        {isFiltered && (
          <Chip 
            label={`Showing ${preferenceForms.length} forms`} 
            color="primary" 
            variant="outlined"
          />
        )}
      </Box>

      {/* Preference Forms Table */}
      {isFiltered && (
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            {fetchingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : preferenceForms.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.light + '22' }}>
                      <TableCell><Typography fontWeight="bold">Year</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Semester</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Max Preferences</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Submission Period</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preferenceForms.map((form) => {
                      const now = new Date();
                      const startDate = new Date(form.submissionStart);
                      const endDate = new Date(form.submissionEnd);
                      let status = "Upcoming";
                      
                      if (now > endDate) status = "Closed";
                      else if (now >= startDate) status = "Active";
                      
                      return (
                        <TableRow key={form._id} hover>
                          <TableCell>{form.year}</TableCell>
                          <TableCell>{form.semester}</TableCell>
                          <TableCell>{form.maxPreferences}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(form.submissionStart).toLocaleDateString()} - {new Date(form.submissionEnd).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={status} 
                              color={
                                status === "Active" ? "success" : 
                                status === "Upcoming" ? "info" : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => openEditFormModal(form)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => openDeleteFormModal(form)}
                              size="small"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No preference forms found for the selected filters.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Creation/Edit Dialog */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedForm ? "Edit Preference Form" : "Create Preference Form"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Semester</InputLabel>
                <Select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  label="Semester"
                  required
                >
                  <MenuItem value="Regular 1">Regular 1</MenuItem>
                  <MenuItem value="Regular 2">Regular 2</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Extension">Extension</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="dense"
                label="Max Preferences"
                name="maxPreferences"
                type="number"
                value={formData.maxPreferences}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="dense"
                label="Submission Start Date"
                name="submissionStart"
                type="datetime-local"
                value={formData.submissionStart}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="dense"
                label="Submission End Date"
                name="submissionEnd"
                type="datetime-local"
                value={formData.submissionEnd}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                Select Courses
              </Typography>
              <Box sx={{ maxHeight: '200px', overflowY: 'auto', p: 1 }}>
                <Grid container spacing={1}>
                  {courses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course._id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.courses.includes(course._id)}
                            onChange={() => handleCourseSelection(course._id)}
                          />
                        }
                        label={course.name}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                Select Instructors
              </Typography>
              <Box sx={{ maxHeight: '200px', overflowY: 'auto', p: 1 }}>
                <Grid container spacing={1}>
                  {instructors.map((instructor) => (
                    <Grid item xs={12} sm={6} md={4} key={instructor._id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.instructors.includes(instructor._id)}
                            onChange={() => handleInstructorSelection(instructor._id)}
                          />
                        }
                        label={instructor.fullName}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : selectedForm ? (
              "Update Form"
            ) : (
              "Create Form"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PreferenceForm;