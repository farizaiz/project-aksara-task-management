import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// IMPORT IKON MINIMALIS
import { 
  LayoutDashboard, CheckSquare, CreditCard, BookOpen, 
  FileText, Files, Activity, Settings, Shield, 
  Search, Bell, ChevronDown, User, LogOut 
} from 'lucide-react';
import logoAksara from '../assets/logo-aksara.png';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState({ full_name: 'Loading...', email: '', role: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('aksara_token');
        const response = await axios.get('http://localhost:8000/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Gagal memuat profil", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aksara_token'); 
    navigate('/login'); 
  };

  const getInitials = (name) => {
    if (!name || name === 'Loading...') return 'A';
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Home Dashboard';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/finance')) return 'Finance';
    if (pathname.startsWith('/learning')) return 'Learning';
    if (pathname.startsWith('/notes')) return 'Notes';
    if (pathname.startsWith('/documents')) return 'Documents';
    if (pathname.startsWith('/activity')) return 'Activity';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/admin/users')) return 'User Management';
    return 'Dashboard';
  };

  // --- 1. PISAHKAN MENU UTAMA (ATAS) ---
  const mainNavItems = [
    { name: 'Home Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'Tasks', icon: <CheckSquare size={18} />, path: '/tasks' },
    { name: 'Finance', icon: <CreditCard size={18} />, path: '/finance' },
    { name: 'Learning', icon: <BookOpen size={18} />, path: '/learning' },
    { name: 'Notes', icon: <FileText size={18} />, path: '/notes' },
    { name: 'Documents', icon: <Files size={18} />, path: '/documents' },
  ];

  // --- 2. PISAHKAN MENU ADMIN/SETTING (BAWAH) ---
  const bottomNavItems = [
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  if (user && user.role === 'super_admin') {
    bottomNavItems.push({ name: 'User Management', icon: <Shield size={18} />, path: '/admin/users' });
  }

  // Fungsi pembantu agar kode tombol menu tidak ditulis berulang-ulang
  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link 
        key={item.name} 
        to={item.path} 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
          borderRadius: '8px', textDecoration: 'none', 
          backgroundColor: isActive ? '#27272A' : 'transparent',
          color: isActive ? '#FFFFFF' : '#A1A1AA',
          transition: 'background-color 0.2s, color 0.2s'
        }}
      >
        {item.icon}
        <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500' }}>{item.name}</span>
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F9FAFB', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* === SIDEBAR KIRI === */}
      <div style={{ width: '260px', backgroundColor: '#111111', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
        
        {/* Logo */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoAksara} alt="Logo" style={{ width: '32px', height: 'auto' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Aksara</h2>
            <span style={{ fontSize: '11px', color: '#A1A1AA' }}>Daily Management Platform</span>
          </div>
        </div>

        {/* Menu Navigasi Utama (Flex 1 akan mendorong menu bawah ke paling dasar) */}
        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {mainNavItems.map(renderNavItem)}
        </nav>

        {/* Menu Navigasi Bawah (Settings & Admin) */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Garis pemisah opsional, hapus jika tidak suka */}
          <div style={{ height: '1px', backgroundColor: '#27272A', marginBottom: '8px', margin: '0 8px' }}></div>
          {bottomNavItems.map(renderNavItem)}
        </div>
      </div>

      {/* === AREA KONTEN UTAMA === */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* NAVBAR ATAS (Top Bar) */}
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 40px', gap: '24px' }}>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '11px', color: '#A1A1AA' }} />
            <input 
              type="text" 
              placeholder="Search tasks, notes, documents..." 
              style={{ width: '100%', padding: '10px 10px 10px 40px', backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: '20px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' }}>
            <Bell size={20} color="#3F3F46" />
            <span style={{ position: 'absolute', top: '4px', right: '6px', width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid #FFFFFF' }}></span>
          </button>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', backgroundColor: '#F4F4F5' }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#111111', color: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                {getInitials(user.full_name)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#111111' }}>{user.full_name}</span>
              <ChevronDown size={14} color="#71717A" />
            </button>

            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '220px', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E5E5E5', zIndex: 50, padding: '8px' }}>
                <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', color: '#3F3F46', fontSize: '13px' }}>
                  <User size={16} /> Profile
                </button>
                <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', color: '#3F3F46', fontSize: '13px' }}>
                  <Settings size={16} /> Account Settings
                </button>
                <div style={{ height: '1px', backgroundColor: '#E4E4E7', margin: '8px 0' }}></div>
                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', color: '#3F3F46', fontSize: '13px' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#09090B', margin: '0 0 24px 0' }}>
              {getPageTitle(location.pathname)}
            </h1>
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;