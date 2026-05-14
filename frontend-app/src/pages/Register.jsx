import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'; 
import logoAksara from '../assets/logo-aksara.png'; // Pastikan path logo sesuai

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      // Menembak endpoint Register di Golang
      await axios.post('http://localhost:8000/register', {
        full_name: fullName,
        email: email,
        password: password
      });

      // Jika sukses, tampilkan pesan dan arahkan ke halaman Login
      setSuccessMsg('Pendaftaran berhasil! Mengarahkan ke halaman login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Jeda 2 detik sebelum pindah halaman

    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg('Gagal terhubung ke server. Pastikan API Gateway menyala.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* KOTAK REGISTER (Card) */}
      <div style={{ display: 'flex', width: '1000px', height: '600px', backgroundColor: '#FFFFFF', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* === SISI KIRI (Dark Panel - Konsisten dengan Login) === */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #374151 0%, #030712 100%)', color: '#FFFFFF', padding: '60px 50px', display: 'flex', flexDirection: 'column' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '0px' }}>
              <img src={logoAksara} alt="Aksara Logo" style={{ width: '45px', height: 'auto', objectFit: 'contain' }} />
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Aksara</h1>
            </div>
            <span style={{ color: '#A1A1AA', fontSize: '14px', marginLeft: '60px', display: 'block', marginTop: '-4px' }}>
              Daily Management Platform
            </span>
          </div>

          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}> 
            <h2 style={{ fontSize: '28px', lineHeight: '1.4', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Mulai perjalanan Anda.<br/>Kendalikan waktu.<br/>Capai lebih banyak.
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: '#FFFFFF', marginBottom: '20px' }}></div>
            <p style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: '1.6', maxWidth: '90%' }}>
              Bergabunglah dengan Aksara dan ubah cara Anda mengelola rutinitas, keuangan, dan catatan berharga setiap harinya.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 4px)', gap: '8px', marginTop: '40px', opacity: 0.3 }}>
              {[...Array(24)].map((_, i) => (
                <div key={i} style={{ width: '4px', height: '4px', backgroundColor: '#FFFFFF', borderRadius: '50%' }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* === SISI KANAN (Form Area) === */}
        <div style={{ flex: 1, padding: '50px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#111111', textAlign: 'center' }}>Daftar ke Aksara</h2>
          <p style={{ margin: '0 0 35px 0', color: '#666666', fontSize: '15px', textAlign: 'center' }}>Buat akun baru secara gratis</p>

          {/* Pesan Error & Sukses */}
          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#FFF0F0', color: '#E00000', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #FFD6D6' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', color: '#16A34A', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #BBF7D0' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Input Nama Lengkap */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#111111' }}>Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#888888' }} />
                <input 
                  type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  style={{ width: '100%', padding: '14px 15px 14px 45px', backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: '8px', fontSize: '14px', color: '#333333', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.border = '1px solid #111111'} onBlur={(e) => e.target.style.border = '1px solid #E5E5E5'}
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#111111' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#888888' }} />
                <input 
                  type="email" placeholder="nama@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '14px 15px 14px 45px', backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: '8px', fontSize: '14px', color: '#333333', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.border = '1px solid #111111'} onBlur={(e) => e.target.style.border = '1px solid #E5E5E5'}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#111111' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#888888' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  style={{ width: '100%', padding: '14px 45px 14px 45px', backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: '8px', fontSize: '14px', color: '#333333', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.border = '1px solid #111111'} onBlur={(e) => e.target.style.border = '1px solid #E5E5E5'}
                />
                <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '14px', color: '#888888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            {/* Tombol Daftar */}
            <button type="submit" style={{ padding: '14px', backgroundColor: '#111111', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '10px' }}>
              Daftar Sekarang
            </button>
          </form>

          {/* Link ke Login */}
          <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#666666' }}>
            Sudah punya akun? <Link to="/login" style={{ color: '#111111', fontWeight: 'bold', textDecoration: 'none' }}>Masuk di sini</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;