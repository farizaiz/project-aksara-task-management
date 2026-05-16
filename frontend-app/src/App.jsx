import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HomeDashboard from './pages/dashboard/HomeDashboard';
import Tasks from './pages/tasks/Tasks'; 
import ProjectDetail from './pages/tasks/ProjectDetail';
import UserManagement from './pages/admin/UserManagement';
// ----------------------------------------------------------------------

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('aksara_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Rute Privat */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeDashboard />} />

          {/* Rute Tasks */}
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:projectId" element={<ProjectDetail />} />

          {/* Rute Admin */}
          <Route path="admin/users" element={<UserManagement />} />
        </Route>
        
        {/* Redirect jika rute tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;