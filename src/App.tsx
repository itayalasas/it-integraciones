import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import NewRequest from './components/Requests/NewRequest';
import RequestsList from './components/Requests/RequestsList';
import RequestDetail from './components/Requests/RequestDetail';
import ApprovalsList from './components/Approvals/ApprovalsList';
import Settings from './components/Settings/Settings';
import Reports from './components/Reports/Reports';
import ApprovedRequestsList from './components/ApprovedRequests/ApprovedRequestsList';
import UserManagement from './components/UserManagement/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests/new" element={<NewRequest />} />
            <Route path="requests" element={<RequestsList />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="approvals" element={<ApprovalsList />} />
            <Route path="approved-requests" element={<ApprovedRequestsList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;