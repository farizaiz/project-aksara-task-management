import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// 1. IMPORT IKON MINIMALIS & LOGO (Pastikan file logo Anda ada)
// Pustaka 'lucide-react' menyediakan ikon-ikon minimalis yang bersih.
import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react'; 
import logoAksara from '../../assets/logo-aksara.png'; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // State baru untuk mengatur tampilan password (show/hide)
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const response = await axios.post('http://localhost:8000/login', {
        email: email,
        password: password
      });

      if (response.data && response.data.token) {
        localStorage.setItem('aksara_token', response.data.token);
        navigate('/'); 
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg('Gagal terhubung ke server. Pastikan API Gateway menyala.');
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#F3F4F6', 
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
    }}>
      
      {/* KOTAK LOGIN (Card) */}
      <div style={{ 
        display: 'flex', 
        width: '1000px', 
        height: '600px', 
        backgroundColor: '#FFFFFF', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)', 
        overflow: 'hidden' 
      }}>
        
        {/* === SISI KIRI (Dark Panel - Tetap Bergradasi Abu-abu) === */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #374151 0%, #030712 100%)', 
          color: '#FFFFFF', 
          padding: '60px 50px', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          {/* Logo & Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '0px' }}>
              <img 
                src={logoAksara} 
                alt="Aksara Logo" 
                style={{ width: '45px', height: 'auto', objectFit: 'contain' }} 
              />
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Aksara</h1>
            </div>
            {/* Tagline - jarak dirapatkan */}
            <span style={{ color: '#A1A1AA', fontSize: '14px', marginLeft: '60px', display: 'block', marginTop: '-4px' }}>
              Daily Management Platform
            </span>
          </div>

          {/* Tagline & Deskripsi Personal (Ukuran Font Kecil & Personal) */}
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}> 
            <h2 style={{ fontSize: '28px', lineHeight: '1.4', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Kelola keseharian.<br/>Pantau keuangan.<br/>Simpan catatan penting.
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: '#FFFFFF', marginBottom: '20px' }}></div>
            <p style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: '1.6', maxWidth: '90%' }}>
              Sistem personal untuk menjaga keseharian tetap terorganisir, produktif, dan dalam kendali penuh.
            </p>
            
            {/* Dekorasi Geometris (Subtle Pattern) */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 4px)', 
              gap: '8px', 
              marginTop: '40px', 
              opacity: 0.3 
            }}>
              {[...Array(24)].map((_, i) => (
                <div key={i} style={{ width: '4px', height: '4px', backgroundColor: '#FFFFFF', borderRadius: '50%' }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* === SISI KANAN (Form Area - Minimalist) === */}
        <div style={{ 
          flex: 1, 
          padding: '60px 80px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          backgroundColor: '#FFFFFF'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#111111' , textAlign: 'center'}}>Masuk ke Aksara</h2>
          <p style={{ margin: '0 0 35px 0', color: '#666666', fontSize: '15px', textAlign: 'center' }}>Silakan masuk untuk melanjutkan</p>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#FFF0F0', color: '#E00000', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #FFD6D6' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Input Email dengan Ikon Minimalis Envelope */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#111111' }}>Email</label>
              <div style={{ position: 'relative' }}>
                {/* --- GANTI IKON BEWARNA (✉️) JADI MINIMALIS (Mail) --- */}
                <Mail size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#888888' }} />
                <input 
                  type="email" 
                  placeholder="nama@contoh.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '14px 15px 14px 45px', // Padding untuk ikon kiri (Envelope)
                    backgroundColor: '#FAFAFA', 
                    border: '1px solid #E5E5E5', 
                    borderRadius: '8px', 
                    fontSize: '15px', 
                    color: '#333333',
                    boxSizing: 'border-box', 
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out'
                  }} 
                  onFocus={(e) => e.target.style.border = '1px solid #111111'}
                  onBlur={(e) => e.target.style.border = '1px solid #E5E5E5'}
                />
              </div>
            </div>

            {/* Input Password dengan Ikon Minimalis Lock & Visibility Toggle */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#111111' }}>Password</label>
              <div style={{ position: 'relative' }}>
                {/* --- GANTI IKON BEWARNA (🔒) JADI MINIMALIS (Lock) --- */}
                <Lock size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#888888' }} />
                <input 
                  // Tipe input berubah berdasarkan state showPassword
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Masukkan password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '14px 45px 14px 45px', // Padding untuk ikon kiri (Lock) & kanan (Eye)
                    backgroundColor: '#FAFAFA', 
                    border: '1px solid #E5E5E5', 
                    borderRadius: '8px', 
                    fontSize: '15px', 
                    color: '#333333',
                    boxSizing: 'border-box', 
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out'
                  }} 
                  onFocus={(e) => e.target.style.border = '1px solid #111111'}
                  onBlur={(e) => e.target.style.border = '1px solid #E5E5E5'}
                />
                
                {/* --- GANTI IKON BEWARNA (👁️) JADI MINIMALIS (Eye/EyeOff) & Tambah Tombol Toggle --- */}
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '15px', 
                    top: '14px', 
                    color: '#888888', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-10px' }}>
              <a href="#" style={{ fontSize: '13px', color: '#111111', textDecoration: 'none', fontWeight: '600' }}>Lupa password?</a>
            </div>

            {/* Tombol Masuk Utama */}
            <button 
              type="submit" 
              style={{ 
                padding: '14px', 
                backgroundColor: '#111111', 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '15px', 
                marginTop: '5px' 
              }}
            >
              Masuk
            </button>
          </form>

          {/* Garis Pemisah */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }}></div>
            <span style={{ padding: '0 15px', color: '#888888', fontSize: '13px' }}>atau</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }}></div>
          </div>

          {/* Tombol Masuk dengan Google */}
          <button style={{ 
            padding: '14px', 
            backgroundColor: '#FFFFFF', 
            color: '#111111', 
            border: '1px solid #E5E5E5', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '15px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>G</span> Masuk dengan Google
          </button>

        {/* Link Daftar */}
          <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#666666' }}>
             Belum punya akun? <Link to="/register" style={{ color: '#111111', fontWeight: 'bold', textDecoration: 'none' }}>Daftar sekarang</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;