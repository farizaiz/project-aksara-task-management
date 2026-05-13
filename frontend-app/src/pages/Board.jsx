import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const columns = ['To Do', 'In Progress', 'Done'];

  // Fungsi untuk mengambil data tugas dari Backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Ambil tiket masuk (token) dari localStorage
        const token = localStorage.getItem('aksara_token');
        
        // Menembak API Gateway
        const response = await axios.get('http://localhost:8000/tasks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Simpan data dari backend ke dalam state React
        if (response.data && response.data.data) {
          setTasks(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Gagal memuat tugas:", error);
        setErrorMsg('Gagal terhubung ke server untuk memuat tugas.');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div style={{ padding: '20px', color: '#71717a' }}>Memuat Papan Kerja...</div>;
  if (errorMsg) return <div style={{ padding: '20px', color: '#ef4444' }}>{errorMsg}</div>;

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {columns.map((column) => (
        <div key={column} style={{ 
          backgroundColor: '#F4F5F7', 
          borderRadius: '10px', 
          width: '320px', 
          padding: '15px',
          minHeight: '400px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {/* Header Kolom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#172b4d', fontSize: '15px', fontWeight: '600' }}>{column}</h4>
            <span style={{ backgroundColor: '#E1E4E8', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#5E6C84' }}>
              {tasks.filter((t) => t.status === column).length}
            </span>
          </div>
          
          {/* List Kartu Tugas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks
              .filter((t) => t.status === column)
              .map((task) => (
                <div key={task.id} style={{ 
                  backgroundColor: 'white', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'grab',
                  border: '1px solid transparent',
                  transition: 'border 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.border = '1px solid #3498db'}
                onMouseOut={(e) => e.currentTarget.style.border = '1px solid transparent'}
                >
                  <div style={{ fontSize: '14px', color: '#172b4d', fontWeight: '500', marginBottom: '8px' }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '12px', color: '#7A869A', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description}
                    </div>
                  )}
                </div>
              ))}
          </div>
            
          {/* Tombol Tambah Tugas */}
          <button style={{ 
            width: '100%', 
            padding: '10px', 
            marginTop: '10px',
            border: 'none', 
            backgroundColor: 'transparent', 
            textAlign: 'left',
            cursor: 'pointer',
            color: '#5E6C84',
            fontWeight: '600',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EBECF0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            + Tambah tugas baru
          </button>
        </div>
      ))}
    </div>
  );
};

export default Board;