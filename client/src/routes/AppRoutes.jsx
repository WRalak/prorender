import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/common/Layout';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Public pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Subscription from '../pages/Subscription';

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

// Service Test Dashboard
const ServiceTestDashboard = lazy(() => import('../components/ServiceTestDashboard'));

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

  // Don't show loading state for initial auth check
  // Only show loading when actually loading user data
  if (loading && user !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <Layout>
          <LazyWrapper><Home /></LazyWrapper>
        </Layout>
      } />
      <Route path="/login" element={
        <div className="min-h-screen flex flex-col">
          <Login />
          <Footer />
        </div>
      } />
      <Route path="/register" element={
        <div className="min-h-screen flex flex-col">
          <Register />
          <Footer />
        </div>
      } />
      <Route path="/forgot-password" element={
        <div className="min-h-screen flex flex-col">
          <ForgotPassword />
          <Footer />
        </div>
      } />
      <Route path="/reset-password/:token" element={
        <div className="min-h-screen flex flex-col">
          <ResetPassword />
          <Footer />
        </div>
      } />
      <Route path="/verify-email/:token" element={
        <div className="min-h-screen flex flex-col">
          <VerifyEmail />
          <Footer />
        </div>
      } />
      <Route path="/about" element={
        <Layout>
          <About />
        </Layout>
      } />
      <Route path="/contact" element={
        <Layout>
          <Contact />
        </Layout>
      } />
      <Route path="/subscription" element={
        <Layout>
          <Subscription />
        </Layout>
      } />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Dashboard /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Property routes */}
      <Route path="/properties" element={
        <Layout>
          <LazyWrapper><Properties /></LazyWrapper>
        </Layout>
      } />
      <Route path="/properties/:id" element={
        <Layout>
          <LazyWrapper><PropertyDetails /></LazyWrapper>
        </Layout>
      } />

      {/* Application routes */}
      <Route path="/applications" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Applications /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/applications/:id" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><ApplicationDetails /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Message routes */}
      <Route path="/messages" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Messages /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/messages/:conversationId" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Conversation /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Payment routes */}
      <Route path="/payments" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Payments /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/payments/:id" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><PaymentDetails /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Maintenance routes */}
      <Route path="/maintenance" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Maintenance /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/maintenance/:id" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><MaintenanceDetails /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Profile routes */}
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Profile /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Layout>
            <LazyWrapper><Settings /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Agent routes */}
      <Route path="/agent/dashboard" element={
        <PrivateRoute roles={['agent']}>
          <Layout>
            <LazyWrapper><AgentDashboard /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/agent/properties" element={
        <PrivateRoute roles={['agent']}>
          <Layout>
            <LazyWrapper><MyProperties /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/agent/properties/add" element={
        <PrivateRoute roles={['agent']}>
          <Layout>
            <LazyWrapper><AddProperty /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/agent/properties/:id/edit" element={
        <PrivateRoute roles={['agent']}>
          <Layout>
            <LazyWrapper><EditProperty /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/agent/applications" element={
        <PrivateRoute roles={['agent']}>
          <Layout>
            <LazyWrapper><TenantApplications /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <Layout>
            <LazyWrapper><AdminDashboard /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <Layout>
            <LazyWrapper><UserManagement /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/settings" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <Layout>
            <LazyWrapper><SystemSettings /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/reports" element={
        <PrivateRoute roles={['admin', 'super_admin']}>
          <Layout>
            <LazyWrapper><Reports /></LazyWrapper>
          </Layout>
        </PrivateRoute>
      } />

      {/* Service Test Dashboard */}
      <Route path="/test-services" element={
        <div className="min-h-screen flex flex-col">
          <LazyWrapper><ServiceTestDashboard /></LazyWrapper>
          <Footer />
        </div>
      } />

      {/* 404 */}
      <Route path="*" element={
        <Layout>
          <LazyWrapper><NotFound /></LazyWrapper>
        </Layout>
      } />
    </Routes>
  );
};

export default AppRoutes;