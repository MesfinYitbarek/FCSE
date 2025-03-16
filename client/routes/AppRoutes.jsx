import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Sidebar from "../src/components/Sidebar";
import ProtectedRoute from "./ProtectedRoutes";
import Login from "../src/pages/Login";

// HeadOfFaculty Pages
import DashboardHF from "../src/pages/HeadOfFaculty/DashboardHF";
import UsersHF from "../src/pages/HeadOfFaculty/UsersHF";
import ChairsHF from "../src/pages/HeadOfFaculty/ChairsHF";
import PositionsHF from "../src/pages/HeadOfFaculty/PositionsHF";
import RulesHF from "../src/pages/HeadOfFaculty/RulesHF";
import ReportsHF from "../src/pages/HeadOfFaculty/ReportsHF";


// ChairHead Pages
import ChairHeadDashboard from "../src/pages/ChairHead/ChairHeadDashboard.jsx";
import CoursesCH from "../src/pages/ChairHead/CoursesCH";
import PreferencesCH from "../src/pages/ChairHead/PreferencesCH";
import PreferenceForm from "../src/pages/ChairHead/PreferenceForm";
import RegularAssignmentCH from "../src/pages/ChairHead/RegularAssignmentCH";
import CourseAssignment from "../src/pages/ChairHead/CourseAssignment";
import ViewAssignmentsCH from "../src/pages/ChairHead/ViewAssignmentsCH";
import ComplaintsCH from "../src/pages/ChairHead/ComplaintsCH";
import ReportsCH from "../src/pages/ChairHead/ReportsCH";
import AnnouncementsCH from "../src/pages/ChairHead/AnnouncementsCH";

// COC Pages
import DashboardCOC from "../src/pages/COC/COCDashboard.jsx";


// Instructor Pages
import DashboardInst from "../src/pages/Instructor/InstructorDashboard.jsx";
import InstructorReports from "../src/pages/Instructor/InstructorReports.jsx"
import PreferenceInst from "../src/pages/Instructor/PreferenceInst.jsx";
import AssignmentsInst from "../src/pages/Instructor/AssignmentsInst.jsx";
import CommonCoursesCOC from "../src/pages/COC/CommonCoursesCOC.jsx";
import ExtensionCoursesCOC from "../src/pages/COC/ExtensionCoursesCOC.jsx";
import SummerCoursesCOC from "../src/pages/COC/SummerCoursesCOC.jsx";
import ComplaintsCOC from "../src/pages/COC/ComplaintsCOC.jsx";
import AnnouncementsCOC from "../src/pages/COC/AnnouncementsCOC.jsx";
import AnnouncementsView from "../src/pages/AnnouncementsView.jsx";
import ComplaintsInst from "../src/pages/Instructor/ComplaintsInst.jsx";
import InstructorManagement from "../src/pages/ChairHead/InstructorManagement.jsx";
import ManageWeights from "../src/pages/HeadOfFaculty/ManageWeights.jsx";
import ReportDashboard from "../src/pages/COC/ReportDashboard.jsx";
import ReportDetail from "../src/pages/COC/ReportDetail.jsx";
import EditReport from "../src/pages/COC/EditReport.jsx";
import CreateReport from "../src/pages/COC/ReportsCOC.jsx";

const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      {user ? (
        <div className="flex  h-screen overflow-hidden">
          <Sidebar />
          {/* Main content area */}
          <main className="flex-1  mt-16 p-4 overflow-auto">
            <Routes>
              {/* Dashboard route for all roles */}
              <Route
                path="/dashboard"
                element={
                  user.role === "HeadOfFaculty" ? (
                    <DashboardHF />
                  ) : user.role === "ChairHead" ? (
                    <ChairHeadDashboard />
                  ) : user.role === "COC" ? (
                    <DashboardCOC />
                  ) : (
                    <DashboardInst />
                  )
                }
              />

              {/* HeadOfFaculty Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["HeadOfFaculty"]} />}>
                <Route path="/users" element={<UsersHF />} />
                <Route path="/chairs" element={<ChairsHF />} />
                <Route path="/positions" element={<PositionsHF />} />
                <Route path="/rules" element={<RulesHF />} />
                <Route path="/reports" element={<ReportsHF />} />
                <Route path="/weights" element={<ManageWeights />} />
                <Route path="/reports" element={<ReportsHF />} />
                <Route path="/announcementsView" element={<AnnouncementsView />} />
              </Route>

              {/* ChairHead Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ChairHead"]} />}>
                <Route path="/courses" element={<CoursesCH />} />
                <Route path="/preferences" element={<PreferencesCH />} />
                <Route path="/preferencesForm" element={<PreferenceForm />} />
                <Route path="/assignments/auto/regular" element={<RegularAssignmentCH />} />
                <Route path="/assignments" element={<CourseAssignment />} />
                <Route path="/assignmentsCH" element={<ViewAssignmentsCH />} />
                <Route path="/complaintsCH" element={<ComplaintsCH />} />
                <Route path="/reportsCH" element={<ReportsCH />} />
                <Route path="/announcementsCH" element={<AnnouncementsCH />} />
                <Route path="/announcementsView" element={<AnnouncementsView />} />
                <Route path="/instructorManagement" element={<InstructorManagement />} />
              </Route>

              {/* COC Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["COC"]} />}>
                <Route path="/assignments/auto/common" element={<CommonCoursesCOC />} />
                <Route path="/assignments/auto/extension" element={<ExtensionCoursesCOC />} />
                <Route path="/assignments/auto/summer" element={<SummerCoursesCOC />} />
                <Route path="/complaintsCOC" element={<ComplaintsCOC />} />

                <Route path="/announcementsCOC" element={<AnnouncementsCOC />} />
                <Route path="/announcementsView" element={<AnnouncementsView />} />
                <Route path="/reportsCOC" element={<ReportDashboard />} />
                <Route path="/reports/create" element={<CreateReport />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
                <Route path="/reports/:id/edit" element={<EditReport />} />
              </Route>

              {/* Instructor Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Instructor"]} />}>
                <Route path="/preferencesInst" element={<PreferenceInst />} />
                <Route path="/assignmentsInst" element={<AssignmentsInst />} />
                <Route path="/complaintsInst" element={<ComplaintsInst />} />
                <Route path="/announcementsInst" element={<AnnouncementsView />} />
                <Route path="/reportsInst" element={<InstructorReports />} />
              </Route>
            </Routes>
          </main>
        </div>
      ) : (
        // If not authenticated, show only the Login page.
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        </Routes>
      )}
    </Router>
  );
};

export default AppRoutes;
