import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Search, ChevronRight, List as ListIcon, Folder, Trash2, MoreHorizontal, Edit2, Copy, Archive, X, Filter, User, Users
} from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();
  
  // Tab diubah sesuai desain terbaru
  const [activeTab, setActiveTab] = useState('All Projects');
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]); 
  
  // State untuk Modal New Project
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState('Personal'); 
  const [newProjectCategory, setNewProjectCategory] = useState(''); 
  const [newProjectDesc, setNewProjectDesc] = useState('');
  
  // State untuk Filter & Sort
  const [filterCategory, setFilterCategory] = useState('All Categories');

  // State untuk Menu & Modal Delete
  const [openMenuId, setOpenMenuId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // State untuk Modal Edit Project
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectType, setEditProjectType] = useState('Personal');
  const [editProjectCategory, setEditProjectCategory] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');

  const tabs = ['All Projects', 'Personal', 'Shared', 'Archived'];

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('aksara_token');
      const projRes = await axios.get('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (projRes.data && projRes.data.data) {
        setProjects(projRes.data.data);
      }
      
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuId && !e.target.closest(`.menu-container-${openMenuId}`)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const parseMeta = (metaString) => {
    try {
      const parsed = JSON.parse(metaString);
      return { c: parsed.c || 'Other', s: parsed.s || false, a: parsed.a || false };
    } catch(e) {
      if (metaString === 'Archived') return { c: 'Other', s: false, a: true };
      if (metaString === 'Shared') return { c: 'Other', s: true, a: false };
      return { c: metaString || 'Other', s: false, a: false };
    }
  };

  const uniqueCategories = ['All Categories', 'Work', 'Household', 'Finance', 'Learning', 'Agenda', 'Health', 'Other'];

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const metaData = JSON.stringify({
      c: newProjectCategory.trim() || 'Other',
      s: newProjectType === 'Shared',
      a: false
    });

    try {
      const token = localStorage.getItem('aksara_token');
      await axios.post('http://localhost:8000/projects', {
        name: newProjectName,
        description: newProjectDesc,
        meta: metaData, 
        bg_color: '#EEF2FF', 
        icon_color: '#4F46E5'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectCategory('');
      setNewProjectType('Personal');
      setIsAdding(false);
      fetchData(); 
    } catch (error) {
      console.error("Gagal membuat project:", error);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!editProjectName.trim()) return;

    const metaData = JSON.stringify({
      c: editProjectCategory.trim() || 'Other',
      s: editProjectType === 'Shared',
      a: parseMeta(projectToEdit.meta).a // keep archived state
    });

    try {
      const token = localStorage.getItem('aksara_token');
      await axios.put(`http://localhost:8000/projects/${projectToEdit.id}`, {
        name: editProjectName,
        meta: metaData,
        description: editProjectDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjectToEdit(null); 
      fetchData(); 
    } catch (error) {
      console.error("Gagal mengedit project:", error);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  };

  const handleToggleArchive = async (e, project) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const currentMeta = parseMeta(project.meta);
    const newMeta = JSON.stringify({ ...currentMeta, a: !currentMeta.a });

    try {
      const token = localStorage.getItem('aksara_token');
      await axios.put(`http://localhost:8000/projects/${project.id}`, {
        name: project.name,
        description: project.description,
        meta: newMeta
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error("Gagal merubah status arsip:", error);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.delete(`http://localhost:8000/projects/${projectToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectToDelete(null);
      fetchData(); 
    } catch (error) {
      console.error("Gagal menghapus project:", error);
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

  let filteredProjects = projects.filter(p => {
    const meta = parseMeta(p.meta);
    
    if (activeTab === 'All Projects' && meta.a) return false; 
    if (activeTab === 'Personal' && (meta.s || meta.a)) return false; 
    if (activeTab === 'Shared' && (!meta.s || meta.a)) return false; 
    if (activeTab === 'Archived' && !meta.a) return false; 

    if (filterCategory !== 'All Categories' && meta.c !== filterCategory) return false;

    return true;
  });

  // Sort projects by position field (default 0)
  filteredProjects.sort((a, b) => (a.position || 0) - (b.position || 0));

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('projectIndex', index);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData('projectIndex');
    if (sourceIndex === '' || Number(sourceIndex) === targetIndex) return;

    const updatedProjects = [...filteredProjects];
    const [movedProject] = updatedProjects.splice(sourceIndex, 1);
    updatedProjects.splice(targetIndex, 0, movedProject);

    // Optimistic UI update
    setProjects(prev => {
      const next = [...prev];
      updatedProjects.forEach((p, idx) => {
        const i = next.findIndex(np => np.id === p.id);
        if(i !== -1) next[i].position = idx;
      });
      return next;
    });

    try {
      const token = localStorage.getItem('aksara_token');
      await Promise.all(updatedProjects.map((p, idx) => 
        axios.put(`http://localhost:8000/projects/${p.id}`, { position: idx }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
    } catch (error) {
      console.error("Gagal mengupdate urutan project:", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '"Inter", "Segoe UI", sans-serif', position: 'relative' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <p style={{ color: '#71717A', fontSize: '14px', margin: 0 }}>Kelola project tugas pribadi dan bersama dalam satu tempat.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#111111', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272A'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

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

      {/* SEARCH, FILTER & SORT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#A1A1AA' }} />
          <input type="text" placeholder="Search projects..." style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '8px', padding: '0 12px' }}>
            <Filter size={14} color="#71717A" style={{ marginRight: '6px' }} />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ appearance: 'none', border: 'none', background: 'transparent', outline: 'none', padding: '10px 16px 10px 0', fontSize: '13px', fontWeight: '500', color: '#18181B', cursor: 'pointer', width: '130px' }}>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronRight size={14} style={{ transform: 'rotate(90deg)', color: '#A1A1AA', position: 'absolute', right: '12px', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* PROJECTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#A1A1AA', fontSize: '14px' }}>Tidak ada project di tab/kategori ini.</div>
        ) : (
          filteredProjects.map((project, index) => {
            const stats = getProjectStats(project.id);
            const meta = parseMeta(project.meta);
            return (
              <div 
                key={project.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => navigate(`/tasks/${project.id}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E4E4E7', cursor: 'grab', transition: 'box-shadow 0.2s, border-color 0.2s' }}
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
                      <span style={{ fontSize: '12px', fontWeight: '600', color: meta.s ? '#8B5CF6' : '#3B82F6' }}>
                        {meta.s ? 'Shared' : 'Personal'}
                      </span>
                      <span style={{ color: '#D4D4D8', fontSize: '10px' }}>●</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717A' }}>
                        {meta.c}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#A1A1AA', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description || 'Tidak ada deskripsi'}</p>
                  </div>
                </div>

                {/* Tengah: Statistik & Linear Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', paddingRight: '40px', borderRight: '1px solid #F4F4F5' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#18181B' }}>{stats.total}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#A1A1AA', fontWeight: '500' }}>Total Tasks</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#16A34A' }}>{stats.done}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#A1A1AA', fontWeight: '500' }}>Done</p>
                  </div>
                  
                  {/* Linear Progress Bar Sesuai Gambar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#A1A1AA', fontWeight: '500', marginBottom: '2px' }}>Progress</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#18181B', marginBottom: '8px' }}>{stats.progress}%</p>
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#F4F4F5', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.progress}%`, height: '100%', backgroundColor: project.icon_color || '#3B82F6', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                </div>

                {/* Kanan: Tanggal Update & Aksi Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingLeft: '40px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '80px', gap: '2px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#A1A1AA', fontWeight: '500' }}>Updated</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#18181B' }}>{getUpdatedText(project.updated_at)}</p>
                  </div>

                  <ChevronRight size={20} color="#D4D4D8" />

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
                        <button 
                          onClick={() => { 
                            const meta = parseMeta(project.meta);
                            setProjectToEdit(project); 
                            setEditProjectName(project.name);
                            setEditProjectType(meta.s ? 'Shared' : 'Personal');
                            setEditProjectCategory(meta.c);
                            setEditProjectDesc(project.description || '');
                            setOpenMenuId(null); 
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#3F3F46', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Edit2 size={14} color="#71717A" /> Edit project
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#3F3F46', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Copy size={14} color="#71717A" /> Duplicate project
                        </button>
                        <button onClick={(e) => handleToggleArchive(e, project)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#3F3F46', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Archive size={14} color="#71717A" /> {meta.a ? 'Unarchive project' : 'Archive project'}
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
          })
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL CREATE PROJECT                        */}
      {/* ========================================= */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '500px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Create New Project</h2>
              <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={20}/></button>
            </div>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6B7280' }}>Buat project untuk mengelola tugas berdasarkan kebutuhan pribadi atau keluarga.</p>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Project Name</label>
                <input type="text" autoFocus value={newProjectName} onChange={(e)=>setNewProjectName(e.target.value)} placeholder="Masukkan nama project" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Project Type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div onClick={() => setNewProjectType('Personal')} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: newProjectType === 'Personal' ? '2px solid #3B82F6' : '1px solid #E5E7EB', backgroundColor: newProjectType === 'Personal' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <User size={18} color={newProjectType === 'Personal' ? '#2563EB' : '#6B7280'} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: newProjectType === 'Personal' ? '#1D4ED8' : '#374151' }}>Personal</span>
                    </div>
                    <div style={{ fontSize: '12px', color: newProjectType === 'Personal' ? '#3B82F6' : '#6B7280', paddingLeft: '26px' }}>Untuk kebutuhan pribadi</div>
                  </div>
                  <div onClick={() => setNewProjectType('Shared')} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: newProjectType === 'Shared' ? '2px solid #3B82F6' : '1px solid #E5E7EB', backgroundColor: newProjectType === 'Shared' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Users size={18} color={newProjectType === 'Shared' ? '#2563EB' : '#6B7280'} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: newProjectType === 'Shared' ? '#1D4ED8' : '#374151' }}>Shared</span>
                    </div>
                    <div style={{ fontSize: '12px', color: newProjectType === 'Shared' ? '#3B82F6' : '#6B7280', paddingLeft: '26px' }}>Bersama keluarga/anggota</div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Category</label>
                <select value={newProjectCategory} onChange={(e) => setNewProjectCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFF', appearance: 'auto', cursor: 'pointer' }} required>
                  <option value="" disabled>Pilih kategori</option>
                  <option value="Work">Work</option>
                  <option value="Household">Household</option>
                  <option value="Finance">Finance</option>
                  <option value="Learning">Learning</option>
                  <option value="Agenda">Agenda</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Description (Optional)</label>
                <textarea value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} placeholder="Tulis deskripsi singkat tentang project ini... (Maks. 200 karakter)" maxLength={200} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>{newProjectDesc.length} / 200</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '10px 16px', backgroundColor: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Create Project</button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL EDIT PROJECT                        */}
      {/* ========================================= */}
      {projectToEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '400px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#18181B' }}>Edit Project</h3>
              <button onClick={() => setProjectToEdit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#18181B', marginBottom: '6px', display: 'block' }}>Project Name</label>
                <input autoFocus type="text" value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Project Type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div onClick={() => setEditProjectType('Personal')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: editProjectType === 'Personal' ? '2px solid #3B82F6' : '1px solid #E5E7EB', backgroundColor: editProjectType === 'Personal' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={18} color={editProjectType === 'Personal' ? '#2563EB' : '#6B7280'} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: editProjectType === 'Personal' ? '#1D4ED8' : '#374151' }}>Personal</span>
                    </div>
                  </div>
                  <div onClick={() => setEditProjectType('Shared')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: editProjectType === 'Shared' ? '2px solid #3B82F6' : '1px solid #E5E7EB', backgroundColor: editProjectType === 'Shared' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} color={editProjectType === 'Shared' ? '#2563EB' : '#6B7280'} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: editProjectType === 'Shared' ? '#1D4ED8' : '#374151' }}>Shared</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Category</label>
                <select value={editProjectCategory} onChange={(e) => setEditProjectCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFF', appearance: 'auto', cursor: 'pointer' }} required>
                  <option value="" disabled>Pilih kategori</option>
                  <option value="Work">Work</option>
                  <option value="Household">Household</option>
                  <option value="Finance">Finance</option>
                  <option value="Learning">Learning</option>
                  <option value="Agenda">Agenda</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#18181B', marginBottom: '6px', display: 'block' }}>Deskripsi</label>
                <textarea value={editProjectDesc} onChange={(e) => setEditProjectDesc(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', outline: 'none', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setProjectToEdit(null)} style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#18181B', border: '1px solid #E4E4E7', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#111111', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL KONFIRMASI HAPUS                    */}
      {/* ========================================= */}
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
              <button onClick={() => setProjectToDelete(null)} style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#18181B', border: '1px solid #E4E4E7', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDeleteProject} style={{ padding: '8px 16px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Delete Project</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;