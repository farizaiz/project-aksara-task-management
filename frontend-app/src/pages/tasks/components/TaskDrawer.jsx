import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Code, X, FileText, Clock, Calendar as CalendarIcon, 
  AlignLeft, GripVertical, Image as ImageIcon, Trash2, Paperclip, Download,
  MoreHorizontal, Plus, Search, ChevronLeft, Check
} from 'lucide-react';

const NOTION_COLORS = [
  { name: 'Default', color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
  { name: 'Gray', color: '#4B5563', bg: '#E5E7EB', dot: '#6B7280' },
  { name: 'Brown', color: '#92400E', bg: '#FEF3C7', dot: '#D97706' },
  { name: 'Orange', color: '#C2410C', bg: '#FFEDD5', dot: '#F97316' },
  { name: 'Yellow', color: '#A16207', bg: '#FEF9C3', dot: '#EAB308' },
  { name: 'Green', color: '#15803D', bg: '#DCFCE7', dot: '#22C55E' },
  { name: 'Blue', color: '#1D4ED8', bg: '#DBEAFE', dot: '#3B82F6' },
  { name: 'Purple', color: '#7E22CE', bg: '#F3E8FF', dot: '#A855F7' },
  { name: 'Pink', color: '#BE185D', bg: '#FCE7F3', dot: '#EC4899' },
  { name: 'Red', color: '#B91C1C', bg: '#FEE2E2', dot: '#EF4444' },
];

const TaskDrawer = ({ 
  task, onClose, onUpdateTask, getColumnDetails, getTaskLabel, taskLabels, onUpdateProjectLabels, formatDate 
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState('');
  
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState('');

  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelColor, setEditLabelColor] = useState(NOTION_COLORS[0]);

  // State untuk Drag and Drop Label
  const [draggedLabelId, setDraggedLabelId] = useState(null);

  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descVal, setDescVal] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitleVal(task.title || '');
      setDescVal(task.description || '');
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isLabelOpen) {
        const popup = document.getElementById('drawer-label-selector');
        if (popup && !popup.contains(e.target) && e.target.closest('button')?.getAttribute('id') !== 'btn-drawer-label') {
          setIsLabelOpen(false); setLabelSearch(''); setEditingLabelId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLabelOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateTask({ attachment: reader.result, attachment_name: file.name });
      reader.readAsDataURL(file);
    }
  };
  const isImageAttachment = (base64String) => base64String && base64String.startsWith('data:image/');

  const handleCreateLabel = () => {
    if (!labelSearch.trim()) return;
    const newLabel = { id: 'label-' + Date.now(), name: labelSearch.trim(), color: NOTION_COLORS[0].color, bg: NOTION_COLORS[0].bg, dot: NOTION_COLORS[0].dot };
    onUpdateProjectLabels([...taskLabels, newLabel]); 
    setLabelSearch('');
    onUpdateTask({ label: newLabel.id }); 
    setIsLabelOpen(false);
  };

  const updateLabelInProject = (id, newName, newColorObj) => {
    const updatedLabels = taskLabels.map(l => l.id === id ? { ...l, name: newName, color: newColorObj.color, bg: newColorObj.bg, dot: newColorObj.dot } : l);
    onUpdateProjectLabels(updatedLabels);
  };

  const handleDeleteLabel = (id) => {
    const updatedLabels = taskLabels.filter(l => l.id !== id);
    onUpdateProjectLabels(updatedLabels);
    if (task.label === id) onUpdateTask({ label: null });
    setEditingLabelId(null);
  };

  // --- LOGIKA DRAG AND DROP LABEL ---
  const handleDragStartLabel = (e, id) => {
    setDraggedLabelId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropLabel = (e, targetId) => {
    e.preventDefault();
    if (!draggedLabelId || draggedLabelId === targetId) return;

    const newLabels = [...taskLabels];
    const draggedIndex = newLabels.findIndex(l => l.id === draggedLabelId);
    const targetIndex = newLabels.findIndex(l => l.id === targetId);

    const [removed] = newLabels.splice(draggedIndex, 1);
    newLabels.splice(targetIndex, 0, removed);

    onUpdateProjectLabels(newLabels);
    setDraggedLabelId(null);
  };

  const searchTrimmed = labelSearch.trim().toLowerCase();
  const exactMatchExists = taskLabels.some(l => l.name.toLowerCase() === searchTrimmed);
  const showCreateOption = searchTrimmed !== '' && !exactMatchExists;

  if (!task) return null;

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.35)', zIndex: 999998, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', backgroundColor: '#FFFFFF', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', zIndex: 999999, fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', paddingBottom: '0' }}>
          <button style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', padding: 0 }}><Code size={20} /></button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', padding: 0 }}><X size={20} /></button>
        </div>

        <div style={{ padding: '16px 24px 24px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isEditingTitle ? (
            <input autoFocus value={titleVal} onChange={(e) => setTitleVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateTask({ title: titleVal }); setIsEditingTitle(false); } if (e.key === 'Escape') setIsEditingTitle(false); }} onBlur={() => { onUpdateTask({ title: titleVal }); setIsEditingTitle(false); }} style={{ fontSize: '32px', fontWeight: '700', width: '100%', border: '1px solid #3B82F6', borderRadius: '8px', padding: '4px 8px', marginBottom: '24px', outline: 'none', color: '#111827' }} />
          ) : (
            <h2 onClick={() => { setTitleVal(task.title); setIsEditingTitle(true); }} style={{ margin: '0 0 24px 0', fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1.2', cursor: 'text', padding: '4px 8px', borderRadius: '8px', marginLeft: '-8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>{task.title}</h2>
          )}
          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0 0 24px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><FileText size={16} /> Label</div>
              <div style={{ position: 'relative' }}>
                
                {getTaskLabel(task.id).name === 'No Label' ? (
                  <button id="btn-drawer-label" onClick={() => { setIsLabelOpen(!isLabelOpen); setLabelSearch(''); setEditingLabelId(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '400', color: '#374151', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer' }}>
                    <Plus size={14} /> Add label
                  </button>
                ) : (
                  <button id="btn-drawer-label" onClick={() => { setIsLabelOpen(!isLabelOpen); setLabelSearch(''); setEditingLabelId(null); }} style={{ fontSize: '13px', fontWeight: '400', color: getTaskLabel(task.id).color, backgroundColor: getTaskLabel(task.id).bg, padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                    {getTaskLabel(task.id).name}
                  </button>
                )}
                
                {isLabelOpen && (
                  <div id="drawer-label-selector" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '280px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 40, display: 'flex', flexDirection: 'column', overflow: 'hidden', color: '#111827' }}>
                    
                    {editingLabelId ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #E5E7EB' }}>
                          <button onClick={() => setEditingLabelId(null)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 8px 0 0' }}><ChevronLeft size={16} /></button>
                          <input autoFocus value={editLabelName} onChange={(e) => { setEditLabelName(e.target.value); updateLabelInProject(editingLabelId, e.target.value, editLabelColor); }} style={{ flex: 1, backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', color: '#111827', outline: 'none' }} />
                        </div>
                        
                        <div style={{ padding: '4px 0', borderBottom: '1px solid #E5E7EB' }}>
                          <div onClick={() => handleDeleteLabel(editingLabelId)} style={{ padding: '8px 12px', fontSize: '13px', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Trash2 size={14} /> Delete
                          </div>
                        </div>

                        <div style={{ padding: '8px 0', maxHeight: '180px', overflowY: 'auto' }}>
                          <div style={{ padding: '0 12px', marginBottom: '4px', fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>Colors</div>
                          {NOTION_COLORS.map(c => (
                            <div key={c.name} onClick={() => { setEditLabelColor(c); updateLabelInProject(editingLabelId, editLabelName, c); }} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                                <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: c.dot }}></span>
                                {c.name}
                              </div>
                              {editLabelColor.name === c.name && <Check size={14} color="#6B7280" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #E5E7EB', gap: '8px' }}>
                          <Search size={14} color="#6B7280" />
                          <input type="text" autoFocus placeholder="Search or create label..." value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '13px', outline: 'none', color: '#111827' }} />
                          {labelSearch && <X size={14} color="#6B7280" style={{ cursor: 'pointer' }} onClick={() => setLabelSearch('')} />}
                        </div>

                        <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
                          <div style={{ padding: '0 12px', marginBottom: '4px', fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>Available Labels</div>
                          {taskLabels.filter(l => l.name.toLowerCase().includes(labelSearch.toLowerCase())).map(lbl => (
                            
                            // ITEM LIST LABEL (Sekarang bisa di-drag!)
                            <div 
                              key={lbl.id} 
                              draggable={labelSearch === ''} // Hanya bisa ditarik jika tidak sedang mencari
                              onDragStart={(e) => handleDragStartLabel(e, lbl.id)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleDropLabel(e, lbl.id)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', cursor: 'pointer', opacity: draggedLabelId === lbl.id ? 0.5 : 1 }} 
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.querySelector('.edit-dots').style.opacity = 1; e.currentTarget.querySelector('.grip-icon').style.opacity = 1; }} 
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.querySelector('.edit-dots').style.opacity = 0; e.currentTarget.querySelector('.grip-icon').style.opacity = 0; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }} onClick={() => { onUpdateTask({ label: lbl.id }); setIsLabelOpen(false); }}>
                                {/* Icon Grip untuk penanda bisa digeser */}
                                <GripVertical className="grip-icon" size={14} color="#9CA3AF" style={{ opacity: 0, transition: 'opacity 0.2s', cursor: 'grab', marginRight: '6px' }} onClick={(e) => e.stopPropagation()} />
                                
                                {/* PERBAIKAN FONT WEIGHT & PADDING */}
                                <span style={{ fontSize: '13px', fontWeight: '400', color: lbl.color, backgroundColor: lbl.bg, padding: '2px 8px', borderRadius: '4px' }}>{lbl.name}</span>
                              </div>
                              
                              {/* PERBAIKAN WARNA BUG: Mencocokkan c.color dengan lbl.color */}
                              <button className="edit-dots" onClick={(e) => { e.stopPropagation(); setEditingLabelId(lbl.id); setEditLabelName(lbl.name); setEditLabelColor(NOTION_COLORS.find(c => c.color === lbl.color) || NOTION_COLORS[0]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0, padding: '2px', color: '#6B7280' }}><MoreHorizontal size={14} /></button>
                            </div>

                          ))}
                        </div>

                        {showCreateOption && (
                          <div style={{ padding: '8px', borderTop: '1px solid #E5E7EB' }}>
                            <div onClick={handleCreateLabel} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <Plus size={14} color="#2563EB" /> Create "{labelSearch.trim()}"
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><Clock size={16} /> Status</div>
              <div><span style={{ fontSize: '13px', fontWeight: '500', color: '#065F46', backgroundColor: '#D1FAE5', padding: '4px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getColumnDetails(task.status).color }}></span>{getColumnDetails(task.status).name}</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><CalendarIcon size={16} /> Start Date</div>
              <div>{isEditingStartDate ? <input type="date" autoFocus value={task.start_date || ''} onChange={(e) => { onUpdateTask({ start_date: e.target.value }); setIsEditingStartDate(false); }} onBlur={() => setIsEditingStartDate(false)} style={{ fontSize: '13px', padding: '4px', border: '1px solid #3B82F6', borderRadius: '4px', outline: 'none' }} /> : <span onClick={() => setIsEditingStartDate(true)} style={{ fontSize: '14px', color: task.start_date ? '#111827' : '#9CA3AF', cursor: 'text', padding: '4px 8px', borderRadius: '4px', marginLeft: '-8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>{formatDate(task.start_date) || 'Empty'}</span>}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><CalendarIcon size={16} /> End Date</div>
              <div>{isEditingEndDate ? <input type="date" autoFocus value={task.end_date || ''} onChange={(e) => { onUpdateTask({ end_date: e.target.value }); setIsEditingEndDate(false); }} onBlur={() => setIsEditingEndDate(false)} style={{ fontSize: '13px', padding: '4px', border: '1px solid #3B82F6', borderRadius: '4px', outline: 'none' }} /> : <span onClick={() => setIsEditingEndDate(true)} style={{ fontSize: '14px', color: task.end_date ? '#111827' : '#9CA3AF', cursor: 'text', padding: '4px 8px', borderRadius: '4px', marginLeft: '-8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>{formatDate(task.end_date) || 'Empty'}</span>}</div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0 0 24px 0' }} />

          <div style={{ paddingBottom: '32px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}><AlignLeft size={18} /> Description</h4>
            {isEditingDesc ? (
              <div style={{ border: '1px solid #3B82F6', borderRadius: '8px', overflow: 'hidden' }}>
                <textarea autoFocus value={descVal} onChange={(e) => setDescVal(e.target.value)} style={{ width: '100%', minHeight: '120px', padding: '12px', border: 'none', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#111827' }} placeholder="Add a more detailed description..." />
                <div style={{ padding: '8px 12px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                  <button type="button" onClick={() => fileInputRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '500', padding: '4px 8px', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Paperclip size={16} /> Attach File</button>
                  <button onClick={() => { onUpdateTask({ description: descVal }); setIsEditingDesc(false); }} style={{ marginLeft: 'auto', backgroundColor: '#111827', color: 'white', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Save</button>
                </div>
              </div>
            ) : (
              <div onClick={() => { setDescVal(task.description || ''); setIsEditingDesc(true); }} style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', fontSize: '14px', color: task.description ? '#111827' : '#9CA3AF', cursor: 'text', whiteSpace: 'pre-wrap', lineHeight: '1.6' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>{task.description || 'Add a more detailed description...'}</div>
            )}

            {task.attachment && (
              <div style={{ marginTop: '16px', position: 'relative', width: '100%' }}>
                {isImageAttachment(task.attachment) ? (
                  <div style={{ display: 'inline-block', position: 'relative' }}><img src={task.attachment} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'block' }} /></div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', maxWidth: '350px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#3B82F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><FileText size={20} /></div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.attachment_name || 'Attached Document'}</p>
                      <a href={task.attachment} download={task.attachment_name || "Attachment"} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3B82F6', textDecoration: 'none', fontWeight: '500' }}><Download size={12} /> Download File</a>
                    </div>
                  </div>
                )}
                <button onClick={() => onUpdateTask({ attachment: null, attachment_name: null })} style={{ position: 'absolute', top: '8px', right: isImageAttachment(task.attachment) ? 'auto' : '8px', left: isImageAttachment(task.attachment) ? '8px' : 'auto', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '6px', borderRadius: '6px', border: '1px solid #E5E7EB', cursor: 'pointer', color: '#EF4444', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} title="Remove Attachment"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body 
  );
};

export default TaskDrawer;