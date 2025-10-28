
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import PortalDashboard from "./pages/portal/PortalDashboard";
import { HomePage } from "./pages/portal/HomePage";
import { ProfilePage } from "./pages/portal/profilepage/ProfilePage";
import { EventsPage } from "./pages/portal/EventsPage";
import { DepartmentsPage } from "./pages/portal/DepartmentsPage";
import DirectoryPage from "./pages/portal/DirectoryPage";
import RegistrationsPage from "./pages/portal/RegistrationsPage";
import AttendancePage from "./pages/portal/AttendancePage";
import GroupsPage from "./pages/portal/GroupsPage";
import CalendarPage from "./pages/portal/CalendarPage";
import NotificationsPage from "./pages/portal/NotificationsPage";
import SettingsPage from "./pages/portal/SettingsPage";
import ShareAppPage from "./pages/portal/ShareAppPage";
import QRCodePage from "./pages/portal/profilepage/QRCodePage";
import TwoFactorAuthPage from "./pages/portal/profilepage/TwoFactorAuthPage";
import ChangePasswordPage from "./pages/portal/profilepage/ChangePasswordPage";
import DirectorySettingsPage from "./pages/portal/profilepage/DirectorySettingsPage";
import EditAccountInfoPage from "./pages/portal/profilepage/EditAccountInfoPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <PortalDashboard />
            </ProtectedRoute>
          }

        >
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="share" element={<ShareAppPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="qr-code" element={<QRCodePage />} />
          <Route path="two-factor-auth" element={<TwoFactorAuthPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="directory-settings" element={<DirectorySettingsPage />} />
          <Route path="edit-account" element={<EditAccountInfoPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mens-ministry/:ministryId"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/womens-ministry/:ministryId"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/youth-ministry/:ministryId"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/childrens-ministry/:ministryId"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
