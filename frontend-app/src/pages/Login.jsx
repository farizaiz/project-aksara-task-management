import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 1. IMPORT LOGO DI SINI (Pastikan ekstensi dan namanya sesuai dengan file yang Anda simpan)
import logoAksara from '../assets/logo-aksara.png'; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
        
        {/* === SISI KIRI (Dark Charcoal Panel) === */}
        <div style={{ 
          flex: 1, 
          backgroundColor: '#111111', 
          color: '#FFFFFF', 
          padding: '60px 50px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between' 
        }}>
          {/* Logo & Brand Aktual */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
              {/* Menggunakan tag <img /> untuk memanggil logo */}
              <img 
                src={logoAksara} 
                alt="Aksara Logo" 
                style={{ width: '45px', height: 'auto', objectFit: 'contain' }} 
              />
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Aksara</h1>
            </div>
            {/* Menggeser margin kiri agar tulisan sejajar dengan teks Aksara */}
            <span style={{ color: '#A1A1AA', fontSize: '14px', marginLeft: '60px' }}>Task Management System</span>
          </div>

          {/* Tagline & Deskripsi */}
          <div>
            <h2 style={{ fontSize: '36px', lineHeight: '1.3', fontWeight: 'bold', margin: '0 0 20px 0' }}>
              Kelola tugas.<br/>Tingkatkan kolaborasi.<br/>Capai tujuan.
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: '#FFFFFF', marginBottom: '20px' }}></div>
            <p style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: '1.6', maxWidth: '90%' }}>
              Aksara membantu tim Anda tetap terorganisir dan produktif setiap hari.
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

          {/* Footer Info */}
          <div style={{ color: '#A1A1AA', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>👥</span> Bersama tim, semua jadi lebih mudah.
          </div>
        </div>

        {/* === SISI KANAN (Form Area - Minimalist SaaS) === */}
        <div style={{ 
          flex: 1, 
          padding: '60px 80px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          backgroundColor: '#FFFFFF'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#111111' }}>Masuk ke Aksara</h2>
          <p style={{ margin: '0 0 35px 0', color: '#666666', fontSize: '15px' }}>Silakan masuk untuk melanjutkan</p>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#FFF0F0', color: '#E00000', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #FFD6D6' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Input Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#111111' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '15px', top: '14px', color: '#888888' }}>✉️</span>
                <input 
                  type="email" 
                  placeholder="nama@contoh.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '14px 15px 14px 45px', 
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

            {/* Input Password */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#111111' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '15px', top: '14px', color: '#888888' }}>🔒</span>
                <input 
                  type="password" 
                  placeholder="Masukkan password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '14px 45px', 
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
                <span style={{ position: 'absolute', right: '15px', top: '14px', color: '#888888', cursor: 'pointer' }}>👁️</span>
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
            Belum punya akun? <a href="#" style={{ color: '#111111', fontWeight: 'bold', textDecoration: 'none' }}>Daftar sekarang</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;