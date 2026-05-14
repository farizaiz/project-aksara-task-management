import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoAksara from '../assets/logo-aksara.png'; 

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State untuk menyimpan data user yang login
  const [user, setUser] = useState({ full_name: 'Loading...', email: '' });
  
  // --- STATE BARU UNTUK FITUR EDIT NAMA ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  // ----------------------------------------

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
        console.error("Gagal memuat profil:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('aksara_token');
          navigate('/login', { replace: true });
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('aksara_token');
    navigate('/login', { replace: true });
  };

  // --- FUNGSI BARU UNTUK MENGIRIM NAMA KE BACKEND ---
  const handleUpdateName = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh saat submit form
    if (!editName.trim()) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('aksara_token');
      const response = await axios.put('http://localhost:8000/users/me', 
        { full_name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Jika berhasil, perbarui tampilan state user dengan nama baru
      setUser((prevUser) => ({ ...prevUser, full_name: response.data.data.full_name }));
      
      // Tutup modal
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Gagal update nama:", error);
      alert("Terjadi kesalahan saat memperbarui nama.");
    } finally {
      setIsUpdating(false);
    }
  };
  // ---------------------------------------------------

  const getInitials = (name) => {
    if (!name || name === 'Loading...') return '...';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const navItems = [
    { name: 'Dashboard', icon: '⊞', path: '/' },
    { name: 'Tasks', icon: '☑️', path: '/tasks' },
    { name: 'Finance', icon: '💳', path: '/finance' },
    { name: 'Learning', icon: '📚', path: '/learning' },
    { name: 'Notes', icon: '📝', path: '/notes' },
    { name: 'Documents', icon: '📄', path: '/documents' },
    { name: 'Activity', icon: '📈', path: '/activity' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  // Jika user yang login memiliki role 'super_admin', tambahkan menu rahasia
  if (user && user.role === 'super_admin') {
    navItems.push({ name: 'User Management', icon: '🛡️', path: '/admin/users' });
  }
  // ----------------------------

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FAFAFA', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* === SIDEBAR === */}
      <aside style={{ width: '260px', backgroundColor: '#09090B', color: '#A1A1AA', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        {/* Logo & Menu (Kode tetap sama) */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoAksara} alt="Logo" style={{ width: '28px', filter: 'brightness(0) invert(1)' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#FFFFFF', fontWeight: 'bold', letterSpacing: '-0.5px' }}>Aksara</h2>
            <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>Daily Management Platform</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 12px', marginTop: '10px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', margin: '4px 0',
                borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                backgroundColor: isActive ? '#27272A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#A1A1AA',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '16px', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid #27272A' }}>
          <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #27272A' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#27272A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '14px' }}>👥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: '600' }}>Home</div>
              <div style={{ fontSize: '11px', color: '#71717A' }}>Workspace</div>
            </div>
            <span style={{ fontSize: '10px' }}>▼</span>
          </div>
          
          <div onClick={handleLogout} style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer', marginTop: '8px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090B', fontSize: '12px', fontWeight: 'bold' }}>
              {getInitials(user.full_name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '11px', color: '#71717A' }}>Logout</div>
            </div>
          </div>
        </div>
      </aside>

      {/* === KONTEN UTAMA === */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA', overflow: 'hidden', position: 'relative' }}>
        
        {/* Top Navbar */}
        <header style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '10px 16px', width: '300px', border: '1px solid #E4E4E7' }}>
              <span style={{ color: '#A1A1AA', marginRight: '10px', fontSize: '14px' }}>🔍</span>
              <input type="text" placeholder="Search tasks, notes, documents..." style={{ border: 'none', backgroundColor: 'transparent', width: '100%', outline: 'none', fontSize: '13px', color: '#09090B' }} />
            </div>
            <span style={{ cursor: 'pointer', fontSize: '18px', color: '#71717A' }}>🔔</span>
            
            {/* AREA PROFIL NAVBAR - Sekarang bisa diklik untuk edit */}
            <div 
              onClick={() => {
                setEditName(user.full_name); 
                setIsEditModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', border: '1px solid #E4E4E7', backgroundColor: '#FFFFFF', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <div style={{ width: '24px', height: '24px', backgroundColor: '#09090B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px', fontWeight: 'bold' }}>
                {getInitials(user.full_name)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#09090B' }}>
                {user.full_name}
              </span>
              <span style={{ fontSize: '10px', color: '#71717A' }}>✎</span>
            </div>
          </div>
        </header>

        {/* Area Render */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 32px 32px 32px' }}>
          <Outlet />
        </div>

        {/* === MODAL EDIT PROFIL === */}
        {isEditModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 
          }}>
            <div style={{ 
              backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '16px', 
              width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#09090B' }}>Edit Profil</h3>
                <span onClick={() => setIsEditModalOpen(false)} style={{ cursor: 'pointer', color: '#A1A1AA', fontSize: '20px' }}>&times;</span>
              </div>
              
              <form onSubmit={handleUpdateName}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#71717A', marginBottom: '8px' }}>Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
                    autoFocus
                    required 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)} 
                    style={{ padding: '10px 16px', backgroundColor: '#FFFFFF', color: '#09090B', border: '1px solid #E4E4E7', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdating} 
                    style={{ padding: '10px 16px', backgroundColor: '#09090B', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', opacity: isUpdating ? 0.7 : 1 }}
                  >
                    {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;