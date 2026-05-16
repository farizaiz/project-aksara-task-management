import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Layout, List as ListIcon, Calendar as CalendarIcon, 
  ChevronRight, Folder, Settings2, Trash2, Edit2, Filter, ArrowUpDown,
  MoreHorizontal, Edit, Palette, MessageSquare, Copy, ArrowRight, GripVertical
} from 'lucide-react';
// IMPORT KOMPONEN DRAWER BARU
import TaskDrawer from './components/TaskDrawer';

const PRESET_COLORS = [
  { name: 'Slate', value: '#64748B' }, { name: 'Blue', value: '#3B82F6' },
  { name: 'Amber', value: '#F59E0B' }, { name: 'Orange', value: '#F97316' },
  { name: 'Green', value: '#22C55E' }, { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#A855F7' }
];

const TASK_LABELS = [
  { id: 'tahap-1', name: 'Tahap 1', color: '#DC2626', bg: '#FEE2E2' }, 
  { id: 'tahap-2', name: 'Tahap 2', color: '#D97706', bg: '#FEF3C7' }, 
  { id: 'tahap-3', name: 'Tahap 3', color: '#CA8A04', bg: '#FEF08A' }, 
  { id: 'tahap-4', name: 'Tahap 4', color: '#16A34A', bg: '#DCFCE7' }, 
  { id: 'tahap-5', name: 'Tahap 5', color: '#2563EB', bg: '#DBEAFE' }, 
  { id: 'tahap-6', name: 'Tahap 6', color: '#9333EA', bg: '#EDE9FE' }, 
  { id: 'tahap-7', name: 'Tahap 7', color: '#DB2777', bg: '#FCE7F3' }, 
];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('Board');

  const [currentProject, setCurrentProject] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#64748B'); 
  const [editingColId, setEditingColId] = useState(null);
  const [editColTitle, setEditColTitle] = useState('');
  const [openMenuColId, setOpenMenuColId] = useState(null);
  const [colorPickerColId, setColorPickerColId] = useState(null);
  const [tempColor, setTempColor] = useState(''); 

  const [addingTaskColId, setAddingTaskColId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskLabel, setNewTaskLabel] = useState(null); 
  const [showLabelSelectorColId, setShowLabelSelectorColId] = useState(null);
  const [labelSearchQuery, setLabelSearchQuery] = useState('');

  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);
  const [moveSubmenuTaskId, setMoveSubmenuTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('aksara_token');
      const projectRes = await axios.get(`http://localhost:8000/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentProject(projectRes.data.data);
      if (projectRes.data.data.columns) setColumns(typeof projectRes.data.data.columns === 'string' ? JSON.parse(projectRes.data.data.columns) : projectRes.data.data.columns);
      
      try {
        const taskRes = await axios.get('http://localhost:8000/tasks', { headers: { Authorization: `Bearer ${token}` } });
        if (taskRes.data && taskRes.data.data) setTasks(taskRes.data.data.filter(t => t.project_id === projectId));
      } catch (e) {}
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuColId) {
        const popup = document.getElementById(`col-menu-${openMenuColId}`);
        if (popup && !popup.contains(e.target) && e.target.closest('button')?.getAttribute('id') !== `btn-menu-${openMenuColId}`) setOpenMenuColId(null);
      }
      if (colorPickerColId) {
        const popup = document.getElementById(`color-picker-modal-${colorPickerColId}`);
        if (popup && !popup.contains(e.target)) setColorPickerColId(null);
      }
      if (openMenuTaskId) {
        const popup = document.getElementById(`task-menu-${openMenuTaskId}`);
        if (popup && !popup.contains(e.target) && e.target.closest('button')?.getAttribute('id') !== `btn-task-menu-${openMenuTaskId}`) {
          setOpenMenuTaskId(null); setMoveSubmenuTaskId(null);
        }
      }
      if (showLabelSelectorColId) {
        const popup = document.getElementById(`label-selector-${showLabelSelectorColId}`);
        if (popup && !popup.contains(e.target) && e.target.closest('button')?.getAttribute('id') !== `btn-add-label-${showLabelSelectorColId}`) {
          setShowLabelSelectorColId(null); setLabelSearchQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuColId, colorPickerColId, openMenuTaskId, showLabelSelectorColId]);

  const saveColumnsToDB = async (updatedColumns) => {
    setColumns(updatedColumns); 
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.put(`http://localhost:8000/projects/${projectId}`, { columns: JSON.stringify(updatedColumns) }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {}
  };

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    saveColumnsToDB([...columns, { id: newColumnTitle, title: newColumnTitle, color: newColumnColor }]);
    setNewColumnTitle(''); setNewColumnColor('#64748B'); setIsAddingColumn(false);
  };

  const handleSaveEditColumn = (colId) => {
    if (!editColTitle.trim()) return setEditingColId(null);
    saveColumnsToDB(columns.map(c => c.id === colId ? { ...c, title: editColTitle } : c));
    setEditingColId(null);
  };

  const applyColorChange = (colId) => {
    if (tempColor) saveColumnsToDB(columns.map(c => c.id === colId ? { ...c, color: tempColor } : c));
    setColorPickerColId(null);
  };

  const handleDeleteColumn = (colId) => {
    if (tasks.filter(t => t.status === colId).length > 0) {
      alert(`Kosongkan tugas di dalam kolom ini terlebih dahulu.`); return;
    }
    if (!window.confirm('Yakin menghapus kolom ini?')) return;
    saveColumnsToDB(columns.filter(c => c.id !== colId));
  };

  const toggleMenu = (e, colId) => { e.stopPropagation(); setOpenMenuColId(openMenuColId === colId ? null : colId); };
  const openColorPicker = (col) => { setTempColor(col.color || '#64748B'); setColorPickerColId(col.id); setOpenMenuColId(null); };

  const handleAddTask = async (e, colId) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.post('http://localhost:8000/tasks', { title: newTaskTitle, project_id: projectId, status: colId, label: newTaskLabel }, { headers: { Authorization: `Bearer ${token}` } });
      setNewTaskTitle(''); setAddingTaskColId(null); setNewTaskLabel(null); setShowLabelSelectorColId(null); fetchData(); 
    } catch (error) {}
  };

  const handleSaveEditTask = async (taskId) => {
    if (!editTaskTitle.trim()) { setEditingTaskId(null); return; }
    const token = localStorage.getItem('aksara_token');
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title: editTaskTitle } : t));
    setEditingTaskId(null);
    try { await axios.put(`http://localhost:8000/tasks/${taskId}`, { title: editTaskTitle }, { headers: { Authorization: `Bearer ${token}` } }); } catch (error) { fetchData(); }
  };

  const updateSelectedTask = async (updates) => {
    if(!selectedTask) return;
    const updatedTask = { ...selectedTask, ...updates };
    setSelectedTask(updatedTask);
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.put(`http://localhost:8000/tasks/${updatedTask.id}`, updates, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { console.error(error); }
  };

  const handleDuplicateTask = async (e, task) => {
    e.stopPropagation(); setOpenMenuTaskId(null);
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.post('http://localhost:8000/tasks', { title: task.title + ' (Copy)', project_id: projectId, status: task.status, label: task.label }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(); 
    } catch (error) {}
  };

  const handleMoveTask = async (e, taskId, targetColId) => {
    e.stopPropagation(); setOpenMenuTaskId(null); setMoveSubmenuTaskId(null);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetColId } : t));
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.put(`http://localhost:8000/tasks/${taskId}`, { status: targetColId }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { fetchData(); }
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (!window.confirm('Yakin menghapus tugas ini?')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setOpenMenuTaskId(null);
    if (selectedTask?.id === taskId) setSelectedTask(null);
    try {
      const token = localStorage.getItem('aksara_token');
      await axios.delete(`http://localhost:8000/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { fetchData(); }
  };

  const handleDragStart = (e, type, id, index) => {
    e.stopPropagation(); e.dataTransfer.setData('dragType', type); e.dataTransfer.setData('id', id);
    if (type === 'column') e.dataTransfer.setData('colIndex', index);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDropOnColumn = async (e, targetColId, targetColIndex) => {
    e.preventDefault();
    const dragType = e.dataTransfer.getData('dragType');
    if (dragType === 'task') {
      const taskId = e.dataTransfer.getData('id');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetColId } : t));
      try {
        const token = localStorage.getItem('aksara_token');
        await axios.put(`http://localhost:8000/tasks/${taskId}`, { status: targetColId }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) { fetchData(); }
    } else if (dragType === 'column') {
      const sourceIndex = parseInt(e.dataTransfer.getData('colIndex'));
      if (sourceIndex === targetColIndex) return;
      const newCols = [...columns];
      const [movedCol] = newCols.splice(sourceIndex, 1);
      newCols.splice(targetColIndex, 0, movedCol);
      saveColumnsToDB(newCols);
    }
  };

  const getColumnDetails = (colId) => {
    const col = columns.find(c => c.id === colId);
    return col ? { name: col.title, color: col.color } : { name: colId, color: '#64748B' };
  };
  const getTaskLabel = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.label) return TASK_LABELS[0];
    return TASK_LABELS.find(l => l.id === task.label) || TASK_LABELS[0];
  };
  const getLabelById = (labelId) => TASK_LABELS.find(l => l.id === labelId) || TASK_LABELS[0];
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#71717A' }}>Memuat data...</div>;
  if (!currentProject) return <div>Project tidak ditemukan</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#6B7280' }}>
        <span onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>Projects</span>
        <ChevronRight size={14} /><span style={{ color: '#111827', fontWeight: '500' }}>{currentProject.name}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: currentProject.bg_color || '#EEF2FF', color: currentProject.icon_color || '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Folder size={32} /></div>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{currentProject.name}</h1>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>{currentProject.meta}</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>{currentProject.description}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: '#374151' }}><Settings2 size={16} /> Manage Columns</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <button onClick={() => setActiveView('Board')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', backgroundColor: activeView === 'Board' ? '#FFFFFF' : 'transparent', color: activeView === 'Board' ? '#111827' : '#6B7280', boxShadow: activeView === 'Board' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}><Layout size={14} /> Board</button>
          <button onClick={() => setActiveView('List')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', backgroundColor: activeView === 'List' ? '#FFFFFF' : 'transparent', color: activeView === 'List' ? '#111827' : '#6B7280' }}><ListIcon size={14} /> List</button>
          <button onClick={() => setActiveView('Calendar')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', backgroundColor: activeView === 'Calendar' ? '#FFFFFF' : 'transparent', color: activeView === 'Calendar' ? '#111827' : '#6B7280' }}><CalendarIcon size={14} /> Calendar</button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#374151', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}><Filter size={14} /> Filter</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#374151', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}><ArrowUpDown size={14} /> Sort</button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div style={{ display: 'flex', gap: '20px', flex: 1, overflowX: 'auto', paddingBottom: '8px', paddingRight: selectedTask ? '504px' : '0', transition: 'padding 0.3s ease' }}>
        {columns.map((col, index) => (
          <div key={col.id} draggable onDragStart={(e) => handleDragStart(e, 'column', col.id, index)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnColumn(e, col.id, index)} style={{ flex: '0 0 auto', width: '300px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: editingColId === col.id ? 'default' : 'grab', backgroundColor: '#F7F7F8', borderRadius: '12px', borderTop: `4px solid ${col.color || '#64748B'}`, padding: '12px', position: 'relative', maxHeight: '100%', overflowY: 'auto' }}>
            {/* Header Kolom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                {editingColId === col.id ? (
                  <input autoFocus value={editColTitle} onChange={(e) => setEditColTitle(e.target.value)} onBlur={() => handleSaveEditColumn(col.id)} onKeyDown={(e) => e.key === 'Enter' && handleSaveEditColumn(col.id)} style={{ width: '100%', padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '4px', outline: 'none', fontSize: '14px', fontWeight: '600' }} />
                ) : (
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{col.title}</h3>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#E5E7EB', color: '#4B5563', padding: '2px 8px', borderRadius: '12px' }}>{tasks.filter(t => t.status === col.id).length}</span>
                <button id={`btn-menu-${col.id}`} onClick={(e) => toggleMenu(e, col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#111827'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}><MoreHorizontal size={16} /></button>
                
                {openMenuColId === col.id && (
                  <div id={`col-menu-${col.id}`} style={{ position: 'absolute', top: '40px', right: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '160px', padding: '6px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={() => { setEditingColId(col.id); setEditColTitle(col.title); setOpenMenuColId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#111827', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Edit size={14} color="#6B7280" /> Rename column</button>
                    <button onClick={() => openColorPicker(col)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#111827', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Palette size={14} color="#6B7280" /> Edit color</button>
                    <button onClick={() => { handleDeleteColumn(col.id); setOpenMenuColId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#EF4444', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={14} color="#EF4444" /> Delete column</button>
                  </div>
                )}
              </div>
            </div>

            {/* Popup Edit Color */}
            {colorPickerColId === col.id && (
              <div id={`color-picker-modal-${col.id}`} style={{ position: 'absolute', top: '40px', right: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '260px', padding: '16px', zIndex: 30 }}>
                <div style={{ position: 'absolute', top: '-6px', right: '12px', width: '12px', height: '12px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderLeft: '1px solid #E5E7EB', transform: 'rotate(45deg)' }}></div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Edit Accent Color</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', marginTop: '12px', justifyContent: 'space-between' }}>
                  {PRESET_COLORS.map(preset => (
                    <div key={preset.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <button onClick={() => setTempColor(preset.value)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: preset.value, outline: tempColor === preset.value ? `2px solid ${preset.value}` : 'none', outlineOffset: '2px', transition: 'all 0.1s ease' }} title={preset.name} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => setColorPickerColId(null)} style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Cancel</button>
                  <button onClick={() => applyColorChange(col.id)} style={{ padding: '6px 12px', backgroundColor: '#111827', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Apply</button>
                </div>
              </div>
            )}

            {/* List Tugas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '60px' }}>
              {tasks.filter(t => t.status === col.id).map(task => {
                const isSelected = selectedTask?.id === task.id;
                const colColor = col.color || '#64748B';
                const taskLabel = getTaskLabel(task.id);
                const mockCommentsCount = Math.floor(Math.random() * 5);

                return (
                  <div key={task.id} draggable={editingTaskId !== task.id} onDragStart={(e) => handleDragStart(e, 'task', task.id)} onMouseEnter={() => setHoveredTaskId(task.id)} onMouseLeave={() => setHoveredTaskId(null)} onClick={() => { if(editingTaskId !== task.id) setSelectedTask(task) }} style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: isSelected ? `2px solid ${colColor}` : '1px solid #E5E7EB', boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px', cursor: editingTaskId === task.id ? 'default' : 'pointer', transition: 'all 0.2s ease', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {editingTaskId === task.id ? (
                        <input autoFocus value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} onBlur={() => handleSaveEditTask(task.id)} onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTask(task.id)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '4px', outline: 'none', fontSize: '14px', fontWeight: '600', marginRight: '8px' }} />
                      ) : (
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', lineHeight: '1.4', flex: 1, color: '#111827', paddingRight: '16px' }}>{task.title}</p>
                      )}
                      
                      <button id={`btn-task-menu-${task.id}`} onClick={(e) => { e.stopPropagation(); setOpenMenuTaskId(openMenuTaskId === task.id ? null : task.id); setMoveSubmenuTaskId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: hoveredTaskId === task.id || openMenuTaskId === task.id ? '#9CA3AF' : 'transparent', transition: 'color 0.2s ease-in-out', position: 'absolute', right: '12px', top: '16px' }}><MoreHorizontal size={16} /></button>

                      {openMenuTaskId === task.id && (
                        <div id={`task-menu-${task.id}`} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '36px', right: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '180px', padding: '6px', zIndex: 30, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {moveSubmenuTaskId === task.id ? (
                            <>
                              <div style={{ fontSize: '11px', color: '#6B7280', padding: '4px 8px', fontWeight: '600' }}>Move to...</div>
                              {columns.filter(c => c.id !== task.status).map(c => (
                                <button key={c.id} onClick={(e) => handleMoveTask(e, task.id, c.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#111827', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.color || '#64748B' }}></span>{c.title}</button>
                              ))}
                              <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }}></div>
                              <button onClick={() => setMoveSubmenuTaskId(null)} style={{ padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '12px', color: '#6B7280', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>← Back</button>
                            </>
                          ) : (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); setEditTaskTitle(task.title); setOpenMenuTaskId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#111827', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Edit size={14} color="#6B7280" /> Rename task</button>
                              <button onClick={(e) => handleDuplicateTask(e, task)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#111827', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Copy size={14} color="#6B7280" /> Duplicate task</button>
                              <button onClick={(e) => { e.stopPropagation(); setMoveSubmenuTaskId(task.id); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#111827', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><ArrowRight size={14} color="#6B7280" /> Move to...</button>
                              <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }}></div>
                              <button onClick={(e) => handleDeleteTask(e, task.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '13px', color: '#EF4444', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={14} color="#EF4444" /> Delete task</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '500', color: '#FFFFFF', backgroundColor: taskLabel.color, padding: '2px 8px', borderRadius: '4px' }}>{taskLabel.name}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6B7280', fontSize: '12px' }}>
                        {(task.start_date || task.end_date) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarIcon size={12} /> {[formatDate(task.start_date), formatDate(task.end_date)].filter(Boolean).join(' - ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Add Task Form */}
              {addingTaskColId === col.id ? (
                <form onSubmit={(e) => handleAddTask(e, col.id)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input autoFocus type="text" placeholder="Task title..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }} />
                  
                  <div style={{ position: 'relative' }}>
                    {newTaskLabel ? (
                      <button id={`btn-add-label-${col.id}`} type="button" onClick={() => { setShowLabelSelectorColId(showLabelSelectorColId === col.id ? null : col.id); setLabelSearchQuery(''); }} style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: '500', color: '#FFFFFF', backgroundColor: getLabelById(newTaskLabel).color, padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>{getLabelById(newTaskLabel).name}</button>
                    ) : (
                      <button id={`btn-add-label-${col.id}`} type="button" onClick={() => { setShowLabelSelectorColId(showLabelSelectorColId === col.id ? null : col.id); setLabelSearchQuery(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '500', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', cursor: 'pointer' }}><Plus size={12} /> Add Label</button>
                    )}

                    {showLabelSelectorColId === col.id && (
                      <div id={`label-selector-${col.id}`} style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '240px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 40, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <input type="text" autoFocus placeholder="Search for an option..." value={labelSearchQuery} onChange={(e) => setLabelSearchQuery(e.target.value)} style={{ padding: '10px 12px', border: 'none', borderBottom: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', color: '#111827' }} />
                        <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
                          <div style={{ padding: '0 12px', marginBottom: '4px', fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>Select an option or create one</div>
                          {TASK_LABELS.filter(l => l.name.toLowerCase().includes(labelSearchQuery.toLowerCase())).map(lbl => (
                            <div key={lbl.id} onClick={() => { setNewTaskLabel(lbl.id); setShowLabelSelectorColId(null); setLabelSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', cursor: 'pointer', transition: 'background-color 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GripVertical size={14} color="#9CA3AF" /><span style={{ fontSize: '11px', fontWeight: '500', color: '#FFFFFF', backgroundColor: lbl.color, padding: '2px 8px', borderRadius: '4px' }}>{lbl.name}</span></div><MoreHorizontal size={14} color="#9CA3AF" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Save</button>
                    <button type="button" onClick={() => { setAddingTaskColId(null); setNewTaskTitle(''); setNewTaskLabel(null); setShowLabelSelectorColId(null); }} style={{ padding: '8px', backgroundColor: 'transparent', color: '#6B7280', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setAddingTaskColId(col.id)} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px dashed #D1D5DB', borderRadius: '8px', color: '#6B7280', fontSize: '13px', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Plus size={14} /> Add Task</button>
              )}
            </div>
          </div>
        ))}

        <div style={{ flex: '0 0 auto', width: '300px' }}>
          {isAddingColumn ? (
            <form onSubmit={handleAddColumn} style={{ backgroundColor: '#F7F7F8', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #E5E7EB' }}>
              <input autoFocus type="text" placeholder="New column name..." value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }} />
              <div>
                <span style={{ fontSize: '12px', color: '#4B5563', marginBottom: '8px', display: 'block', fontWeight: '600' }}>Accent Color</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(preset => (
                    <button key={preset.name} type="button" onClick={() => setNewColumnColor(preset.value)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: preset.value, outline: newColumnColor === preset.value ? `2px solid ${preset.value}` : 'none', outlineOffset: '2px', transition: 'all 0.1s ease' }} title={preset.name} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Save</button>
                <button type="button" onClick={() => { setIsAddingColumn(false); setNewColumnTitle(''); setNewColumnColor('#64748B'); }} style={{ padding: '8px', backgroundColor: 'transparent', color: '#6B7280', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsAddingColumn(true)} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', border: '1px dashed #D1D5DB', borderRadius: '12px', color: '#6B7280', fontSize: '14px', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><Plus size={16} /> Add Column</button>
          )}
        </div>
      </div>

      {/* PANGGIL KOMPONEN TASK DRAWER DI SINI */}
      <TaskDrawer 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={updateSelectedTask}
        getColumnDetails={getColumnDetails}
        getTaskLabel={getTaskLabel}
        taskLabels={TASK_LABELS}
        formatDate={formatDate}
      />

    </div>
  );
};

export default ProjectDetail;