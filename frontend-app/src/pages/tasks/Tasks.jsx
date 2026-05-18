import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Search, ChevronRight, List as ListIcon, Folder, Trash2, MoreHorizontal, Edit2, Copy, Archive
} from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]); 
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  
  // State untuk Menu & Modal
  const [openMenuId, setOpenMenuId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const tabs = ['All Tasks', 'Personal', 'Shared', 'Archived'];

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

  // Menutup menu dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuId && !e.target.closest(`.menu-container-${openMenuId}`)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const token = localStorage.getItem('aksara_token');
      await axios.post('http://localhost:8000/projects', {
        name: newProjectName,
        description: newProjectDesc,
        meta: activeTab === 'All Tasks' || activeTab === 'Archived' ? 'Personal' : activeTab,
        bg_color: '#EEF2FF', 
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

  // Eksekusi Hapus Project via Modal
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.delete(`http://localhost:8000/projects/${projectToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectToDelete(null);
      fetchData(); // Refresh daftar project setelah dihapus
    } catch (error) {
      console.error("Gagal menghapus project:", error);
      alert("Terjadi kesalahan saat menghapus project.");
    }
  };

  const getProjectStats = (projectId) => {
    const projectTasks = allTasks.filter(t => t.project_id === projectId);
    const total = projectTasks.length;
    const done = projectTasks.filter(t => t.status === 'Done' || t.status.toLowerCase().includes('done')).length;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, progress };
  };

  const getUpdatedText = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Filter berdasarkan Tab
  const filteredProjects = projects.filter(p => {
    if (activeTab === 'All Tasks') return p.meta !== 'Archived';
    return p.meta === activeTab;
  });

  // Urutkan project: Yang paling baru dibuat ada di atas
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '"Inter", "Segoe UI", sans-serif', position: 'relative' }}>
      
      {/* HEADER & NEW PROJECT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          {/* Tag H1 Tasks telah dihapus di sini agar tidak dobel dengan DashboardLayout */}
          <p style={{ color: '#71717A', fontSize: '14px', margin: 0 }}>Kelola semua tugas berdasarkan project pribadi dan bersama Anda.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#111111', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272A'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}
        >
          <Plus size={16} /> {isAdding ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateProject} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E4E4E7', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Buat Project Baru</h3>
          <input autoFocus type="text" placeholder="Nama Project..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', outline: 'none', fontSize: '14px' }} required />
          <input type="text" placeholder="Deskripsi singkat..." value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', outline: 'none', fontSize: '14px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#71717A', border: '1px solid #E4E4E7', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Batal</button>
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#111111', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Simpan Project</button>
          </div>
        </form>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: activeTab === tab ? '1px solid #E4E4E7' : '1px solid transparent', backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent', color: activeTab === tab ? '#09090B' : '#71717A', boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH & SORT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#A1A1AA' }} />
          <input type="text" placeholder="Search projects..." style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E4E4E7', backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: '500', color: '#18181B', cursor: 'pointer' }}>
          <ListIcon size={16} color="#71717A" /> Sort: Recently Updated <ChevronRight size={14} style={{ transform: 'rotate(90deg)', color: '#A1A1AA' }} />
        </div>
      </div>

      {/* PROJECTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
        {sortedProjects.map((project) => {
          const stats = getProjectStats(project.id);
          return (
            <div 
              key={project.id} 
              onClick={() => navigate(`/tasks/${project.id}`)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E4E4E7', cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#D4D4D8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E4E4E7'; }}
            >
              {/* Kiri: Info Project */}
              <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: project.bg_color || '#EEF2FF', color: project.icon_color || '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Folder size={28} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#18181B' }}>{project.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: project.icon_color || '#4F46E5' }}></span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717A' }}>{project.meta}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#A1A1AA' }}>{project.description || 'Tidak ada deskripsi'}</p>
                </div>
              </div>

              {/* Tengah: Statistik & Progress (Dibuat Lebih Ringan) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px', paddingRight: '40px', borderRight: '1px solid #F4F4F5' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#18181B' }}>{stats.total}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#A1A1AA', fontWeight: '500' }}>Total Tasks</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#16A34A' }}>{stats.done}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#A1A1AA', fontWeight: '500' }}>Done</p>
                </div>
                
                {/* Progress Circular Lighter */}
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `conic-gradient(${project.icon_color || '#3B82F6'} ${stats.progress}%, #F4F4F5 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#18181B' }}>
                    {stats.progress}%
                  </div>
                </div>
              </div>

              {/* Kanan: Tanggal Update, Tombol Open & Aksi Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '80px', gap: '4px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#A1A1AA', fontWeight: '500' }}>Updated</p>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#18181B' }}>{getUpdatedText(project.updated_at)}</p>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${project.id}`); }}
                  style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#18181B', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Open Board
                </button>

                {/* Tiga Titik Dropdown Aksi */}
                <div className={`menu-container-${project.id}`} style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                    style={{ background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#A1A1AA', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#18181B'; e.currentTarget.style.backgroundColor = '#F4F4F5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = openMenuId === project.id ? '#18181B' : '#A1A1AA'; e.currentTarget.style.backgroundColor = openMenuId === project.id ? '#F4F4F5' : 'transparent'; }}
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {openMenuId === project.id && (
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '180px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#3F3F46', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Edit2 size={14} color="#71717A" /> Edit project
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#3F3F46', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Copy size={14} color="#71717A" /> Duplicate project
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#3F3F46', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Archive size={14} color="#71717A" /> Archive project
                      </button>
                      
                      <div style={{ height: '1px', backgroundColor: '#E4E4E7', margin: '4px 0' }}></div>
                      
                      <button 
                        onClick={() => { setProjectToDelete(project); setOpenMenuId(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#EF4444', borderRadius: '6px', fontWeight: '500' }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={14} color="#EF4444" /> Delete project
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )
        })}
      </div>

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {projectToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '400px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#18181B' }}>Delete project "{projectToDelete.name}"?</h3>
              <button onClick={() => setProjectToDelete(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA' }}><X size={18} /></button>
            </div>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#71717A', lineHeight: '1.5' }}>
              Project ini berisi <b>{getProjectStats(projectToDelete.id).total} task</b>. Semua task, komentar, dan lampiran di dalamnya akan ikut terhapus secara permanen.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setProjectToDelete(null)} style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#18181B', border: '1px solid #E4E4E7', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={confirmDeleteProject} style={{ padding: '8px 16px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;