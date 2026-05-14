import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE UNTUK POPUP EDIT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', role: '', password: '' });

  // Fungsi mengambil data user
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('aksara_token');
      const response = await axios.get('http://localhost:8000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
      alert("Akses ditolak atau terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- FUNGSI UNTUK MEMBUKA POPUP ---
  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      password: '' // Sengaja dikosongkan, hanya diisi jika ingin ganti password
    });
    setIsModalOpen(true);
  };

  // --- FUNGSI UNTUK MENGIRIM PERUBAHAN KE GOLANG ---
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('aksara_token');
      
      // Siapkan data yang mau dikirim
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role
      };
      
      // Jika kolom password diisi, ikutkan ke dalam pengiriman
      if (formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      // Tembak ke endpoint PUT /admin/users/:id
      await axios.put(`http://localhost:8000/admin/users/${editingUser.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Data pengguna berhasil diperbarui!");
      setIsModalOpen(false); // Tutup popup
      fetchUsers(); // Refresh tabel otomatis
      
    } catch (error) {
      console.error("Gagal update:", error);
      alert("Gagal memperbarui data pengguna.");
    }
  };

  return (
    <div style={{ padding: '20px 0', position: 'relative' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#09090B', margin: '0 0 8px 0' }}>User Management</h1>
        <p style={{ color: '#71717A', margin: 0, fontSize: '14px' }}>Kelola semua akun pengguna di platform Aksara.</p>
      </div>

      {/* --- TABEL PENGGUNA --- */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#F4F4F5', borderBottom: '1px solid #E4E4E7' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#71717A' }}>Nama Lengkap</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#71717A' }}>Email</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#71717A' }}>Role</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#71717A', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#A1A1AA' }}>Memuat data...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#A1A1AA' }}>Tidak ada pengguna ditemukan.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #E4E4E7' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#09090B' }}>{u.full_name}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#71717A' }}>{u.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                      backgroundColor: u.role === 'super_admin' ? '#FEF08A' : '#E4E4E7',
                      color: u.role === 'super_admin' ? '#854D0E' : '#3F3F46'
                    }}>
                      {u.role === 'super_admin' ? 'Super Admin' : 'User'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {/* Tombol Edit memanggil handleEditClick */}
                    <button 
                      onClick={() => handleEditClick(u)}
                      style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- POPUP / MODAL EDIT --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Edit Pengguna</h2>
            
            <form onSubmit={handleUpdateSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#3F3F46' }}>Nama Lengkap</label>
                <input 
                  type="text" required
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E4E4E7', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#3F3F46' }}>Email</label>
                <input 
                  type="email" required
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E4E4E7', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#3F3F46' }}>Role Akses</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E4E4E7', borderRadius: '6px', boxSizing: 'border-box' }}
                >
                  <option value="user">User Biasa</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#3F3F46' }}>Password Baru <span style={{ color: '#A1A1AA', fontSize: '11px' }}>(Kosongkan jika tidak ingin diubah)</span></label>
                <input 
                  type="password" 
                  placeholder="Masukkan password baru..."
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E4E4E7', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', backgroundColor: '#F4F4F5', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#3F3F46' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#09090B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;