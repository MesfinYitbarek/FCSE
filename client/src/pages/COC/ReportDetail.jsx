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
  Users,
  BarChart2,
  Bell,
  Search,
  School,
  Menu,
  Filter,
  X,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  FileBarChart2,
  Coffee,
  ChevronLeft,
  ChevronRight,
  FileCheck2
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
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    workloadMin: '',
    workloadMax: '',
    program: 'all',
    semester: 'all',
    chair: 'all'
  });
  
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
  }, [activeTab, searchTerm, searchField, filterOptions, sortConfig]);
  
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
        instructorName: assign.instructorId.fullName || assign.instructorId.name,
        chair: assign.instructorId.chair || 'Not Assigned'
      }))
    ) || [];
  }, [report]);

  // Get unique values for filters
  const uniqueValues = useMemo(() => {
    if (!allAssignments.length) return { chairs: [], programs: [], semesters: [] };
    
    const chairs = new Set(allAssignments.map(a => a.instructorId.chair).filter(Boolean));
    const programs = new Set(allAssignments.map(a => a.assignment.program).filter(Boolean));
    const semesters = new Set(allAssignments.map(a => a.assignment.semester).filter(Boolean));
    
    return {
      chairs: Array.from(chairs),
      programs: Array.from(programs),
      semesters: Array.from(semesters)
    };
  }, [allAssignments]);

  // Search and filter functionality for instructors
  const filteredInstructors = useMemo(() => {
    let filtered = Object.values(assignmentsByInstructor);
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(({ instructor }) => {
        const searchLower = searchTerm.toLowerCase();
        
        if (searchField === 'instructor') {
          return (instructor.fullName || '').toLowerCase().includes(searchLower);
        } else if (searchField === 'chair') {
          return (instructor.chair || '').toLowerCase().includes(searchLower);
        }
        return false;
      });
    }
    
    // Apply workload range filter
    if (filterOptions.workloadMin || filterOptions.workloadMax) {
      filtered = filtered.filter(({ assignments }) => {
        const totalWorkload = assignments.reduce((sum, a) => sum + (parseFloat(a.workload) || 0), 0);
        let match = true;
        
        if (filterOptions.workloadMin && !isNaN(parseFloat(filterOptions.workloadMin))) {
          match = match && totalWorkload >= parseFloat(filterOptions.workloadMin);
        }
        
        if (filterOptions.workloadMax && !isNaN(parseFloat(filterOptions.workloadMax))) {
          match = match && totalWorkload <= parseFloat(filterOptions.workloadMax);
        }
        
        return match;
      });
    }
    
    // Apply chair filter
    if (filterOptions.chair !== 'all') {
      filtered = filtered.filter(({ instructor }) => 
        instructor.chair === filterOptions.chair
      );
    }
    
    // Apply program filter to instructors by checking if they have assignments in the selected program
    if (filterOptions.program !== 'all') {
      filtered = filtered.filter(({ assignments }) => 
        assignments.some(a => a.assignment.program === filterOptions.program)
      );
    }
    
    // Apply semester filter to instructors by checking if they have assignments in the selected semester
    if (filterOptions.semester !== 'all') {
      filtered = filtered.filter(({ assignments }) => 
        assignments.some(a => a.assignment.semester === filterOptions.semester)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'name') {
          aValue = a.instructor.fullName || '';
          bValue = b.instructor.fullName || '';
        } else if (sortConfig.key === 'workload') {
          aValue = a.assignments.reduce((sum, assign) => sum + (parseFloat(assign.workload) || 0), 0);
          bValue = b.assignments.reduce((sum, assign) => sum + (parseFloat(assign.workload) || 0), 0);
        } else if (sortConfig.key === 'courseCount') {
          const aCourses = new Set(a.assignments.map(assign => assign.course?._id));
          const bCourses = new Set(b.assignments.map(assign => assign.course?._id));
          aValue = aCourses.size;
          bValue = bCourses.size;
        } else if (sortConfig.key === 'chair') {
          aValue = a.instructor.chair || '';
          bValue = b.instructor.chair || '';
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [assignmentsByInstructor, searchTerm, searchField, filterOptions, sortConfig]);
  
  // Search and filter functionality for assignments
  const filteredAssignments = useMemo(() => {
    let filtered = allAssignments;
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(assignment => {
        const searchLower = searchTerm.toLowerCase();
        
        if (searchField === 'instructor') {
          return (assignment.instructorId.fullName || '').toLowerCase().includes(searchLower);
        } else if (searchField === 'chair') {
          return (assignment.instructorId.chair || '').toLowerCase().includes(searchLower);
        }
        return false;
      });
    }
    
    // Apply workload filter
    if (filterOptions.workloadMin || filterOptions.workloadMax) {
      filtered = filtered.filter(assignment => {
        const workload = parseFloat(assignment.workload) || 0;
        let match = true;
        
        if (filterOptions.workloadMin && !isNaN(parseFloat(filterOptions.workloadMin))) {
          match = match && workload >= parseFloat(filterOptions.workloadMin);
        }
        
        if (filterOptions.workloadMax && !isNaN(parseFloat(filterOptions.workloadMax))) {
          match = match && workload <= parseFloat(filterOptions.workloadMax);
        }
        
        return match;
      });
    }
    
    // Apply chair filter
    if (filterOptions.chair !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.instructorId.chair === filterOptions.chair
      );
    }
    
    // Apply program filter
    if (filterOptions.program !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.assignment.program === filterOptions.program
      );
    }
    
    // Apply semester filter
    if (filterOptions.semester !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.assignment.semester === filterOptions.semester
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'instructor') {
          aValue = a.instructorId.fullName || '';
          bValue = b.instructorId.fullName || '';
        } else if (sortConfig.key === 'course') {
          aValue = a.course?.name || '';
          bValue = b.course?.name || '';
        } else if (sortConfig.key === 'workload') {
          aValue = parseFloat(a.workload) || 0;
          bValue = parseFloat(b.workload) || 0;
        } else if (sortConfig.key === 'chair') {
          aValue = a.instructorId.chair || '';
          bValue = b.instructorId.chair || '';
        } else if (sortConfig.key === 'section') {
          aValue = a.section || '';
          bValue = b.section || '';
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [allAssignments, searchTerm, searchField, filterOptions, sortConfig]);
  
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
    allAssignments.reduce((total, a) => total + (parseFloat(a.workload) || 0), 0)
  , [allAssignments]);
  
  const uniqueCourses = useMemo(() => 
    new Set(allAssignments.map(a => a.course?.code)).size
  , [allAssignments]);
  
  const totalInstructors = useMemo(() => 
    Object.keys(assignmentsByInstructor).length
  , [assignmentsByInstructor]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Prepare CSV data
  const getAssignmentsCsvData = () => {
    if (!allAssignments || !allAssignments.length) return [];
    
    return allAssignments.map(assignment => ({
      'Instructor': assignment.instructorId?.fullName || 'N/A',
      'Instructor Email': assignment.instructorId?.email || 'N/A',
      'Course': assignment.course?.name || 'N/A',
      'Course Code': assignment.course?.code || 'N/A',
      'Section': assignment.section || 'N/A',
      'Number of Sections': assignment.NoOfSections || 'N/A',
      'Lab Division': assignment.labDivision || 'N/A',
      'Workload': assignment.workload || 'N/A',
      'Chair': assignment.instructorId?.chair || 'N/A',
      'Program': assignment.assignment?.program || 'N/A',
      'Semester': assignment.assignment?.semester || 'N/A',
    }));
  };

  // Initialize workload chart 
  useEffect(() => {
    if (activeTab === 'overview' && report && allAssignments.length > 0) {
      // Function to dynamically load Chart.js
      const initializeChart = async () => {
        try {
          // Dynamic import Chart.js
          const { Chart, registerables } = await import('chart.js/auto');
          
          // Get top instructors by workload
          const topInstructors = Object.values(assignmentsByInstructor)
            .map(({ instructor, assignments }) => ({
              name: instructor.fullName || 'Unknown',
              workload: assignments.reduce((total, a) => total + (parseFloat(a.workload) || 0), 0)
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
          
          // Initialize workload distribution chart
          const chartDistribution = document.getElementById('workloadDistributionChart');
          if (!chartDistribution) return;
          
          // Check for existing chart and destroy it
          if (Chart.getChart(chartDistribution)) {
            Chart.getChart(chartDistribution).destroy();
          }
          
          // Create workload ranges
          const ranges = ['0-2', '2-4', '4-6', '6-8', '8-10', '10-12', '12+'];
          const counts = [0, 0, 0, 0, 0, 0, 0];
          
          // Count instructors in each workload range
          Object.values(assignmentsByInstructor).forEach(({ assignments }) => {
            const totalWorkload = assignments.reduce((sum, a) => sum + (parseFloat(a.workload) || 0), 0);
            if (totalWorkload < 2) counts[0]++;
            else if (totalWorkload < 4) counts[1]++;
            else if (totalWorkload < 6) counts[2]++;
            else if (totalWorkload < 8) counts[3]++;
            else if (totalWorkload < 10) counts[4]++;
            else if (totalWorkload < 12) counts[5]++;
            else counts[6]++;
          });
          
          // Create distribution chart
          new Chart(chartDistribution, {
            type: 'bar',
            data: {
              labels: ranges,
              datasets: [{
                label: 'Instructors',
                data: counts,
                backgroundColor: isDarkMode 
                  ? 'rgba(129, 140, 248, 0.8)'
                  : 'rgba(79, 70, 229, 0.8)',
                borderColor: 'transparent',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 30
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
                      return `Instructors: ${context.raw}`;
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
                    stepSize: 1
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
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterOptions({
      workloadMin: '',
      workloadMax: '',
      program: 'all',
      semester: 'all',
      chair: 'all'
    });
    setSortConfig({ key: null, direction: 'ascending' });
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
  
  // Generate CSV filename
  const getCsvFilename = () => {
    const programPart = report?.program ? `${report.program.replace(/\s+/g, '-')}_` : '';
    const semesterPart = report?.semester ? `${report.semester}_` : '';
    const yearPart = report?.year || '';
    const datePart = new Date().toISOString().slice(0,10);
    
    return `${programPart}workload_report_${semesterPart}${yearPart}_${datePart}.csv`;
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
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="relative flex-grow w-full md:w-auto max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder={`Search by ${searchField === 'instructor' ? 'instructor name' : 'chair'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base shadow-sm"
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
            <div className="inline-flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setSearchField('instructor')}
                className={`px-3 py-2 text-sm font-medium ${
                  searchField === 'instructor'
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Instructor
              </button>
              <button
                onClick={() => setSearchField('chair')}
                className={`px-3 py-2 text-sm font-medium ${
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
              className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl ${
                showFilters 
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                  : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
              } focus:outline-none transition-colors`}
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            
            <a 
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                [
                  Object.keys(getAssignmentsCsvData()[0] || {}).join(','),
                  ...getAssignmentsCsvData().map(row => 
                    Object.values(row).map(value => 
                      `"${value}"`
                    ).join(',')
                  )
                ].join('\n')
              )}`} 
              download={getCsvFilename()}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none transition-colors"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export CSV
            </a>
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
                    value={filterOptions.program}
                    onChange={(e) => setFilterOptions({...filterOptions, program: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="all">All Programs</option>
                    {uniqueValues.programs.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="semester-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                  <select
                    id="semester-filter"
                    value={filterOptions.semester}
                    onChange={(e) => setFilterOptions({...filterOptions, semester: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="all">All Semesters</option>
                    {uniqueValues.semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="chair-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chair</label>
                  <select
                    id="chair-filter"
                    value={filterOptions.chair}
                    onChange={(e) => setFilterOptions({...filterOptions, chair: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="all">All Chairs</option>
                    {uniqueValues.chairs.map(chair => (
                      <option key={chair} value={chair}>{chair}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="min-workload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Workload</label>
                  <input
                    type="number"
                    id="min-workload"
                    min="0"
                    step="0.1"
                    value={filterOptions.workloadMin}
                    onChange={(e) => setFilterOptions({...filterOptions, workloadMin: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    placeholder="Minimum"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="max-workload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Workload</label>
                  <input
                    type="number"
                    id="max-workload"
                    min="0"
                    step="0.1"
                    value={filterOptions.workloadMax}
                    onChange={(e) => setFilterOptions({...filterOptions, workloadMax: e.target.value})}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    placeholder="Maximum"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                  <select
                    id="sort-by"
                    value={`${sortConfig.key || 'default'}_${sortConfig.direction}`}
                    onChange={(e) => {
                      const [key, direction] = e.target.value.split('_');
                      setSortConfig({ 
                        key: key === 'default' ? null : key, 
                        direction 
                      });
                    }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="default_ascending">Default Order</option>
                    {activeTab === 'instructors' ? (
                      <>
                        <option value="name_ascending">Name (A-Z)</option>
                        <option value="name_descending">Name (Z-A)</option>
                        <option value="workload_descending">Workload (High-Low)</option>
                        <option value="workload_ascending">Workload (Low-High)</option>
                        <option value="courseCount_descending">Course Count (High-Low)</option>
                        <option value="chair_ascending">Chair (A-Z)</option>
                      </>
                    ) : (
                      <>
                        <option value="instructor_ascending">Instructor (A-Z)</option>
                        <option value="course_ascending">Course (A-Z)</option>
                        <option value="workload_descending">Workload (High-Low)</option>
                        <option value="workload_ascending">Workload (Low-High)</option>
                        <option value="chair_ascending">Chair (A-Z)</option>
                        <option value="section_ascending">Section (A-Z)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 focus:outline-none"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Show active filters */}
        {(searchTerm || filterOptions.program !== 'all' || filterOptions.semester !== 'all' || 
          filterOptions.chair !== 'all' || filterOptions.workloadMin || filterOptions.workloadMax) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Active Filters:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
                {searchField === 'instructor' ? 'Instructor' : 'Chair'}: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1.5 inline-flex rounded-full focus:outline-none"
                  aria-label="Remove filter"
                >
                  <X className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                </button>
              </span>
            )}
            
            {filterOptions.program !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                Program: {filterOptions.program}
                <button
                  onClick={() => setFilterOptions({...filterOptions, program: 'all'})}
                  className="ml-1.5 inline-flex rounded-full focus:outline-none"
                  aria-label="Remove filter"
                >
                  <X className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </button>
              </span>
            )}
            
            {filterOptions.semester !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200">
                Semester: {filterOptions.semester}
                <button
                  onClick={() => setFilterOptions({...filterOptions, semester: 'all'})}
                  className="ml-1.5 inline-flex rounded-full focus:outline-none"
                  aria-label="Remove filter"
                >
                  <X className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </button>
              </span>
            )}
            
            {filterOptions.chair !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                Chair: {filterOptions.chair}
                <button
                  onClick={() => setFilterOptions({...filterOptions, chair: 'all'})}
                  className="ml-1.5 inline-flex rounded-full focus:outline-none"
                  aria-label="Remove filter"
                >
                  <X className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </button>
              </span>
            )}
            
            {(filterOptions.workloadMin || filterOptions.workloadMax) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                Workload: {filterOptions.workloadMin || '0'} - {filterOptions.workloadMax || '∞'}
                <button
                  onClick={() => setFilterOptions({...filterOptions, workloadMin: '', workloadMax: ''})}
                  className="ml-1.5 inline-flex rounded-full focus:outline-none"
                  aria-label="Remove filter"
                >
                  <X className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </button>
              </span>
            )}
            
            <button
              onClick={resetFilters}
              className="text-xs underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm mb-5">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold leading-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <FileBarChart2 className="text-indigo-600 dark:text-indigo-400 h-5 w-5 md:h-6 md:w-6" />
                      {report.program ? `${report.program} ` : 'Academic '} 
                      Workload {report.year}
                      {report.semester && <span className="hidden sm:inline"> • {report.semester}</span>}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      {new Date(report.createdAt).toLocaleDateString()} 
                      <span className="hidden sm:inline">by {report.generatedBy || 'System'}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Desktop actions */}
              <div className="hidden md:flex md:items-center md:space-x-2">
                <div className="h-8 border-l border-gray-300 dark:border-gray-600 mx-2 hidden sm:block"></div>
                
                <Link to={`/reports/${id}/edit`}>
                  <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition shadow-sm text-sm">
                    <Edit className="mr-1.5" size={16} aria-hidden="true" />
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none transition text-sm"
                >
                  <Trash2 className="mr-1.5" size={16} aria-hidden="true" />
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
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 absolute right-4 z-20 mt-2 w-48"
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
                    className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl"
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
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl transition flex items-center"
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
            <div className="mt-5 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-6 md:space-x-8 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  aria-current={activeTab === 'overview' ? 'page' : undefined}
                >
                  <BarChart2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('instructors')}
                  className={`${
                    activeTab === 'instructors'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  aria-current={activeTab === 'instructors' ? 'page' : undefined}
                >
                  <Users className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  By Instructor
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`${
                    activeTab === 'assignments'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  aria-current={activeTab === 'assignments' ? 'page' : undefined}
                >
                  <Layers className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  All Assignments
                </button>
                <button
                  onClick={() => setActiveTab('distribution')}
                  className={`${
                    activeTab === 'distribution'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  aria-current={activeTab === 'distribution' ? 'page' : undefined}
                >
                  <Coffee className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Workload Analysis
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Search and filter section */}
        {renderSearchAndFilters()}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-5"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                variants={slideUp}
                className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 overflow-hidden shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md p-4 flex items-center"
              >
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl p-3">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Instructors</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalInstructors}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={slideUp}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 overflow-hidden shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md p-4 flex items-center"
              >
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-xl p-3">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Courses</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{uniqueCourses}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={slideUp}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 overflow-hidden shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md p-4 flex items-center"
              >
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-xl p-3">
                  <FileCheck2 className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Assignments</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {allAssignments.length}
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={slideUp}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md p-4 flex items-center"
              >
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-xl p-3">
                  <Coffee className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Workload</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatNumber(totalWorkload)}</p>
                </div>
              </motion.div>
            </div>
            
            {/* Report details and chart layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Report details */}
              <motion.div 
                variants={slideUp}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    Report Details
                  </h3>
                </div>
                <div className="px-5 py-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        Academic Year
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">{report.year}</dd>
                    </div>
                    
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <School className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        Semester
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.semester ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                            {report.semester}
                          </span>
                        ) : (
                          <span>All Semesters</span>
                        )}
                      </dd>
                    </div>
                    
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <Layers className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        Program
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.program ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            {report.program}
                          </span>
                        ) : (
                          <span>All Programs</span>
                        )}
                      </dd>
                    </div>
                    
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        Created By
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">{report.generatedBy || 'System'}</dd>
                    </div>
                    
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        Created On
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    
                    <div className="flex justify-between py-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        Last Updated
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(report.updatedAt || report.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                  
                  {report.note && (
                    <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Admin Note
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                        {report.note}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Charts Section */}
              <motion.div 
                variants={slideUp}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    Top Instructors by Workload
                  </h3>
                </div>
                
                <div className="px-5 py-5">
                  {allAssignments.length > 0 ? (
                    <div className="h-64 sm:h-72 relative" id="chart-container">
                      <canvas id="workloadChart" aria-label="Workload chart" role="img"></canvas>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                      <p className="text-sm">No workload data available</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Coffee className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    Workload Distribution by Range
                  </h3>
                  
                  {allAssignments.length > 0 ? (
                    <div className="h-48 relative">
                      <canvas id="workloadDistributionChart" aria-label="Workload distribution chart" role="img"></canvas>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No distribution data available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
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
              <div className="bg-white dark:bg-gray-800 shadow-sm p-6 rounded-2xl flex items-center border border-gray-200 dark:border-gray-700">
                <Info className="text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" size={20} aria-hidden="true" />
                <p className="text-gray-700 dark:text-gray-300">
                  {Object.keys(assignmentsByInstructor).length === 0
                    ? "No instructor assignments found in this report"
                    : "No instructors match your search criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {paginatedInstructors.map(({ instructor, assignments }, index) => (
                  <motion.div 
                    key={instructor._id}
                    variants={slideUp}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center text-white dark:text-indigo-200 font-medium text-lg shadow-sm">
                              {instructor.fullName?.charAt(0) || 'U'}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-base leading-6 font-medium text-gray-900 dark:text-white">
                              {instructor.fullName || 'Unknown Instructor'}
                            </h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
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
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            Total Workload: {formatNumber(assignments.reduce((total, a) => total + (parseFloat(a.workload) || 0), 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                                      
                    {/* Mobile view */}
                    <div className="md:hidden px-5 py-4 space-y-3 divide-y divide-gray-200 dark:divide-gray-700">
                      {assignments.map((assignment, idx) => (
                        <div key={idx} className="pt-3 first:pt-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                                {assignment.course?.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.course?.code}</p>
                            </div>
                            <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full px-2 py-0.5">
                              {formatNumber(assignment.workload)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-1 gap-x-2 mt-2 text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Section:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300 font-medium">{assignment.section || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Lab:</span>
                              <span className="ml-1 text-gray-700 dark:text-gray-300 font-medium">{assignment.labDivision || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                              <span className="ml-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                  {assignment.assignment.semester}
                                </span>
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Program:</span>
                              <span className="ml-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
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
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('course')}>
                              <div className="flex items-center">
                                Course
                                {sortConfig.key === 'course' && (
                                  <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                                )}
                              </div>
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Section</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Lab</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Program</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Semester</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('workload')}>
                              <div className="flex items-center justify-end">
                                Workload
                                {sortConfig.key === 'workload' && (
                                  <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                                )}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                          {assignments.map((assignment, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center">
                                    <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.course?.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{assignment.course?.code}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.section || 'N/A'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.labDivision || 'N/A'}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                  {assignment.assignment.program}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                  {assignment.assignment.semester}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                                {formatNumber(assignment.workload)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                            <td colSpan="5" className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                              Total Workload:
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                              {formatNumber(assignments.reduce((total, a) => total + (parseFloat(a.workload) || 0), 0))}
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
              <div className="bg-white dark:bg-gray-800 shadow-sm p-6 rounded-2xl flex items-center border border-gray-200 dark:border-gray-700">
                <Info className="text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" size={20} aria-hidden="true" />
                <p className="text-gray-700 dark:text-gray-300">
                  {allAssignments.length === 0
                    ? "No assignments found in this report"
                    : "No assignments match your search criteria"
                  }
                </p>
              </div>
            ) : (
              <motion.div 
                variants={slideUp}
                className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-base font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      All Assignments
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Showing <span className="font-semibold">{paginatedAssignments.length}</span> of <span className="font-semibold">{filteredAssignments.length}</span> assignments
                    </p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('course')}>
                          <div className="flex items-center">
                            Course
                            {sortConfig.key === 'course' && (
                              <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('instructor')}>
                          <div className="flex items-center">
                            Instructor
                            {sortConfig.key === 'instructor' && (
                              <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('chair')}>
                          <div className="flex items-center">
                            Chair
                            {sortConfig.key === 'chair' && (
                              <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('section')}>
                          <div className="flex items-center">
                            Section/Lab
                            {sortConfig.key === 'section' && (
                              <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Program</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Semester</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('workload')}>
                          <div className="flex items-center justify-end">
                            Workload
                            {sortConfig.key === 'workload' && (
                              <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {paginatedAssignments.map((assignment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center">
                                <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                              </div>
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.course?.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{assignment.course?.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center">
                                <span className="text-xs font-medium text-white dark:text-indigo-200">
                                  {assignment.instructorId.fullName?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.instructorId.fullName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {assignment.instructorId.chair ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                {assignment.instructorId.chair}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">Section: {assignment.section || 'N/A'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Lab: {assignment.labDivision || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                              {assignment.assignment.program}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                              {assignment.assignment.semester}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                            {formatNumber(assignment.workload)}
                          </td>
                        </tr>
                      ))}
                      
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td colSpan="6" className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Workload:
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                          {formatNumber(paginatedAssignments.reduce((total, a) => total + (parseFloat(a.workload) || 0), 0))}
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
        
        {/* Workload Analysis Tab */}
        {activeTab === 'distribution' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-5"
          >
            <motion.div 
              variants={slideUp}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  Instructor Workload Analysis
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Detailed workload distribution across {totalInstructors} instructors
                </p>
              </div>
              
              {Object.keys(assignmentsByInstructor).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Chair</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Courses</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Workload</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% of Max (12)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {Object.values(assignmentsByInstructor)
                        .sort((a, b) => {
                          const aWorkload = a.assignments.reduce((sum, assign) => sum + (parseFloat(assign.workload) || 0), 0);
                          const bWorkload = b.assignments.reduce((sum, assign) => sum + (parseFloat(assign.workload) || 0), 0);
                          return bWorkload - aWorkload; // Sort by workload (high to low)
                        })
                        .map(({ instructor, assignments }, idx) => {
                          const totalWorkload = assignments.reduce((sum, assign) => sum + (parseFloat(assign.workload) || 0), 0);
                          const uniqueCourses = new Set(assignments.map(assign => assign.course?._id)).size;
                          const percentOfMax = (totalWorkload / 12) * 100;
                          
                          return (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center">
                                    <span className="text-xs font-medium text-white dark:text-indigo-200">
                                      {instructor.fullName?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{instructor.fullName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{instructor.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {instructor.chair ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    {instructor.chair}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">Not Assigned</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{uniqueCourses} courses</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {assignments.slice(0, 2).map(a => a.course?.code).join(', ')}
                                  {assignments.length > 2 && '...'}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(totalWorkload)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {Math.round(percentOfMax)}% of 12.00
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="w-full">
                                  <div className="relative pt-1">
                                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                                      <div 
                                        style={{ width: `${Math.min(100, percentOfMax)}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                          totalWorkload > 12 
                                            ? 'bg-red-500 dark:bg-red-600' 
                                            : totalWorkload > 10
                                              ? 'bg-amber-500 dark:bg-amber-600'
                                              : 'bg-indigo-500 dark:bg-indigo-600'
                                        }`}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Coffee className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                  <p className="text-sm">No workload data available</p>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  Workload Distribution by Range
                </h3>
              </div>
              
              {Object.keys(assignmentsByInstructor).length > 0 ? (
                <div className="p-5">
                  <div className="h-64 relative">
                    <canvas id="workloadDistributionChart" aria-label="Workload distribution chart" role="img"></canvas>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Workload Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Average Workload</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatNumber(totalWorkload / (totalInstructors || 1))}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Median Workload</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatNumber(
                            (() => {
                              const workloads = Object.values(assignmentsByInstructor).map(
                                ({ assignments }) => assignments.reduce((sum, a) => sum + (parseFloat(a.workload) || 0), 0)
                              ).sort((a, b) => a - b);
                              
                              const mid = Math.floor(workloads.length / 2);
                              return workloads.length % 2 === 0
                                ? (workloads[mid - 1] + workloads[mid]) / 2
                                : workloads[mid];
                            })()
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Highest Workload</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatNumber(
                            Math.max(...Object.values(assignmentsByInstructor).map(
                              ({ assignments }) => assignments.reduce((sum, a) => sum + (parseFloat(a.workload) || 0), 0)
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Lowest Workload</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatNumber(
                            Math.min(...Object.values(assignmentsByInstructor).map(
                              ({ assignments }) => assignments.reduce((sum, a) => sum + (parseFloat(a.workload) || 0), 0)
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No distribution data available</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailCOC;