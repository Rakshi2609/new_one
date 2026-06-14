import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "@/pages/UploadPage";
import PlanPage from "@/pages/PlanPage";
import PatientCardPage from "@/pages/PatientCardPage";
import MedicationTrackerPage from "@/pages/MedicationTrackerPage";
import TimelinePage from "@/pages/TimelinePage";
import NotificationCenterPage from "@/pages/NotificationCenterPage";
import DashboardPage from "@/pages/DashboardPage";
import LandingPage from "@/pages/LandingPage";
import CoachPage from "@/pages/CoachPage";
import ReminderPage from "@/pages/ReminderPage";
import { NotificationProvider } from "@/contexts/NotificationContext";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DoctorDashboardPage from "@/pages/DoctorDashboardPage";
import { UserRole } from "@/types/models";


function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === UserRole.DOCTOR) {
    return <Navigate to="/doctor" replace />;
  }
  return <DashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected patient routes */}
            <Route path="/dashboard" element={<ProtectedRoute><HomeRoute /></ProtectedRoute>} />
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={[UserRole.DOCTOR]}><DoctorDashboardPage /></ProtectedRoute>} />

            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
            <Route path="/card" element={<ProtectedRoute><PatientCardPage /></ProtectedRoute>} />
            <Route path="/medications" element={<ProtectedRoute><MedicationTrackerPage /></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationCenterPage /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><CoachPage /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><ReminderPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
