import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Search, ChevronRight, List as ListIcon, Folder
} from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Projects');
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // State baru untuk menghitung progress
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const tabs = ['All Projects', 'Personal', 'Shared'];

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('aksara_token');
      // 1. Ambil data projects
      const projRes = await axios.get('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (projRes.data && projRes.data.data) {
        setProjects(projRes.data.data);
      }
      
      // 2. Ambil semua tugas untuk menghitung statistik di Card
      try {
        const taskRes = await axios.get('http://localhost:8000/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (taskRes.data && taskRes.data.data) {
          setAllTasks(taskRes.data.data);
        }
      } catch (e) {
        console.warn("Belum bisa memuat tasks");
      }
    } catch (error) {
      console.error("Gagal memuat project:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const token = localStorage.getItem('aksara_token');
      await axios.post('http://localhost:8000/projects', {
        name: newProjectName,
        description: newProjectDesc,
        meta: activeTab === 'All Projects' ? 'Personal' : activeTab,
        bg_color: '#EEF2FF', // Warna biru muda ala mockup
        icon_color: '#4F46E5'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewProjectName('');
      setNewProjectDesc('');
      setIsAdding(false);
      fetchData(); 
    } catch (error) {
      console.error("Gagal membuat project:", error);
    }
  };

  // FUNGSI MENGHITUNG STATISTIK PROJECT
  const getProjectStats = (projectId) => {
    const projectTasks = allTasks.filter(t => t.project_id === projectId);
    const total = projectTasks.length;
    // Asumsi status selesai adalah 'Done' (bisa disesuaikan jika nama kolom Anda berbeda)
    const done = projectTasks.filter(t => t.status === 'Done' || t.status.toLowerCase().includes('done')).length;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, progress };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* HEADER & NEW PROJECT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: '#09090B' }}>Tasks</h1>
          <p style={{ color: '#71717A', fontSize: '14px', margin: 0 }}>Kelola tugas berdasarkan project pribadi dan keluarga.</p>
        </div>
        {/* Tombol New Project dipindah ke kanan atas */}
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#111111', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
        >
          <Plus size={16} /> {isAdding ? 'Batal' : 'New Project'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateProject} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E4E4E7', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Buat Project Baru</h3>
          <input autoFocus type="text" placeholder="Nama Project..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', outline: 'none' }} required />
          <input type="text" placeholder="Deskripsi singkat..." value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', outline: 'none' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Simpan Project</button>
        </form>
      )}

      {/* TABS, SEARCH & SORT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: activeTab === tab ? '1px solid #E4E4E7' : '1px solid transparent', backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent', color: activeTab === tab ? '#09090B' : '#71717A', boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#A1A1AA' }} />
          <input type="text" placeholder="Search projects..." style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E4E4E7', backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: '500', color: '#18181B', cursor: 'pointer' }}>
          <ListIcon size={16} color="#71717A" /> Sort: Recently Updated
        </div>
      </div>

      {/* PROJECTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          return (
            <div 
              key={project.id} 
              onClick={() => navigate(`/tasks/${project.id}`)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E4E4E7', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Kiri: Info Project */}
              <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: project.bg_color || '#EEF2FF', color: project.icon_color || '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Folder size={28} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#18181B' }}>{project.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: project.icon_color || '#4F46E5' }}></span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#71717A' }}>{project.meta}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#71717A' }}>{project.description}</p>
                </div>
              </div>

              {/* Kanan: Statistik (Tugas, Progress, Diperbarui) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#18181B' }}>{stats.total}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#71717A' }}>Total Tugas</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#16A34A' }}>{stats.done}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#71717A' }}>Selesai</p>
                </div>
                
                {/* Progress Circular */}
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `conic-gradient(${project.icon_color || '#4F46E5'} ${stats.progress}%, #F4F4F5 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#18181B' }}>
                    {stats.progress}%
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '100px', gap: '4px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#18181B' }}>Hari ini</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#A1A1AA' }}>Diperbarui</p>
                </div>

                <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', backgroundColor: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#18181B' }}>
                  Open Board <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  );
};

export default Tasks;