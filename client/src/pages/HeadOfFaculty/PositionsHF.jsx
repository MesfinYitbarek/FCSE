import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem,
  Paper, Typography, Grid, Card, CardContent, Chip, IconButton, InputAdornment, Box,
  FormControl, InputLabel, Divider, Skeleton, Alert, Snackbar, Tooltip, Slider, Stack,
  Badge, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  TablePagination,
  TableSortLabel
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Work as WorkIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const PositionsHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState({ name: "", exemption: 0 });
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [workloadRange, setWorkloadRange] = useState([0, 100]);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [maxWorkload, setMaxWorkload] = useState(100);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/positions");
      setPositions(data);
      
      // Determine maximum workload for filter slider
      if (data.length > 0) {
        const maxExemption = Math.max(...data.map(p => p.exemption));
        setMaxWorkload(maxExemption > 0 ? maxExemption : 100);
        setWorkloadRange([0, maxExemption > 0 ? maxExemption : 100]);
      }
      
      showNotification("Positions loaded successfully");
    } catch (error) {
      console.error("Error fetching positions:", error);
      showNotification("Failed to load positions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewPosition({ ...newPosition, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setNewPosition({ name: "", exemption: 0 });
  };

  const handleAddPosition = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/positions", newPosition);
      resetForm();
      await fetchPositions();
      setOpenAddModal(false);
      showNotification("Position added successfully");
    } catch (error) {
      console.error("Error adding position:", error);
      showNotification("Failed to add position", "error");
    }
    setLoading(false);
  };

  const handleEditPosition = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/positions/${selectedPosition._id}`, newPosition);
      resetForm();
      await fetchPositions();
      setOpenEditModal(false);
      showNotification("Position updated successfully");
    } catch (error) {
      console.error("Error updating position:", error);
      showNotification("Failed to update position", "error");
    }
    setLoading(false);
  };

  const handleDeletePosition = async () => {
    setLoading(true);
    try {
      await api.delete(`/positions/${selectedPosition._id}`);
      await fetchPositions();
      setOpenDeleteModal(false);
      showNotification("Position deleted successfully");
    } catch (error) {
      console.error("Error deleting position:", error);
      showNotification("Failed to delete position", "error");
    }
    setLoading(false);
  };

  const openEditPositionModal = (position) => {
    setSelectedPosition(position);
    setNewPosition({ name: position.name, exemption: position.exemption });
    setOpenEditModal(true);
  };

  const openDeletePositionModal = (position) => {
    setSelectedPosition(position);
    setOpenDeleteModal(true);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ open: true, message, type });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleWorkloadRangeChange = (event, newValue) => {
    setWorkloadRange(newValue);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setWorkloadRange([0, maxWorkload]);
    setSortConfig({ key: 'name', direction: 'asc' });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleFiltersExpanded = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Memoized filtered and sorted positions
  const filteredPositions = useMemo(() => {
    let result = positions.filter((position) => {
      const matchesSearchTerm = position.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkload = position.exemption >= workloadRange[0] && position.exemption <= workloadRange[1];
      return matchesSearchTerm && matchesWorkload;
    });

    // Sort based on current sort configuration
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [positions, searchTerm, workloadRange, sortConfig]);

  // Paginated positions
  const paginatedPositions = useMemo(() => {
    return filteredPositions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPositions, page, rowsPerPage]);

  // Loading skeleton
  if (loading && positions.length === 0) {
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
              Positions
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage academic positions and workload exemptions
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
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                }
              }}
            >
              New Position
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={toggleFiltersExpanded}>
              <FilterIcon color={filtersExpanded ? "primary" : "action"} />
            </IconButton>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by position name..."
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
            
            {filtersExpanded && (
              <Grid item xs={12} md={6}>
                <Box sx={{ px: 2 }}>
                  <Typography id="workload-slider" gutterBottom>
                    Workload Exemption Range: {workloadRange[0]} - {workloadRange[1]} hours
                  </Typography>
                  <Slider
                    value={workloadRange}
                    onChange={handleWorkloadRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={maxWorkload}
                    aria-labelledby="workload-slider"
                  />
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
                disabled={!searchTerm && workloadRange[0] === 0 && workloadRange[1] === maxWorkload}
                size="small"
              >
                Reset Filters
              </Button>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredPositions.length} of {positions.length} positions
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredPositions.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No positions found matching your search criteria.
            </Alert>
          ) : (
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'name'}
                          direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                          onClick={() => requestSort('name')}
                        >
                          Position Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'exemption'}
                          direction={sortConfig.key === 'exemption' ? sortConfig.direction : 'asc'}
                          onClick={() => requestSort('exemption')}
                        >
                          Workload Exemption
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPositions.map((position) => (
                      <TableRow 
                        key={position._id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="body1" fontWeight="medium">
                            {position.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<WorkIcon />} 
                            label={`${position.exemption} hours`}
                            color={position.exemption > 20 ? "success" : "default"}
                            variant={position.exemption > 20 ? "filled" : "outlined"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              color="primary"
                              onClick={() => openEditPositionModal(position)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              color="error"
                              onClick={() => openDeletePositionModal(position)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredPositions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Card>
          )}
        </>
      )}

      {/* Add Position Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Add New Position</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position Name"
                name="name"
                value={newPosition.name}
                onChange={handleChange}
                required
                variant="outlined"
                autoFocus
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workload Exemption (hours)"
                name="exemption"
                type="number"
                value={newPosition.exemption}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                }}
              />
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
            onClick={handleAddPosition} 
            variant="contained" 
            color="primary"
            disabled={loading || !newPosition.name || newPosition.exemption < 0}
            startIcon={loading ? null : <AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Adding..." : "Add Position"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Position Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Edit Position</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position Name"
                name="name"
                value={newPosition.name}
                onChange={handleChange}
                required
                variant="outlined"
                autoFocus
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workload Exemption (hours)"
                name="exemption"
                type="number"
                value={newPosition.exemption}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                }}
              />
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
            onClick={handleEditPosition} 
            variant="contained" 
            color="primary"
            disabled={loading || !newPosition.name || newPosition.exemption < 0}
            startIcon={loading ? null : <EditIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Updating..." : "Update Position"}
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
          <Typography variant="h6" fontWeight="bold">Delete Position</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the position "{selectedPosition?.name}"?
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
            onClick={handleDeletePosition} 
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

export default PositionsHF;