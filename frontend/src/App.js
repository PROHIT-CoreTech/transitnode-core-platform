import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './index.css';

// Lazy load pages for better performance
const Login = React.lazy(() => import('./views/Login'));
const Dashboard = React.lazy(() => import('./views/Dashboard'));
const PublicTracker = React.lazy(() => import('./views/PublicTracker'));
const AdminDashboard = React.lazy(() => import('./views/Admin/AdminDashboard'));
import YardArrivals from './views/GateOperations/YardArrivals';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <React.Suspense fallback={<div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading System...</div>}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tracker/:trackingId" element={<PublicTracker />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/yard-arrivals" element={
          <ProtectedRoute>
            <YardArrivals />
          </ProtectedRoute>
        } />
      </Routes>
    </React.Suspense>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
