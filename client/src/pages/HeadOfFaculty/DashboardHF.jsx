import { useEffect, useState } from "react";
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
import { FaUsers, FaBuilding, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

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
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
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

  
  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold">Head of Faculty Dashboard</h1>
        <p className="mt-2 text-indigo-100">Welcome back! Here's an overview of your faculty operations</p>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold text-gray-800">{departments.length}</p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <FaBuilding className="text-indigo-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/chairs" className="text-indigo-600 text-sm hover:underline">
                View all departments →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Instructors</p>
                <p className="text-3xl font-bold text-gray-800">{instructors.length}</p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <FaUsers className="text-indigo-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/users" className="text-indigo-600 text-sm hover:underline">
                Manage instructors →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Assignments</p>
                <p className="text-3xl font-bold text-gray-800">{assignments.length}</p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <FaClipboardList className="text-indigo-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/assignments" className="text-indigo-600 text-sm hover:underline">
                View assignments →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Complaints</p>
                <p className="text-3xl font-bold text-indigo-600">{complaints.length}</p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <FaExclamationTriangle className="text-indigo-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/complaints" className="text-indigo-600 text-sm hover:underline">
                Address complaints →
              </Link>
            </div>
          </div>
        </div>


      </div>
    </div>

  );
};

export default DashboardHF;