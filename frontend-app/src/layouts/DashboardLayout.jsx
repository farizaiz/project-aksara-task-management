import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const navigate = useNavigate();

  // Fungsi sederhana untuk Logout
  const handleLogout = () => {
    // Di tahap selanjutnya, Anda bisa menghapus token JWT dari localStorage di sini
    alert("Berhasil keluar dari sesi!");
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f5f7', fontFamily: 'sans-serif' }}>
      
      {/* --- Sidebar Kiri (Statis) --- */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#2c3e50', 
        color: '#ecf0f1', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Nama Brand/Aplikasi */}
        <div style={{ borderBottom: '1px solid #34495e', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, letterSpacing: '1px' }}>Aksara</h2>
          <small style={{ color: '#bdc3c7' }}>Task Management</small>
        </div>

        {/* Menu Navigasi */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/" style={{ color: '#ecf0f1', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              📋 Papan Kerja (Board)
            </Link>
          </li>
          {/* Anda bisa menambahkan rute lain di masa depan */}
          <li style={{ marginBottom: '10px' }}>
             <span style={{ color: '#7f8c8d', display: 'block', padding: '10px', cursor: 'not-allowed' }}>
              ⚙️ Pengaturan (Segera Hadir)
             </span>
          </li>
        </ul>

        {/* Info Pengguna / Bawah Sidebar */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #34495e', textAlign: 'center' }}>
          <small style={{ color: '#7f8c8d' }}>Aksara v1.0.0</small>
        </div>
      </aside>

      {/* --- Konten Utama Kanan (Dinamis) --- */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        {/* Header Atas */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          paddingBottom: '15px',
          borderBottom: '1px solid #e1e4e8'
        }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>Area Kerja Utama</h3>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px', 
              cursor: 'pointer', 
              backgroundColor: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </header>
        
        {/* --- Area Konten Khusus Halaman (Outlet) --- */}
        {/* Komponen <Outlet /> ini sangat penting. Di sinilah React Router akan 
            "menyuntikkan" komponen anak (seperti papan Kanban) berdasarkan URL yang aktif */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', minHeight: '400px' }}>
           <Outlet />
        </div>

      </main>
    </div>
  );
};

export default DashboardLayout;