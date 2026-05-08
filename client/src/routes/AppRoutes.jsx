import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Public pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';

// Lazy loaded pages
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Properties = lazy(() => import('../pages/properties/Properties'));
const PropertyDetails = lazy(() => import('../pages/properties/PropertyDetails'));
const Applications = lazy(() => import('../pages/applications/Applications'));
const ApplicationDetails = lazy(() => import('../pages/applications/ApplicationDetails'));
const Messages = lazy(() => import('../pages/messages/Messages'));
const Conversation = lazy(() => import('../pages/messages/Conversation'));
const Payments = lazy(() => import('../pages/payments/Payments'));
const PaymentDetails = lazy(() => import('../pages/payments/PaymentDetails'));
const Maintenance = lazy(() => import('../pages/maintenance/Maintenance'));
const MaintenanceDetails = lazy(() => import('../pages/maintenance/MaintenanceDetails'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const Settings = lazy(() => import('../pages/settings/Settings'));

// Agent pages
const AgentDashboard = lazy(() => import('../pages/agent/AgentDashboard'));
const MyProperties = lazy(() => import('../pages/agent/MyProperties'));
const AddProperty = lazy(() => import('../pages/agent/AddProperty'));
const EditProperty = lazy(() => import('../pages/agent/EditProperty'));
const TenantApplications = lazy(() => import('../pages/agent/TenantApplications'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement/UserManagement'));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'));
const Reports = lazy(() => import('../pages/admin/Reports/Reports'));

// Landing page
const Home = lazy(() => import('../pages/Home'));

// Not found
const NotFound = lazy(() => import('../pages/NotFound'));

// Loading wrapper for lazy components
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner size="large" />}>
    {children}
  </Suspense>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LazyWrapper><Home /></LazyWrapper>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Dashboard /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Property routes */}
      <Route path="/properties" element={<LazyWrapper><Properties /></LazyWrapper>} />
      <Route path="/properties/:id" element={<LazyWrapper><PropertyDetails /></LazyWrapper>} />

      {/* Application routes */}
      <Route path="/applications" element={
        <PrivateRoute>
          <LazyWrapper><Applications /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/applications/:id" element={
        <PrivateRoute>
          <LazyWrapper><ApplicationDetails /></LazyWrapper>
        </PrivateRoute>
      } />

      {/* Message routes */}
      <Route path="/messages" element={
        <PrivateRoute>
          <LazyWrapper><Messages /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/messages/:conversationId" element={
        <PrivateRoute>
          <LazyWrapper><Conversation /></LazyWrapper>
        </PrivateRoute>
      } />

      {/* Payment routes */}
      <Route path="/payments" element={
        <PrivateRoute>
          <LazyWrapper><Payments /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/payments/:id" element={
        <PrivateRoute>
          <LazyWrapper><PaymentDetails /></LazyWrapper>
        </PrivateRoute>
      } />

      {/* Maintenance routes */}
      <Route path="/maintenance" element={
        <PrivateRoute>
          <LazyWrapper><Maintenance /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/maintenance/:id" element={
        <PrivateRoute>
          <LazyWrapper><MaintenanceDetails /></LazyWrapper>
        </PrivateRoute>
      } />

      {/* Profile routes */}
      <Route path="/profile" element={
        <PrivateRoute>
          <LazyWrapper><Profile /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <LazyWrapper><Settings /></LazyWrapper>
        </PrivateRoute>
      } />

      {/* Agent routes */}
      <Route path="/agent/dashboard" element={
        <PrivateRoute roles={['agent']}>
          <LazyWrapper><AgentDashboard /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/agent/properties" element={
        <PrivateRoute roles={['agent']}>
          <LazyWrapper><MyProperties /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/agent/properties/add" element={
        <PrivateRoute roles={['agent']}>
          <LazyWrapper><AddProperty /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/agent/properties/:id/edit" element={
        <PrivateRoute roles={['agent']}>
          <LazyWrapper><EditProperty /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/agent/applications" element={
        <PrivateRoute roles={['agent']}>
          <LazyWrapper><TenantApplications /></LazyWrapper>
        </PrivateRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <LazyWrapper><AdminDashboard /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <LazyWrapper><UserManagement /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/admin/settings" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <LazyWrapper><SystemSettings /></LazyWrapper>
        </PrivateRoute>
      } />
      <Route path="/admin/reports" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <LazyWrapper><Reports /></LazyWrapper>
        </PrivateRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<LazyWrapper><NotFound /></LazyWrapper>} />
    </Routes>
  );
};

export default AppRoutes;