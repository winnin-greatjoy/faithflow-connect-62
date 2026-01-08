import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAuthz } from './hooks/useAuthz';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { DashboardSkeleton } from './components/ui/skeletons';

// Eager load critical pages
import Index from './pages/Index';
import Auth from './pages/Auth';

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SuperadminDashboard = lazy(() => import('./pages/SuperadminDashboard'));
const MemberProfilePage = lazy(() =>
  import('./pages/admin/MemberProfilePage').then((module) => ({
    default: module.MemberProfilePage,
  }))
);
const FirstTimerProfilePage = lazy(() =>
  import('./pages/admin/FirstTimerProfilePage').then((module) => ({
    default: module.FirstTimerProfilePage,
  }))
);
const DepartmentPage = lazy(() =>
  import('./pages/departments/DepartmentPage').then((module) => ({
    default: module.DepartmentPage,
  }))
);

// Lazy load portal pages
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'));
const HomePage = lazy(() =>
  import('./pages/portal/HomePage').then((module) => ({ default: module.HomePage }))
);
const ProfilePage = lazy(() =>
  import('./pages/portal/profilepage/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);
const EventsPage = lazy(() =>
  import('./pages/portal/EventsPage').then((module) => ({ default: module.EventsPage }))
);
const DepartmentsPage = lazy(() =>
  import('./pages/portal/DepartmentsPage').then((module) => ({
    default: module.DepartmentsPage,
  }))
);
const DirectoryPage = lazy(() => import('./pages/portal/DirectoryPage'));
const RegistrationsPage = lazy(() => import('./pages/portal/RegistrationsPage'));
const AttendancePage = lazy(() => import('./pages/portal/AttendancePage'));
const GroupsPage = lazy(() => import('./pages/portal/GroupsPage'));
const CalendarPage = lazy(() => import('./pages/portal/CalendarPage'));
const NotificationsPage = lazy(() => import('./pages/portal/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/portal/SettingsPage'));
const ShareAppPage = lazy(() => import('./pages/portal/ShareAppPage'));
const StreamingPage = lazy(() => import('@/pages/portal/StreamingPage'));
const QRCodePage = lazy(() => import('./pages/portal/profilepage/QRCodePage'));
const IDCardPage = lazy(() =>
  import('./pages/portal/profilepage/IDCardPage').then((module) => ({ default: module.IDCardPage }))
);
const ChangePasswordPage = lazy(() => import('./pages/portal/profilepage/ChangePasswordPage'));
const DirectorySettingsPage = lazy(
  () => import('./pages/portal/profilepage/DirectorySettingsPage')
);
const EditAccountInfoPage = lazy(() => import('./pages/portal/profilepage/EditAccountInfoPage'));
const MemberTransfersPage = lazy(() =>
  import('./pages/portal/MemberTransfersPage').then((m) => ({ default: m.MemberTransfersPage }))
);
const TransferRequestPage = lazy(() => import('./pages/portal/TransferRequestPage'));
const DistrictDashboard = lazy(() =>
  import('./components/admin/district/DistrictDashboard').then((m) => ({
    default: m.DistrictDashboard,
  }))
);
const EventDashboardPage = lazy(() => import('./pages/admin/EventDashboardPage'));
const PublicRegistrationPage = lazy(() =>
  import('./pages/public/PublicRegistrationPage').then((m) => ({
    default: m.PublicRegistrationPage,
  }))
);
const MobileEventApp = lazy(() => import('./pages/public/MobileEventApp'));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const SuperadminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasRole, loading } = useAuthz();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!hasRole('super_admin')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const DistrictAdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasRole, loading } = useAuthz();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!hasRole('district_admin')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

import { NotificationProvider } from './context/NotificationContext';

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <NotificationProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen p-6">
                <DashboardSkeleton />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/events/:eventId/register" element={<PublicRegistrationPage />} />
              <Route path="/events/:eventId/app" element={<MobileEventApp />} />
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
                <Route path="streaming" element={<StreamingPage />} />
                <Route path="streaming/:streamId" element={<StreamingPage />} />
                <Route path="transfer-request" element={<TransferRequestPage />} />
                <Route path="qr-code" element={<QRCodePage />} />
                <Route path="id-card" element={<IDCardPage />} />
                <Route path="change-password" element={<ChangePasswordPage />} />
                <Route path="directory-settings" element={<DirectorySettingsPage />} />
                <Route path="edit-account" element={<EditAccountInfoPage />} />
                <Route path="transfers" element={<MemberTransfersPage />} />
              </Route>
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
                path="/admin/transfers"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/member/:memberId"
                element={
                  <ProtectedRoute>
                    <MemberProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/first-timer/:timerId"
                element={
                  <ProtectedRoute>
                    <FirstTimerProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departments/:slug"
                element={
                  <ProtectedRoute>
                    <DepartmentPage />
                  </ProtectedRoute>
                }
              />
              {/* Standalone District Portal */}
              <Route
                path="/district-portal/:districtId"
                element={
                  <ProtectedRoute>
                    <DistrictDashboard />
                  </ProtectedRoute>
                }
              />

              {/* District Admin Branch Dashboard */}
              <Route
                path="/district-portal/branch/:branchId/*"
                element={
                  <ProtectedRoute>
                    <DistrictAdminOnlyRoute>
                      <AdminDashboard isPortalMode={true} />
                    </DistrictAdminOnlyRoute>
                  </ProtectedRoute>
                }
              />

              {/* Superadmin District Portal Branch Dashboard */}
              <Route
                path="/superadmin/district-portal/branch/:branchId/*"
                element={
                  <ProtectedRoute>
                    <SuperadminOnlyRoute>
                      <AdminDashboard isPortalMode={true} />
                    </SuperadminOnlyRoute>
                  </ProtectedRoute>
                }
              />

              {/* Standalone Branch Portal for Superadmins */}
              <Route
                path="/branch-portal/:branchId/*"
                element={
                  <ProtectedRoute>
                    <SuperadminOnlyRoute>
                      <AdminDashboard isPortalMode={true} />
                    </SuperadminOnlyRoute>
                  </ProtectedRoute>
                }
              />
              {/* Dedicated Superadmin Dashboard */}
              <Route
                path="/superadmin/*"
                element={
                  <ProtectedRoute>
                    <SuperadminOnlyRoute>
                      <SuperadminDashboard />
                    </SuperadminOnlyRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/event/:eventId/dashboard"
                element={
                  <ProtectedRoute>
                    <EventDashboardPage />
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
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
