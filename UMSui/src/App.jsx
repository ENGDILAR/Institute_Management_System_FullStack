import "./App.css";
import Login from "./Pages/Auth/Login";
import Admindashboard from "./Pages/Admin/Admindashboard";

import Studentdashboard from "./Pages/Student/Studentdashboard";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Routes/ProtectedRoute";
import Unauthorized from "./Pages/Error Pages/Unauthorized";
import AdminDashboardLayout from "./Layoutes/AdminDashboardLayout";
import ViewStudents from "./Pages/Admin/Students/ViewStudents";
import { Toaster } from "sonner";
import ViewSubjects from "./Pages/Admin/Courses/ViewCourses";
import ViewInstructors from "./Pages/Admin/Instructors/ViewInstructors";
import ViewOffers from "./Pages/Admin/Offers/ViewOffeers";
import StudentDashboardLayout from "./Layoutes/StudentDashboardLayout";
import ViewCourseForStudent from "./Pages/Student/Courses/ViewCourses";
import StudentCourseOfferings from "./Pages/Student/CourseOffers/StudentCourseOfferings";
import ViewMyMarks from "./Pages/Student/Marks/ViewMyMarks";
import Instructordashboard from "./Pages/Instructor/Instructordashboard";
import InstructorsDashboardLayout from "./Layoutes/InstructorsDashboardLayout";

function App() {
  return (
    <>
      <Toaster />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute AllowedRoles={["admin"]}>
                <AdminDashboardLayout title="Admin Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Admindashboard />} />

            <Route path="students" element={<ViewStudents />} />
            <Route path="subjects" element={<ViewSubjects />} />
            <Route path="teachers" element={<ViewInstructors />} />
            <Route path="Courses" element={<ViewOffers />} />
          </Route>
          {
            //instructor
            //student
          }
          <Route
            path="/student"
            element={
              <ProtectedRoute AllowedRoles={["student"]}>
                <StudentDashboardLayout title="student Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Studentdashboard />} />

            <Route path="subjects" element={<StudentCourseOfferings />} />
            <Route path="Courses" element={<ViewCourseForStudent />} />
            <Route path="Degrees" element={<ViewMyMarks />} />
          </Route>

          <Route
            path="/instructor"
            element={
              <ProtectedRoute AllowedRoles={["instructor"]}>
                <InstructorsDashboardLayout title="instructor Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Instructordashboard />} />

            <Route path="Courses" element={<ViewOffers />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
