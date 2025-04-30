import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Info,
  Calendar,
  BookOpen,
  User,
  Clock,
  FileText,
  Layers,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  BarChart2,
  Bell,
  Search,
  School,
  Menu,
  Filter,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Format number to 2 decimal places
const formatNumber = (number) => {
  if (number === undefined || number === null) return 'N/A';
  return Number(number).toFixed(2);
};

const ReportDetailCOC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Main state
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('instructor'); // 'instructor' or 'chair'
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reports/${id}`);
        setReport(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching report details');
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);
  
  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, searchField]);
  
  // Delete report handler
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/reports/${id}`);
      navigate('/reports', { state: { message: 'Report deleted successfully' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
  
  // Group assignments by instructor
  const assignmentsByInstructor = useMemo(() => {
    return report?.assignments?.reduce((acc, assignment) => {
      assignment.assignments.forEach(assign => {
        const instructorId = assign.instructorId._id;
        if (!acc[instructorId]) {
          acc[instructorId] = {
            instructor: assign.instructorId,
            assignments: []
          };
        }
        acc[instructorId].assignments.push({
          ...assign,
          course: assign.courseId,
          assignment: assignment
        });
      });
      return acc;
    }, {}) || {};
  }, [report]);

  // Prepare all assignments (flat list) for the "All Assignments" tab
  const allAssignments = useMemo(() => {
    return report?.assignments?.flatMap(assignment => 
      assignment.assignments.map(assign => ({
        ...assign,
        course: assign.courseId,
        assignment: assignment,
        instructorName: assign.instructorId.name,
        chair: assign.instructorId.chair || 'Not Assigned'
      }))
    ) || [];
  }, [report]);

  // Search and filter functionality
  const filteredInstructors = useMemo(() => {
    if (!searchTerm) return Object.values(assignmentsByInstructor);
    
    return Object.values(assignmentsByInstructor).filter(({ instructor }) => {
      const searchIn = searchField === 'instructor' 
        ? (instructor.fullName || '').toLowerCase() 
        : (instructor.chair || '').toLowerCase();
      
      return searchIn.includes(searchTerm.toLowerCase());
    });
  }, [assignmentsByInstructor, searchTerm, searchField]);
  
  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return allAssignments;
    
    return allAssignments.filter(assignment => {
      const searchIn = searchField === 'instructor'
        ? (assignment.instructorId.fullName || '').toLowerCase()
        : (assignment.instructorId.chair || '').toLowerCase();
      
      return searchIn.includes(searchTerm.toLowerCase());
    });
  }, [allAssignments, searchTerm, searchField]);
  
  // Pagination logic
  const paginatedInstructors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInstructors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInstructors, currentPage, itemsPerPage]);
  
  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAssignments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAssignments, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalInstructorPages = Math.ceil(filteredInstructors.length / itemsPerPage);
  const totalAssignmentPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  
  // Calculate metrics
  const totalWorkload = useMemo(() => 
    allAssignments.reduce((total, a) => total + a.workload, 0)
  , [allAssignments]);
  
  const uniqueCourses = useMemo(() => 
    new Set(allAssignments.map(a => a.course?.code)).size
  , [allAssignments]);
  
  const totalInstructors = useMemo(() => 
    Object.keys(assignmentsByInstructor).length
  , [assignmentsByInstructor]);

  // Initialize workload chart 
  useEffect(() => {
    if (activeTab === 'overview' && report && allAssignments.length > 0) {
      // Function to dynamically load Chart.js
      const initializeChart = async () => {
        try {
          // Dynamic import Chart.js/auto which registers all components
          const { Chart, registerables } = await import('chart.js/auto');
          
          // Get top 5 instructors by workload
          const topInstructors = Object.values(assignmentsByInstructor)
            .map(({ instructor, assignments }) => ({
              name: instructor.fullName || 'Unknown',
              workload: assignments.reduce((total, a) => total + a.workload, 0)
            }))
            .sort((a, b) => b.workload - a.workload)
            .slice(0, 5);
          
          // Get colors for chart
          const isDarkMode = document.documentElement.classList.contains('dark');
          const backgroundColors = isDarkMode 
            ? ['rgba(129, 140, 248, 0.8)', 'rgba(96, 165, 250, 0.8)', 'rgba(147, 197, 253, 0.8)', 
               'rgba(192, 132, 252, 0.8)', 'rgba(244, 114, 182, 0.8)']
            : ['rgba(79, 70, 229, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 
               'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'];
          
          // Get the canvas element
          const ctx = document.getElementById('workloadChart');
          if (!ctx) return;
          
          // Check for existing chart and destroy it
          if (Chart.getChart(ctx)) {
            Chart.getChart(ctx).destroy();
          }
          
          // Create new chart
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: topInstructors.map(i => i.name),
              datasets: [{
                label: 'Workload',
                data: topInstructors.map(i => i.workload),
                backgroundColor: backgroundColors,
                borderColor: 'transparent',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 40
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `Workload: ${formatNumber(context.raw)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
                  },
                  ticks: {
                    color: isDarkMode ? '#D1D5DB' : '#4B5563',
                    callback: function(value) {
                      return formatNumber(value);
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    color: isDarkMode ? '#D1D5DB' : '#4B5563'
                  }
                }
              }
            }
          });
        } catch (error) {
          console.error("Error initializing chart:", error);
          // Chart initialization failed, but the fallback table will still show
        }
      };
      
      // Call the async function
      initializeChart();
    }
  }, [activeTab, report, allAssignments, assignmentsByInstructor]);

  // Update chart when color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleColorSchemeChange = () => {
      if (activeTab === 'overview') {
        // Force re-render by switching the tab which will trigger the chart recreation
        const currentTab = activeTab;
        setActiveTab('dummy');
        setTimeout(() => setActiveTab(currentTab), 10);
      }
    };
    
    mediaQuery.addEventListener('change', handleColorSchemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, [activeTab]);
  
  // Handle page change
  const changePage = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="h-full flex justify-center items-center p-8">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading report details...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-5 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 dark:text-red-400 mr-3 flex-shrink-0" size={24} />
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
            <div className="mt-4">
              <Link to="/reports">
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Reports
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render not found state
  if (!report) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-700 p-5 rounded-lg shadow">
            <div className="flex items-center">
              <Info className="text-yellow-500 dark:text-yellow-400 mr-3 flex-shrink-0" size={24} />
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">Report not found</p>
            </div>
            <div className="mt-4">
              <Link to="/reports">
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Reports
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Pagination controls for current tab
  const totalPages = activeTab === 'instructors' ? totalInstructorPages : totalAssignmentPages;
  const currentItems = activeTab === 'instructors' ? filteredInstructors.length : filteredAssignments.length;
  
  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-b-lg gap-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, currentItems)}</span>
            {' '} to {' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, currentItems)}</span>
            {' '} of {' '}
            <span className="font-medium">{currentItems}</span> results
          </span>
          <span className="sm:hidden">
            Page {currentPage} of {totalPages}
          </span>
          
          <div className="ml-4">
            <label htmlFor="itemsPerPage" className="mr-2">Per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1 text-sm leading-tight focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between sm:justify-end">
          <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400`}
              aria-label="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400`}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {startPage > 1 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                ...
              </span>
            )}
            
            {pages.map(page => (
              <button
                key={page}
                onClick={() => changePage(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  page === currentPage
                    ? 'z-10 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-600 text-indigo-600 dark:text-indigo-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                } text-sm font-medium`}
              >
                {page}
              </button>
            ))}
            
            {endPage < totalPages && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                ...
              </span>
            )}
            
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400`}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400`}
              aria-label="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    );
  };
  
  // Search and filter component
  const renderSearchAndFilters = () => {
    if (activeTab === 'overview') return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-grow w-full md:w-auto max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder={`Search by ${searchField === 'instructor' ? 'instructor name' : 'chair'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base shadow-sm"
              aria-label="Search"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="w-full md:w-auto flex flex-wrap gap-2">
            <div className="inline-flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setSearchField('instructor')}
                className={`px-4 py-2 text-sm font-medium ${
                  searchField === 'instructor'
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Instructor
              </button>
              <button
                onClick={() => setSearchField('chair')}
                className={`px-4 py-2 text-sm font-medium ${
                  searchField === 'chair'
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Chair
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors"
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
                  <select
                    id="program-filter"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="">All Programs</option>
                    {/* Add program options dynamically */}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="semester-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                  <select
                    id="semester-filter"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="">All Semesters</option>
                    {/* Add semester options dynamically */}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                  <select
                    id="sort-by"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="workload_desc">Workload (High-Low)</option>
                    <option value="workload_asc">Workload (Low-High)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Show active filters */}
        {searchTerm && (
          <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span>Active Filter:</span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
              {searchField === 'instructor' ? 'Instructor' : 'Chair'}: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1.5 inline-flex rounded-full focus:outline-none"
                aria-label="Remove filter"
              >
                <X className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 md:py-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold leading-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="text-indigo-600 dark:text-indigo-400 h-5 w-5 md:h-6 md:w-6" />
                      Report for {report.year}
                      {report.semester && <span className="hidden sm:inline"> • {report.semester}</span>}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Created</span> {new Date(report.createdAt).toLocaleDateString()} 
                      <span className="hidden sm:inline">by {report.generatedBy || 'System'}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Desktop actions */}
              <div className="hidden md:flex md:items-center md:space-x-3">
                <Link to={`/reports/${id}/edit`}>
                  <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition shadow-sm">
                    <Edit className="mr-2" size={16} aria-hidden="true" />
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none transition"
                >
                  <Trash2 className="mr-2" size={16} aria-hidden="true" />
                  Delete
                </button>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Menu"
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            
            {/* Mobile actions dropdown */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 absolute right-4 z-20 mt-2 w-48"
                >
                  <div className="py-1">
                    <Link to={`/reports/${id}/edit`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center">
                        <Edit className="mr-2" size={16} aria-hidden="true" />
                        Edit Report
                      </div>
                    </Link>
                    <button 
                      onClick={() => {
                        setConfirmDelete(true);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <Trash2 className="mr-2" size={16} aria-hidden="true" />
                        Delete Report
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Delete confirmation dialog */}
            <AnimatePresence>
              {confirmDelete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setConfirmDelete(false);
                    }
                  }}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                      <AlertCircle size={48} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">Delete Report</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                      Are you sure you want to delete this report? This action cannot be undone.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition flex items-center"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={16} aria-hidden="true" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2" size={16} aria-hidden="true" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Tabs navigation */}
            <div className="mt-4 md:mt-5 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  aria-current={activeTab === 'overview' ? 'page' : undefined}
                >
                  <BarChart2 className="mr-2 h-5 w-5" aria-hidden="true" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('instructors')}
                  className={`${
                    activeTab === 'instructors'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  aria-current={activeTab === 'instructors' ? 'page' : undefined}
                >
                  <Users className="mr-2 h-5 w-5" aria-hidden="true" />
                  By Instructor
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`${
                    activeTab === 'assignments'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  aria-current={activeTab === 'assignments' ? 'page' : undefined}
                >
                  <Layers className="mr-2 h-5 w-5" aria-hidden="true" />
                  All Assignments
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Search and filter section */}
          {renderSearchAndFilters()}
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <motion.div 
                  variants={slideUp}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-md p-3">
                        <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Instructors</p>
                        <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">{totalInstructors}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={slideUp}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-md p-3">
                        <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Courses</p>
                        <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">{uniqueCourses}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={slideUp}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-md p-3">
                        <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workload</p>
                        <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">{formatNumber(totalWorkload)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Report details */}
              <motion.div 
                variants={slideUp}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    Report Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Details and metadata about this report.
                  </p>
                </div>
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Year</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        {report.year}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Semester</dt>
                      <dd className="mt-1 text-sm flex items-center">
                        <School className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        {report.semester ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                            {report.semester}
                          </span>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">All Semesters</span>
                        )}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</dt>
                      <dd className="mt-1 text-sm flex items-center">
                        <Layers className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        {report.program ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            {report.program}
                          </span>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">All Programs</span>
                        )}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        {report.generatedBy || 'System'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created On</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        {new Date(report.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        {new Date(report.updatedAt || report.createdAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
              
              {/* Notes section */}
              {report.note && (
                <motion.div 
                  variants={slideUp}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="px-4 py-4 sm:px-6 sm:py-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                      <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      Notes
                    </h3>
                  </div>
                  <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{report.note}</p>
                  </div>
                </motion.div>
              )}

              {/* Charts Section */}
              <motion.div 
                variants={slideUp}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    Workload Analysis
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Visual representation of workload distribution by instructor.
                  </p>
                </div>
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  {allAssignments.length > 0 ? (
                    <>
                      <div className="h-64 md:h-80 relative" id="chart-container">
                        <canvas id="workloadChart" aria-label="Workload chart" role="img"></canvas>
                      </div>
                      
                      {/* Fallback table for top instructors by workload */}
                      <div className="mt-6 overflow-hidden">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top Instructors by Workload</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Workload</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {Object.values(assignmentsByInstructor)
                                .map(({ instructor, assignments }) => ({
                                  name: instructor.fullName || 'Unknown',
                                  workload: assignments.reduce((total, a) => total + a.workload, 0)
                                }))
                                .sort((a, b) => b.workload - a.workload)
                                .slice(0, 5)
                                .map((instructor, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{instructor.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{formatNumber(instructor.workload)}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                      <p>No workload data available to display.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Instructors Tab */}
          {activeTab === 'instructors' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {filteredInstructors.length === 0 ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg flex items-center border border-indigo-100 dark:border-indigo-800">
                  <Info className="text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" size={20} aria-hidden="true" />
                  <p className="text-indigo-700 dark:text-indigo-300">
                    {Object.keys(assignmentsByInstructor).length === 0
                      ? "No instructor assignments found in this report"
                      : "No instructors match your search criteria"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedInstructors.map(({ instructor, assignments }, index) => (
                    <motion.div 
                      key={instructor._id}
                      variants={slideUp}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium text-lg shadow">
                                {instructor.fullName?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                {instructor.fullName || 'Unknown Instructor'}
                              </h3>
                              <div className="mt-1 flex flex-wrap gap-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <User className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                                  {instructor.email || 'No email available'}
                                </p>
                                {instructor.chair && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    Chair: {instructor.chair}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="sm:text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                              Total Workload: {formatNumber(assignments.reduce((total, a) => total + a.workload, 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile view */}
                      <div className="md:hidden px-4 py-4 space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
                        {assignments.map((assignment, idx) => (
                          <div key={idx} className="pt-4 first:pt-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                                  {assignment.course?.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{assignment.course?.code}</p>
                              </div>
                              <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full px-2.5 py-0.5">
                                WL: {formatNumber(assignment.workload)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Section:</span>
                                <span className="ml-1.5 text-gray-700 dark:text-gray-300 font-medium">{assignment.section || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Lab:</span>
                                <span className="ml-1.5 text-gray-700 dark:text-gray-300 font-medium">{assignment.labDivision || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                                <span className="ml-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                    {assignment.assignment.semester}
                                  </span>
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Program:</span>
                                <span className="ml-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    {assignment.assignment.program}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Desktop view */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lab</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Program</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Workload</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {assignments.map((assignment, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center">
                                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.course?.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.course?.code}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.section || 'N/A'}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.labDivision || 'N/A'}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    {assignment.assignment.program}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                    {assignment.assignment.semester}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                                  {formatNumber(assignment.workload)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                              <td colSpan="5" className="px-4 py-2 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                                Total Workload:
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900 dark:text-white">
                                {formatNumber(assignments.reduce((total, a) => total + a.workload, 0))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Pagination */}
                  {renderPagination()}
                </div>
              )}
            </motion.div>
          )}
          
          {/* All Assignments Tab */}
          {activeTab === 'assignments' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {filteredAssignments.length === 0 ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg flex items-center border border-indigo-100 dark:border-indigo-800">
                  <Info className="text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" size={20} aria-hidden="true" />
                  <p className="text-indigo-700 dark:text-indigo-300">
                    {allAssignments.length === 0
                      ? "No assignments found in this report"
                      : "No assignments match your search criteria"
                    }
                  </p>
                </div>
              ) : (
                <motion.div 
                  variants={slideUp}
                  className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        All Assignments
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold">{paginatedAssignments.length}</span> of <span className="font-semibold">{filteredAssignments.length}</span> assignments
                      </p>
                    </div>
                    <div>
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile view */}
                  <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedAssignments.map((assignment, idx) => (
                      <div key={idx} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{assignment.course?.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.course?.code}</p>
                          </div>
                          <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full px-2.5 py-0.5">
                            WL: {formatNumber(assignment.workload)}
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                          {assignment.instructorId.fullName}
                          {assignment.instructorId.chair && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                              {assignment.instructorId.chair}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Section:</span>
                            <span className="ml-1.5 text-gray-700 dark:text-gray-300">{assignment.section || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Lab:</span>
                            <span className="ml-1.5 text-gray-700 dark:text-gray-300">{assignment.labDivision || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                            <span className="ml-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                {assignment.assignment.semester}
                              </span>
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Program:</span>
                            <span className="ml-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                {assignment.assignment.program}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Total Workload:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatNumber(totalWorkload)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop view */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Chair</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section/Lab</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Program</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                          <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Workload</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedAssignments.map((assignment, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.course?.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.course?.code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {assignment.instructorId.fullName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.instructorId.fullName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {assignment.instructorId.chair ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                  {assignment.instructorId.chair}
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Not Assigned</span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">Section: {assignment.section || 'N/A'}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Lab: {assignment.labDivision || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                {assignment.assignment.program}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                {assignment.assignment.semester}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                              {formatNumber(assignment.workload)}
                            </td>
                          </tr>
                        ))}
                        
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan="6" className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                            Total Workload:
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                            {formatNumber(totalWorkload)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {renderPagination()}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailCOC;