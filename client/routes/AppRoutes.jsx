import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";


import ProtectedRoute from "./ProtectedRoutes";
import Layout from "@/components/Sidebar";
import Login from "@/pages/Login";
import DashboardHF from "@/pages/HeadOfFaculty/DashboardHF";
import ChairHeadDashboard from "@/pages/ChairHead/ChairHeadDashboard";
import UsersHF from "@/pages/HeadOfFaculty/UsersHF";
import ChairsHF from "@/pages/HeadOfFaculty/ChairsHF";
import PositionsHF from "@/pages/HeadOfFaculty/PositionsHF";
import RulesHF from "@/pages/HeadOfFaculty/RulesHF";
import ReportsHF from "@/pages/HeadOfFaculty/ReportsHF";
import ManageWeights from "@/pages/HeadOfFaculty/ManageWeights";
import AnnouncementsView from "@/pages/AnnouncementsView";
import CoursesCH from "@/pages/ChairHead/CoursesCH";
import InstructorManagement from "@/pages/ChairHead/InstructorManagement";
import PreferenceForm from "@/pages/ChairHead/PreferenceForm";
import RegularAssignmentCH from "@/pages/ChairHead/RegularAssignmentCH";
import CourseAssignment from "@/pages/ChairHead/CourseAssignment";
import ViewAssignmentsCH from "@/pages/ChairHead/ViewAssignmentsCH";
import ComplaintsCH from "@/pages/ChairHead/ComplaintsCH";
import AnnouncementsCH from "@/pages/ChairHead/AnnouncementsCH";
import CommonCoursesCOC from "@/pages/COC/CommonCoursesCOC";
import ExtensionCoursesCOC from "@/pages/COC/ExtensionCoursesCOC";
import SummerCoursesCOC from "@/pages/COC/SummerCoursesCOC";
import ComplaintsCOC from "@/pages/COC/ComplaintsCOC";
import ReportDashboard from "@/pages/COC/ReportDashboard";
import CreateReport from "@/components/ReportsCOC/ReportsCOC";
import EditReport from "@/components/ReportsCOC/EditReport";
import AnnouncementsCOC from "@/pages/COC/AnnouncementsCOC";
import PreferencesInst from "@/pages/Instructor/PreferenceInst";
import ComplaintsInst from "@/pages/Instructor/ComplaintsInst";
import InstructorReports from "@/pages/Instructor/InstructorReports";
import LoadingScreen from "@/components/LoadingScreen";
import NotFound from "@/pages/NotFound";
import PreferenceCH from "@/pages/ChairHead/PreferencesCH";
import COCDashboard from "@/pages/COC/COCDashboard";
import InstructorDashboard from "@/pages/Instructor/InstructorDashboard.jsx";
import ReportsDetail from "@/components/ReportsHOF/ReportsDetail";
import ReportDetailCOC from "@/components/ReportsCOC/ReportDetail";

const AppRoutes = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppInitialized(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !appInitialized) {
    return <LoadingScreen />;
  }
  console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

  return (
    <Router>
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        {user ? (
          <Route element={<Layout />}>
            {/* Dashboard routes for all roles */}
            <Route
              path="/dashboard"
              element={
                user.role === "HeadOfFaculty" ? <DashboardHF /> :
                user.role === "ChairHead" ? <ChairHeadDashboard /> :
                user.role === "COC" ? <COCDashboard /> :
                <InstructorDashboard />
              }
            />

            {/* HeadOfFaculty Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["HeadOfFaculty"]} />}>
              <Route path="/users" element={<UsersHF />} />
              <Route path="/chairs" element={<ChairsHF />} />
              <Route path="/positions" element={<PositionsHF />} />
              <Route path="/rules" element={<RulesHF />} />
              <Route path="/reports" element={<ReportsHF />} />
              <Route path="/reports/:reportId" element={<ReportsDetail />} />
              <Route path="/weights" element={<ManageWeights />} />
              <Route path="/announcementsView" element={<AnnouncementsView />} />
              <Route path="/announcementsHF" element={<AnnouncementsCH />} />
            </Route>

            {/* ChairHead Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["ChairHead"]} />}>
              <Route path="/courses" element={<CoursesCH />} />
              <Route path="/instructorManagement" element={<InstructorManagement />} />
              <Route path="/preferences" element={<PreferenceCH />} />
              <Route path="/preferencesForm" element={<PreferenceForm />} />
              <Route path="/assignments/auto/regular" element={<RegularAssignmentCH />} />
              <Route path="/assignments" element={<CourseAssignment />} />
              <Route path="/assignmentsCH" element={<ViewAssignmentsCH />} />
              <Route path="/complaintsCH" element={<ComplaintsCH />} />
              <Route path="/reportsCH" element={<ReportsHF />} />
              <Route path="/reportsCH/:reportId" element={<ReportsDetail />} />
              <Route path="/announcementsCH" element={<AnnouncementsCH />} />
              <Route path="/announcementsViewByCH" element={<AnnouncementsView />} />
            </Route>

            {/* COC Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["COC"]} />}>
              <Route path="/coursesCOC" element={<CoursesCH />} />
              <Route path="/assignments/auto/common" element={<CommonCoursesCOC />} />
              <Route path="/assignments/auto/extension" element={<ExtensionCoursesCOC />} />
              <Route path="/assignments/auto/summer" element={<SummerCoursesCOC />} />
              <Route path="/complaintsCOC" element={<ComplaintsCOC />} />
              <Route path="/reportsCOC" element={<ReportDashboard />} />
              <Route path="/reports/create" element={<CreateReport />} />
              <Route path="/reportsCOC/:id" element={<ReportDetailCOC />} />
              <Route path="/reports/:id/edit" element={<EditReport />} />
              <Route path="/announcementsCOC" element={<AnnouncementsCOC />} />
              <Route path="/announcementsViewByCOC" element={<AnnouncementsView />} />
            </Route>

            {/* Instructor Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["Instructor"]} />}>
              <Route path="/preferencesInst" element={<PreferencesInst />} />
              <Route path="/complaintsInst" element={<ComplaintsInst />} />
              <Route path="/announcementsInst" element={<AnnouncementsView />} />
              <Route path="/reportsInst" element={<InstructorReports />} />
              <Route path="/reportInst" element={<ReportsHF />} />
              <Route path="/reportInst/:reportId" element={<ReportsDetail />} />
            </Route>
            
            {/* Catch-all route for authenticated users */}
            <Route path="*" element={<NotFound />} />
          </Route>
        ) : (
          // Routes for non-authenticated users
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default AppRoutes;