import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { Loader2, AlertCircle, Info, Briefcase, Calendar, Award, BookOpen } from 'lucide-react';
import { useSelector } from 'react-redux';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

const InstructorReports = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const fetchInstructorReports = async () => {
      try {
        setLoading(true);
        const reportResponse = await api.get(`/reports/instructor/${user._id}`);
        setReports(reportResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching instructor reports');
        setLoading(false);
      }
    };

    fetchInstructorReports();
  }, [user._id]);

  // Filter assignments to include only those assigned to the logged-in instructor
  const filteredAssignments = useMemo(() => reports.flatMap((report) =>
    report.assignments
      .map((assignment) => ({
        ...assignment,
        assignments: assignment.assignments.filter(
          (a) => a.instructorId === user._id
        ),
      }))
      .filter((assignment) => assignment.assignments.length > 0)
  ), [reports, user._id]);

  // Group filtered assignments by academic year and semester
  const groupedAssignments = useMemo(() => filteredAssignments.reduce((acc, assignment) => {
    const key = `${assignment.year}-${assignment.semester}`;
    if (!acc[key]) {
      acc[key] = {
        year: assignment.year,
        semester: assignment.semester,
        program: assignment.program,
        assignments: [],
        key
      };
    }
    acc[key].assignments.push(assignment);
    return acc;
  }, {}), [filteredAssignments]);

  // Set initial selected semester
  useEffect(() => {
    if (Object.keys(groupedAssignments).length > 0 && !selectedSemester) {
      setSelectedSemester(Object.values(groupedAssignments)[0].key);
    }
  }, [groupedAssignments, selectedSemester]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!selectedSemester || !groupedAssignments[selectedSemester]) return null;
    
    const selectedGroup = groupedAssignments[selectedSemester];
    
    // Course workload chart data
    const courseLabels = [];
    const workloadData = [];
    const backgroundColors = [];
    
    // Generate colors
    const colorPalette = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 205, 86, 0.7)',
      'rgba(201, 203, 207, 0.7)',
      'rgba(94, 212, 175, 0.7)',
      'rgba(230, 126, 34, 0.7)',
      'rgba(142, 68, 173, 0.7)'
    ];
    
    // Collect course workload data
    selectedGroup.assignments.forEach(assignment => {
      assignment.assignments.forEach(assign => {
        const courseLabel = `${assign.courseId.code}: ${assign.section || 'N/A'}${assign.labDivision ? ' (Lab ' + assign.labDivision + ')' : ''}`;
        const colorIndex = courseLabels.length % colorPalette.length;
        
        courseLabels.push(courseLabel);
        workloadData.push(assign.workload);
        backgroundColors.push(colorPalette[colorIndex]);
      });
    });
    
    return {
      barData: {
        labels: courseLabels,
        datasets: [
          {
            label: 'Workload Distribution',
            data: workloadData,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1,
          },
        ],
      },
      pieData: {
        labels: courseLabels,
        datasets: [
          {
            data: workloadData,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(255, 255, 255, 0.7)',
            borderWidth: 2,
          },
        ],
      }
    };
  }, [selectedSemester, groupedAssignments]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    if (Object.keys(groupedAssignments).length === 0) return null;
    
    const allSemesters = Object.values(groupedAssignments);
    const totalWorkload = allSemesters.reduce(
      (total, group) => total + group.assignments.reduce(
        (semTotal, assignment) => semTotal + assignment.assignments.reduce(
          (courseTotal, assign) => courseTotal + assign.workload, 
          0
        ), 
        0
      ), 
      0
    );
    
    const totalCourses = allSemesters.reduce(
      (total, group) => total + group.assignments.reduce(
        (semTotal, assignment) => semTotal + assignment.assignments.length, 
        0
      ), 
      0
    );
    
    const workloadBySemester = allSemesters.map(group => ({
      semester: `${group.semester} ${group.year}`,
      workload: group.assignments.reduce(
        (semTotal, assignment) => semTotal + assignment.assignments.reduce(
          (courseTotal, assign) => courseTotal + assign.workload, 
          0
        ), 
        0
      )
    }));
    
    return {
      totalWorkload,
      totalCourses,
      averageWorkload: totalWorkload / allSemesters.length,
      workloadBySemester
    };
  }, [groupedAssignments]);

  // Historical workload trend data
  const trendData = useMemo(() => {
    if (!stats) return null;
    
    return {
      labels: stats.workloadBySemester.map(item => item.semester),
      datasets: [
        {
          label: 'Workload by Semester',
          data: stats.workloadBySemester.map(item => item.workload),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
          <Loader2 className="animate-spin text-blue-600" size={28} />
          <p className="ml-3 text-gray-700 font-medium">Loading your assignment reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">
          <div className="flex items-center">
            <AlertCircle className="mr-3" size={24} />
            <p className="font-medium">Error</p>
          </div>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (Object.keys(groupedAssignments).length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assignment Reports</h1>
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-5 rounded-lg shadow">
          <div className="flex items-center">
            <Info className="mr-3" size={24} />
            <p className="font-medium">No Assignments Found</p>
          </div>
          <p className="mt-2">You currently don't have any assigned courses or teaching responsibilities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Teaching Dashboard</h1>
          <p className="text-gray-600 mt-1">View and manage your teaching assignments and workload</p>
        </div>
        
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 border-r pr-4 last:border-r-0">
              <div className="bg-blue-100 p-2 rounded-full">
                <Briefcase className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Workload</p>
                <p className="text-xl font-bold">{stats.totalWorkload}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-r pr-4 last:border-r-0">
              <div className="bg-purple-100 p-2 rounded-full">
                <BookOpen className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Courses</p>
                <p className="text-xl font-bold">{stats.totalCourses}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Award className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Per Semester</p>
                <p className="text-xl font-bold">{stats.averageWorkload.toFixed(1)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-1 overflow-x-auto">
        <div className="flex space-x-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'details' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Course Details
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
      
      {/* Semester selector */}
      <div className="mb-6">
        <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Semester
        </label>
        <select
          id="semester-select"
          value={selectedSemester || ''}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-white"
        >
          {Object.values(groupedAssignments).map((group) => (
            <option key={group.key} value={group.key}>
              {group.semester} {group.year} - {group.program}
            </option>
          ))}
        </select>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Workload by semester trend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2 text-blue-600" size={20} />
              Workload Trend Over Time
            </h2>
            <div className="h-64">
              {trendData && <Line 
                data={trendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Workload Units'
                      }
                    }
                  }
                }}
              />}
            </div>
          </div>
          
          {/* Workload distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="mr-2 text-blue-600" size={20} />
              Current Semester Workload Distribution
            </h2>
            <div className="h-64">
              {chartData && <Pie 
                data={chartData.pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 12,
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />}
            </div>
          </div>
          
          {/* Course workload comparison */}
          <div className="bg-white rounded-lg shadow-sm p-6 xl:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="mr-2 text-blue-600" size={20} />
              Course Workload Comparison
            </h2>
            <div className="h-72">
              {chartData && <Bar 
                data={chartData.barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Workload Units'
                      }
                    },
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  }
                }}
              />}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'details' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {selectedSemester && groupedAssignments[selectedSemester] && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  {groupedAssignments[selectedSemester].semester} {groupedAssignments[selectedSemester].year} - {groupedAssignments[selectedSemester].program}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Code
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lab Division
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Workload
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedAssignments[selectedSemester].assignments.flatMap((assignment) =>
                      assignment.assignments.map((assign, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {assign.courseId.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {assign.courseId.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {assign.section || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {assign.labDivision || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {assign.workload}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {assignment.assignedBy}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-blue-50">
                      <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-700">
                        Total Workload:
                      </td>
                      <td colSpan="2" className="px-6 py-4 font-bold text-blue-700">
                        {groupedAssignments[selectedSemester].assignments.reduce(
                          (total, assignment) =>
                            total +
                            assignment.assignments.reduce(
                              (subtotal, assign) => subtotal + assign.workload,
                              0
                            ),
                          0
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workload by Course (Bar Chart) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Workload by Course</h2>
            <div className="h-80">
              {chartData && <Bar 
                data={chartData.barData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Workload Units'
                      }
                    }
                  }
                }}
              />}
            </div>
          </div>
          
          {/* Workload Distribution (Pie Chart) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Workload Distribution</h2>
            <div className="h-80">
              {chartData && <Pie 
                data={chartData.pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />}
            </div>
          </div>
          
          {/* Summary Stats Cards */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Workload Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedSemester && groupedAssignments[selectedSemester] && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {groupedAssignments[selectedSemester].assignments.reduce(
                        (total, assignment) => total + assignment.assignments.length,
                        0
                      )}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-sm text-gray-500 mb-1">Total Workload</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {groupedAssignments[selectedSemester].assignments.reduce(
                        (total, assignment) =>
                          total +
                          assignment.assignments.reduce(
                            (subtotal, assign) => subtotal + assign.workload,
                            0
                          ),
                        0
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-gray-500 mb-1">Avg. Workload Per Course</p>
                    <p className="text-2xl font-bold text-green-700">
                      {(groupedAssignments[selectedSemester].assignments.reduce(
                        (total, assignment) =>
                          total +
                          assignment.assignments.reduce(
                            (subtotal, assign) => subtotal + assign.workload,
                            0
                          ),
                        0
                      ) / groupedAssignments[selectedSemester].assignments.reduce(
                        (total, assignment) => total + assignment.assignments.length,
                        0
                      )).toFixed(1)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorReports;