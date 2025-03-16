import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FaUsers, FaBuilding, FaClipboardList, FaExclamationTriangle, 
  FaUserCog, FaSitemap, FaClipboardCheck, FaChartLine } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardHF = () => {
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedAssignments: 0,
    pendingAssignments: 0,
    departmentPerformance: [],
  });

  useEffect(() => {
    fetchData();
    fetchRecentActivities();
    // Simulating stats data
    generateStats();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: departmentsData } = await api.get("/chairs");
      const { data: instructorsData } = await api.get("/users?role=Instructor");
      const { data: assignmentsData } = await api.get("/assignments");
      const { data: complaintsData } = await api.get("/complaints");

      setDepartments(departmentsData);
      setInstructors(instructorsData);
      setAssignments(assignmentsData);
      setComplaints(complaintsData.filter((c) => c.status === "Pending"));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    // Simulated recent activities data
    const mockActivities = [
      { id: 1, type: "assignment", description: "New assignment created by Dr. Johnson", timestamp: "2 hours ago" },
      { id: 2, type: "complaint", description: "New complaint submitted about classroom resources", timestamp: "3 hours ago" },
      { id: 3, type: "user", description: "New instructor added to Computer Science department", timestamp: "Yesterday" },
      { id: 4, type: "department", description: "Engineering department updated their curriculum", timestamp: "Yesterday" },
      { id: 5, type: "assignment", description: "Mathematics department completed semester planning", timestamp: "2 days ago" },
    ];
    setRecentActivities(mockActivities);
  };

  const generateStats = () => {
    // Simulated stats data
    const completed = Math.floor(assignments.length * 0.7);
    const pending = assignments.length - completed;
    
    const deptPerformance = [
      { name: "Computer Science", rating: 4.2 },
      { name: "Mathematics", rating: 4.5 },
      { name: "Physics", rating: 3.9 },
      { name: "Economics", rating: 4.1 },
      { name: "Engineering", rating: 4.3 },
    ];
    
    setStats({
      completedAssignments: completed,
      pendingAssignments: pending,
      departmentPerformance: deptPerformance,
    });
  };

  // Chart data
  const assignmentChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Assignments Created',
        data: [12, 19, 15, 28, 22, 30],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Assignments Completed',
        data: [10, 15, 12, 25, 18, 27],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const departmentPerformanceData = {
    labels: stats.departmentPerformance.map(dept => dept.name),
    datasets: [
      {
        label: 'Performance Rating',
        data: stats.departmentPerformance.map(dept => dept.rating),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const assignmentStatusData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.completedAssignments, stats.pendingAssignments],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold">Head of Faculty Dashboard</h1>
        <p className="mt-2 opacity-90">Welcome back! Here's an overview of your faculty operations</p>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 -mt-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold text-gray-800">{departments.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/chairs" className="text-blue-600 text-sm hover:underline">
                View all departments →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Instructors</p>
                <p className="text-3xl font-bold text-gray-800">{instructors.length}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <FaUsers className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/users" className="text-green-600 text-sm hover:underline">
                Manage instructors →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Assignments</p>
                <p className="text-3xl font-bold text-gray-800">{assignments.length}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FaClipboardList className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/assignments" className="text-purple-600 text-sm hover:underline">
                View assignments →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Complaints</p>
                <p className="text-3xl font-bold text-amber-600">{complaints.length}</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <FaExclamationTriangle className="text-amber-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/complaints" className="text-amber-600 text-sm hover:underline">
                Address complaints →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main content sections - 3 columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section - Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Trends */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Assignment Trends</h2>
              <div className="h-80">
                <Line 
                  data={assignmentChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </div>
            </div>
            
            {/* Department Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Department Performance</h2>
                <div className="h-64">
                  <Bar 
                    data={departmentPerformanceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                        }
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Assignment Status</h2>
                <div className="h-64 flex justify-center items-center">
                  <div className="w-3/4">
                    <Doughnut 
                      data={assignmentStatusData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/users" className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <FaUserCog className="text-blue-600 text-xl mb-2" />
                  <span className="text-sm text-center">Manage Users</span>
                </Link>
                <Link to="/chairs" className="flex flex-col items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                  <FaSitemap className="text-amber-600 text-xl mb-2" />
                  <span className="text-sm text-center">Departments</span>
                </Link>
                <Link to="/rules" className="flex flex-col items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <FaClipboardCheck className="text-red-600 text-xl mb-2" />
                  <span className="text-sm text-center">Set Rules</span>
                </Link>
                <Link to="/reports" className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <FaChartLine className="text-green-600 text-xl mb-2" />
                  <span className="text-sm text-center">Reports</span>
                </Link>
              </div>
            </div>
            
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100">
                    <div className={`rounded-full p-2 flex-shrink-0 mr-3 ${
                      activity.type === 'assignment' ? 'bg-purple-100' : 
                      activity.type === 'complaint' ? 'bg-amber-100' :
                      activity.type === 'user' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {activity.type === 'assignment' && <FaClipboardList className="text-purple-600" />}
                      {activity.type === 'complaint' && <FaExclamationTriangle className="text-amber-600" />}
                      {activity.type === 'user' && <FaUsers className="text-blue-600" />}
                      {activity.type === 'department' && <FaBuilding className="text-green-600" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button className="text-blue-600 text-sm hover:underline">
                  View all activities
                </button>
              </div>
            </div>
            
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-gray-800">End of Semester Evaluations</p>
                  <p className="text-xs text-gray-600 mt-1">Due in 5 days</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-gray-800">Department Budget Approval</p>
                  <p className="text-xs text-gray-600 mt-1">Due in 2 weeks</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-800">Curriculum Review Meeting</p>
                  <p className="text-xs text-gray-600 mt-1">June 15, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHF;