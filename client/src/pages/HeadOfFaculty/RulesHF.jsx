import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  Paper, Typography, Grid, Card, CardContent, IconButton, InputAdornment, Box,
  Divider, Skeleton, Alert, Snackbar, Tooltip, Chip, Tab, Tabs,
  Collapse, Fade, CircularProgress, useMediaQuery, useTheme
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Rule as RuleIcon,
  Sort as SortIcon,
  FilterAlt as FilterAltIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const RulesHF = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useSelector((state) => state.auth);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ ruleName: "", description: "", value: "" });
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentTab, setCurrentTab] = useState(0);
  const [expandedRule, setExpandedRule] = useState(null);

  // Fetch all rules
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rules");
      setRules(data);
      showNotification("Rules loaded successfully");
    } catch (error) {
      console.error("Error fetching rules:", error);
      showNotification("Failed to load rules", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewRule({ ...newRule, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setNewRule({ ruleName: "", description: "", value: "" });
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/rules", newRule);
      resetForm();
      await fetchRules();
      setOpenAddModal(false);
      showNotification("Rule added successfully");
    } catch (error) {
      console.error("Error adding rule:", error);
      showNotification("Failed to add rule", "error");
    }
    setLoading(false);
  };

  const handleEditRule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/rules/${selectedRule._id}`, newRule);
      resetForm();
      await fetchRules();
      setOpenEditModal(false);
      showNotification("Rule updated successfully");
    } catch (error) {
      console.error("Error updating rule:", error);
      showNotification("Failed to update rule", "error");
    }
    setLoading(false);
  };

  const handleDeleteRule = async () => {
    setLoading(true);
    try {
      await api.delete(`/rules/${selectedRule._id}`);
      await fetchRules();
      setOpenDeleteModal(false);
      showNotification("Rule deleted successfully");
    } catch (error) {
      console.error("Error deleting rule:", error);
      showNotification("Failed to delete rule", "error");
    }
    setLoading(false);
  };

  const openEditRuleModal = (rule) => {
    setSelectedRule(rule);
    setNewRule({ ruleName: rule.ruleName, description: rule.description || "", value: rule.value || "" });
    setOpenEditModal(true);
  };

  const openDeleteRuleModal = (rule) => {
    setSelectedRule(rule);
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

  const toggleExpandRule = (ruleId) => {
    if (expandedRule === ruleId) {
      setExpandedRule(null);
    } else {
      setExpandedRule(ruleId);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Memoized filtered and sorted rules
  const filteredRules = useMemo(() => {
    let result = rules.filter((rule) => {
      const matchesSearchTerm =
        rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearchTerm;
    });

    // Sort by title
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.title.localeCompare(b.ruleName);
      } else {
        return b.title.localeCompare(a.ruleName);
      }
    });

    return result;
  }, [rules, searchTerm, sortOrder]);

  // Loading skeleton
  if (loading && rules.length === 0) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={120} sx={{ mb: 2 }} />
        ))}
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
              Assignment Rules
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage rules and guidelines for course assignments
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
                background: 'linear-gradient(45deg, #673AB7 30%, #9C27B0 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5E35B1 30%, #8E24AA 90%)',
                }
              }}
            >
              New Rule
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box mb={3}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by title or description..."
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
              <Grid item xs={8} md={3}>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    {filteredRules.length} rules found
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} md={1}>
                <Tooltip ruleName={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}>
                  <IconButton onClick={toggleSortOrder}>
                    <SortIcon color={sortOrder === "desc" ? "primary" : "action"} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              backgroundColor: 'rgba(103, 58, 183, 0.1)',
            }
          }}
        >
          <Tab icon={<RuleIcon />} label="Rules List" />
          <Tab icon={<InfoIcon />} label="About Rules" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {filteredRules.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No rules found matching your search criteria.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {filteredRules.map((rule) => (
                    <Grid item xs={12} key={rule._id}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          sx={{ 
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            transition: 'box-shadow 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                            }
                          }}
                        >
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <RuleIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
                                <Box>
                                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {rule.ruleName}
                                  </Typography>
                                  {isMobile && expandedRule !== rule._id ? (
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                      {rule.description.substring(0, 80)}...
                                    </Typography>
                                  ) : (
                                    <Collapse in={expandedRule === rule._id || !isMobile}>
                                      <Typography variant="body2" color="text.secondary">
                                        {rule.description}
                                      </Typography>
                                    </Collapse>
                                  )}
                                  {isMobile && (
                                    <Button 
                                      size="small" 
                                      onClick={() => toggleExpandRule(rule._id)}
                                      sx={{ mt: 1 }}
                                    >
                                      {expandedRule === rule._id ? 'Show Less' : 'Read More'}
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                              <Box>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    onClick={() => openEditRuleModal(rule)} 
                                    color="primary"
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    onClick={() => openDeleteRuleModal(rule)} 
                                    color="error"
                                    size="small"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      )}

      {currentTab === 1 && (
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
            <Typography variant="h5" fontWeight="bold">
              About Assignment Rules
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography paragraph>
            Assignment rules help ensure consistency and fairness in course assignments.
            These rules define how courses are assigned to instructors based on various factors like
            expertise, workload, and scheduling preferences.
          </Typography>
          <Typography paragraph>
            Rules can specify constraints such as maximum teaching hours, preferred teaching times,
            course expertise requirements, and other important assignment criteria.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography fontWeight="medium">
              Best Practices for Creating Rules:
            </Typography>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Keep rule titles concise and descriptive</li>
              <li>Provide detailed explanations in the description</li>
              <li>Ensure rules are objective and measurable</li>
              <li>Update rules as policies change</li>
            </ul>
          </Alert>
        </Card>
      )}

      {/* Add Rule Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Add New Rule</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Title"
                name="ruleName"
                value={newRule.ruleName}
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
                label="Value(if there is)and should be Number"
                name="value"
                value={newRule.value}
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
                label="Rule Description"
                name="description"
                value={newRule.description}
                onChange={handleChange}
                multiline
                rows={6}
                required
                variant="outlined"
                placeholder="Provide a detailed description of the rule and its application..."
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
            onClick={handleAddRule} 
            variant="contained" 
            color="primary"
            disabled={loading || !newRule.ruleName || !newRule.description}
            startIcon={loading ? null : <AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Adding..." : "Add Rule"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Rule Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Edit Rule</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Title"
                name="ruleName"
                value={newRule.ruleName}
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
                label="Rule Description"
                name="description"
                value={newRule.description}
                onChange={handleChange}
                multiline
                rows={6}
                required
                variant="outlined"
                placeholder="Provide a detailed description of the rule and its application..."
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
            onClick={handleEditRule} 
            variant="contained" 
            color="primary"
            disabled={loading || !newRule.ruleName || !newRule.description}
            startIcon={loading ? null : <EditIcon />}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Updating..." : "Update Rule"}
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
          <Typography variant="h6" fontWeight="bold">Delete Rule</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the rule "{selectedRule?.ruleName}"?
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
            onClick={handleDeleteRule} 
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

export default RulesHF;