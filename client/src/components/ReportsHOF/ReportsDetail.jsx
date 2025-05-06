import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FileText, Download, Loader2, AlertTriangle, Calendar,
  FileSpreadsheet, BookOpen, Clock, Layers, User, Bookmark, FileBarChart2,
  FileCheck2, Search, Info,  Filter, BarChart2, Table, SlidersHorizontal,
  ArrowUpDown,  Coffee
} from 'lucide-react';
import api from '@/utils/api';

const ReportsDetail = () => {
  const { reportId } = useParams();
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterOptions, setFilterOptions] = useState({ chair: 'all', workloadMin: '', workloadMax: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/reports/${reportId}`);
        setReport(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch report details. Please try again later.');
        toast.error('Error fetching report details');
        console.error('Error fetching report details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  useEffect(() => {
    if (report && report.assignments) {
      let filtered = report.assignments.map(group => ({
        ...group,
        assignments: group.assignments.filter(assignment => {
          const nameMatch = assignment.instructorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
          const courseMatch = assignment.courseId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             assignment.courseId?.code?.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Apply chair filter if not set to 'all'
          const chairMatch = filterOptions.chair === 'all' || 
                            assignment.instructorId?.chair === filterOptions.chair;
          
          // Apply workload range filter if set
          let workloadMatch = true;
          const workload = parseFloat(assignment.workload) || 0;
          
          if (filterOptions.workloadMin && !isNaN(parseFloat(filterOptions.workloadMin))) {
            workloadMatch = workloadMatch && workload >= parseFloat(filterOptions.workloadMin);
          }
          
          if (filterOptions.workloadMax && !isNaN(parseFloat(filterOptions.workloadMax))) {
            workloadMatch = workloadMatch && workload <= parseFloat(filterOptions.workloadMax);
          }
          
          return (nameMatch || courseMatch) && chairMatch && workloadMatch;
        })
      })).filter(group => group.assignments.length > 0);
      
      // Apply sorting if configured
      if (sortConfig.key) {
        filtered = filtered.map(group => {
          const sortedAssignments = [...group.assignments].sort((a, b) => {
            let aValue, bValue;
            
            // Handle nested properties based on the sort key
            if (sortConfig.key === 'instructor') {
              aValue = a.instructorId?.fullName || '';
              bValue = b.instructorId?.fullName || '';
            } else if (sortConfig.key === 'course') {
              aValue = a.courseId?.name || '';
              bValue = b.courseId?.name || '';
            } else if (sortConfig.key === 'workload') {
              aValue = parseFloat(a.workload) || 0;
              bValue = parseFloat(b.workload) || 0;
            } else {
              aValue = a[sortConfig.key] || '';
              bValue = b[sortConfig.key] || '';
            }
            
            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          });
          
          return {
            ...group,
            assignments: sortedAssignments
          };
        });
      }
      
      setFilteredAssignments(filtered);
    }
  }, [searchTerm, report, sortConfig, filterOptions]);

  const getAssignmentsCsvData = () => {
    if (!report || !report.assignments) return [];
    
    return report.assignments.flatMap(assignmentGroup => 
      assignmentGroup.assignments.map(assignment => ({
        'Instructor': assignment.instructorId?.fullName || 'N/A',
        'Instructor Email': assignment.instructorId?.email || 'N/A',
        'Course': assignment.courseId?.name || 'N/A',
        'Course Code': assignment.courseId?.code || 'N/A',
        'Section': assignment.section || 'N/A',
        'Number of Sections': assignment.NoOfSections || 'N/A',
        'Lab Division': assignment.labDivision || 'N/A',
        'Workload': assignment.workload || 'N/A',
        'Chair': assignment.instructorId?.chair || 'N/A',
      }))
    );
  };

  const calculateTotalWorkload = () => {
    if (!report || !report.assignments) return 0;
    
    return report.assignments.reduce((total, group) => {
      return total + group.assignments.reduce((groupTotal, assignment) => {
        return groupTotal + (parseFloat(assignment.workload) || 0);
      }, 0);
    }, 0).toFixed(2);
  };

  const countUniqueInstructors = () => {
    if (!report || !report.assignments) return 0;
    
    const instructorIds = new Set();
    report.assignments.forEach(group => {
      group.assignments.forEach(assignment => {
        if (assignment.instructorId?._id) {
          instructorIds.add(assignment.instructorId._id);
        }
      });
    });
    
    return instructorIds.size;
  };

  const countUniqueCourses = () => {
    if (!report || !report.assignments) return 0;
    
    const courseIds = new Set();
    report.assignments.forEach(group => {
      group.assignments.forEach(assignment => {
        if (assignment.courseId?._id) {
          courseIds.add(assignment.courseId._id);
        }
      });
    });
    
    return courseIds.size;
  };

  const getUniqueChairs = () => {
    if (!report || !report.assignments) return [];
    
    const chairs = new Set();
    report.assignments.forEach(group => {
      group.assignments.forEach(assignment => {
        if (assignment.instructorId?.chair) {
          chairs.add(assignment.instructorId.chair);
        }
      });
    });
    
    return Array.from(chairs);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterOptions({ chair: 'all', workloadMin: '', workloadMax: '' });
    setSortConfig({ key: null, direction: 'ascending' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <Loader2 size={36} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 dark:text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Report</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="max-w-md text-center">
          <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Report Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The report you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-full mx-auto"
      >
        {/* Header Section - Compact with action buttons */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileBarChart2 className="text-indigo-600 dark:text-indigo-400 mr-2" size={20} />
                {report.program ? `${report.program} Workload` : 'Academic Workload'} • {report.semester} {report.year}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
                        
              <CSVLink 
                data={getAssignmentsCsvData()} 
                filename={`${report.program || 'workload'}-report-${report.semester}-${report.year}.csv`}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                title="Export as CSV"
              >
                <Download size={18} />
              </CSVLink>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 ${showFilters ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} rounded-full`}
                title="Toggle Filters"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 print:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                <User size={16} />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Instructors</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{countUniqueInstructors()}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                <Bookmark size={16} />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Courses</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{countUniqueCourses()}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                <FileCheck2 size={16} />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Assignments</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {report.assignments?.reduce((total, group) => total + group.assignments.length, 0) || 0}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                <Coffee size={16} />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Workload</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{calculateTotalWorkload()}</p>
              </div>
            </div>
          </div>

          {/* Note (if exists) */}
          {report.note && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <Info className="flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5 mr-2" size={16} />
                <div>
                  <h3 className="text-xs font-medium text-blue-800 dark:text-blue-200">Administrator Note</h3>
                  <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-300">{report.note}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4 print:hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filter Options
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-2 sm:mt-0"
                >
                  Reset All Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Chair</label>
                  <select
                    value={filterOptions.chair}
                    onChange={(e) => setFilterOptions({...filterOptions, chair: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white"
                  >
                    <option value="all">All Chairs</option>
                    {getUniqueChairs().map(chair => (
                      <option key={chair} value={chair}>{chair}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Min Workload</label>
                  <input
                    type="number"
                    value={filterOptions.workloadMin}
                    onChange={(e) => setFilterOptions({...filterOptions, workloadMin: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white"
                    placeholder="Min value"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Max Workload</label>
                  <input
                    type="number"
                    value={filterOptions.workloadMax}
                    onChange={(e) => setFilterOptions({...filterOptions, workloadMax: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white"
                    placeholder="Max value"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4 print:hidden">
            <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assignments'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Assignments
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'distribution'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Workload Distribution
              </button>
            </nav>
          </div>

          {/* Search Bar - Only show for assignments tab */}
          {activeTab === 'assignments' && (
            <div className="flex flex-col sm:flex-row gap-2 justify-between mb-4 print:hidden">
              <div className="relative max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search instructor or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      Clear
                    </span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                  title="Table View"
                >
                  <Table size={16} />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                  title="Card View"
                >
                  <BarChart2 size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Report Summary */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Report Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                        <Calendar className="text-gray-500 dark:text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Academic Year</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.year}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                        <BookOpen className="text-gray-500 dark:text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Semester</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.semester || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                        <Layers className="text-gray-500 dark:text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Program</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.program || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Clock className="text-gray-500 dark:text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Generated On</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment Groups */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Assignment Groups</h3>
                  {report.assignments && report.assignments.length > 0 ? (
                    <ul className="space-y-2">
                      {report.assignments.map((group, index) => (
                        <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-center">
                            <FileSpreadsheet className="text-indigo-500 dark:text-indigo-400 mr-2" size={14} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Group {index + 1}</span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            {group.assignments.length} assignments
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="mx-auto text-gray-400 dark:text-gray-500 mb-2" size={20} />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No assignment groups found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                {filteredAssignments && filteredAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAssignments.map((assignmentGroup, groupIndex) => (
                      <div key={assignmentGroup._id || groupIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex flex-wrap justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Assignment Group {groupIndex + 1}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {assignmentGroup.assignments.length} assignments • Assigned by {assignmentGroup.assignedBy}
                            </p>
                          </div>
                        </div>
                        
                        {viewMode === 'table' ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('instructor')}>
                                    <div className="flex items-center">
                                      Instructor
                                      {sortConfig.key === 'instructor' && (
                                        <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                                      )}
                                    </div>
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('course')}>
                                    <div className="flex items-center">
                                      Course
                                      {sortConfig.key === 'course' && (
                                        <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                                      )}
                                    </div>
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Section Details</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer" onClick={() => requestSort('workload')}>
                                    <div className="flex items-center">
                                      Workload
                                      {sortConfig.key === 'workload' && (
                                        <ArrowUpDown size={12} className="ml-1 text-indigo-500" />
                                      )}
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {assignmentGroup.assignments.map((assignment, assignmentIndex) => (
                                  <tr key={assignmentIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.instructorId?.fullName || 'N/A'}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{assignment.instructorId?.email || 'N/A'}</div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.courseId?.name || 'N/A'}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{assignment.courseId?.code || 'N/A'}</div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        Section: {assignment.section || 'N/A'}
                                      </div>
                                      {(assignment.NoOfSections || assignment.labDivision) && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {assignment.NoOfSections && `Sections: ${assignment.NoOfSections}`}
                                          {assignment.NoOfSections && assignment.labDivision && ' • '}
                                          {assignment.labDivision && `Lab: ${assignment.labDivision}`}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                        {assignment.workload || 0}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {assignmentGroup.assignments.map((assignment, assignmentIndex) => (
                              <div key={assignmentIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.instructorId?.fullName || 'N/A'}</div>
                                  <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    {assignment.workload || 0}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{assignment.instructorId?.email || 'N/A'}</div>
                                <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.courseId?.name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{assignment.courseId?.code || 'N/A'}</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">Section:</span> {assignment.section || 'N/A'}
                                  {(assignment.NoOfSections || assignment.labDivision) && (
                                    <div className="mt-1">
                                      {assignment.NoOfSections && (
                                        <span className="mr-2"><span className="font-medium">Sections:</span> {assignment.NoOfSections}</span>
                                      )}
                                      {assignment.labDivision && (
                                        <span><span className="font-medium">Lab:</span> {assignment.labDivision}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                    <FileText className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      {searchTerm ? 'No matching assignments found' : 'No assignments found'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm 
                        ? 'Try a different search term or reset filters' 
                        : 'This report doesn\'t contain any assignment data.'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-3 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'distribution' && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Instructor Workload Distribution</h3>
                
                {report.assignments && report.assignments.length > 0 ? (
                  <div>
                    <div className="mb-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Courses</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Workload</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                          {(() => {
                            const instructors = new Map();
                            
                            // Group assignments by instructor
                            report.assignments.forEach(group => {
                              group.assignments.forEach(assignment => {
                                if (assignment.instructorId?._id) {
                                  if (!instructors.has(assignment.instructorId._id)) {
                                    instructors.set(assignment.instructorId._id, {
                                      name: assignment.instructorId.fullName,
                                      email: assignment.instructorId.email,
                                      chair: assignment.instructorId.chair,
                                      courses: new Set(),
                                      workload: 0
                                    });
                                  }
                                  
                                  const instructor = instructors.get(assignment.instructorId._id);
                                  instructor.workload += parseFloat(assignment.workload) || 0;
                                  
                                  if (assignment.courseId?._id) {
                                    instructor.courses.add(assignment.courseId.name || assignment.courseId.code);
                                  }
                                }
                              });
                            });
                            
                            // Convert to array and sort by workload (high to low)
                            return Array.from(instructors.entries())
                              .map(([id, data]) => ({ id, ...data }))
                              .sort((a, b) => b.workload - a.workload)
                              .map((instructor, idx) => (
                                <tr key={instructor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{instructor.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{instructor.email}</div>
                                    {instructor.chair && (
                                      <div className="mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                          {instructor.chair}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="text-sm text-gray-900 dark:text-white">{instructor.courses.size} courses</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                      {Array.from(instructor.courses).join(', ')}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="relative pt-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {instructor.workload.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                        <div 
                                          style={{ width: `${Math.min(100, (instructor.workload / 15) * 100)}%` }}
                                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 dark:bg-indigo-400"
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Workload distribution for {countUniqueInstructors()} instructors with a total workload of {calculateTotalWorkload()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-400 dark:text-gray-500 mb-3" size={24} />
                    <p className="text-gray-500 dark:text-gray-400">No assignment data available for workload distribution</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsDetail;