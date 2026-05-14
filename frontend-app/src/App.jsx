import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Board from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import UserManagement from './pages/UserManagement';
// ----------------------------

// --- KOMPONEN PROTEKSI ---
// Fungsi ini bertugas mengecek apakah pengguna punya "tiket masuk" (token)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('aksara_token');
  
  if (!token) {
    // Jika tidak ada token, tendang kembali ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, izinkan melihat halaman yang diminta
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik: Bisa diakses siapa saja */}
        <Route path="/login" element={<Login />} />

        {/* Rute Privat: Dibungkus oleh ProtectedRoute */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Halaman Board Kanban (Akan tampil saat URL = "/") */}
          <Route index element={<Board />} />

          {/* --- TAMBAHKAN RUTE ADMIN DI SINI --- */}
          {/* Akan tampil saat URL = "/admin/users" dan tetap ada Sidebar-nya */}
          <Route path="admin/users" element={<UserManagement />} />
          {/* ------------------------------------ */}

        </Route>
        
        {/* Redirect jika rute tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;