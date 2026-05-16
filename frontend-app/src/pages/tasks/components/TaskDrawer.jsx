import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Code, X, FileText, Clock, Calendar as CalendarIcon, 
  AlignLeft, GripVertical, Trash2, Paperclip, Download
} from 'lucide-react';

const TaskDrawer = ({ 
  task, 
  onClose, 
  onUpdateTask, 
  getColumnDetails, 
  getTaskLabel, 
  taskLabels, 
  formatDate 
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState('');
  
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState('');

  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);
  
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descVal, setDescVal] = useState('');

  // Referensi untuk input file tersembunyi
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
          setIsLabelOpen(false);
          setLabelSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLabelOpen]);

  // FUNGSI UNTUK HANDLE UPLOAD FILE (Semua Jenis)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Peringatan opsional jika file terlalu besar untuk disave sebagai Base64
      if (file.size > 5 * 1024 * 1024) {
        alert("Peringatan: Mengunggah file di atas 5MB menggunakan metode Base64 dapat membebani database sementara Anda.");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Menyimpan gambar/file sebagai Base64 string beserta nama filenya
        onUpdateTask({ 
          attachment: reader.result,
          attachment_name: file.name 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper untuk mengecek apakah Base64 yang tersimpan adalah gambar
  const isImageAttachment = (base64String) => {
    if (!base64String) return false;
    return base64String.startsWith('data:image/');
  };

  if (!task) return null;

  return createPortal(
    <>
      <div 
        onClick={onClose} 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.35)', zIndex: 999998, backdropFilter: 'blur(2px)' }} 
      />
      
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', backgroundColor: '#FFFFFF', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', zIndex: 999999, fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
        
        {/* Header Icons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', paddingBottom: '0' }}>
          <button style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', padding: 0 }}><Code size={20} /></button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', padding: 0 }}><X size={20} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px 24px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Title */}
          {isEditingTitle ? (
            <input 
              autoFocus value={titleVal} onChange={(e) => setTitleVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onUpdateTask({ title: titleVal }); setIsEditingTitle(false); }
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              onBlur={() => { onUpdateTask({ title: titleVal }); setIsEditingTitle(false); }}
              style={{ fontSize: '32px', fontWeight: '700', width: '100%', border: '1px solid #3B82F6', borderRadius: '8px', padding: '4px 8px', marginBottom: '24px', outline: 'none', color: '#111827' }}
            />
          ) : (
            <h2 
              onClick={() => { setTitleVal(task.title); setIsEditingTitle(true); }}
              style={{ margin: '0 0 24px 0', fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1.2', cursor: 'text', padding: '4px 8px', borderRadius: '8px', marginLeft: '-8px' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {task.title}
            </h2>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0 0 24px 0' }} />

          {/* Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            
            {/* Label */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><FileText size={16} /> Label</div>
              <div style={{ position: 'relative' }}>
                <button 
                  id="btn-drawer-label"
                  onClick={() => { setIsLabelOpen(!isLabelOpen); setLabelSearch(''); }}
                  style={{ fontSize: '13px', fontWeight: '500', color: '#FFFFFF', backgroundColor: getTaskLabel(task.id).color, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  {getTaskLabel(task.id).name}
                </button>
                {isLabelOpen && (
                  <div id="drawer-label-selector" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '240px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 40, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <input type="text" autoFocus placeholder="Search for an option..." value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)} style={{ padding: '10px 12px', border: 'none', borderBottom: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', color: '#111827' }} />
                    <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
                      <div style={{ padding: '0 12px', marginBottom: '4px', fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>Select an option or create one</div>
                      {taskLabels.filter(l => l.name.toLowerCase().includes(labelSearch.toLowerCase())).map(lbl => (
                        <div key={lbl.id} onClick={() => { onUpdateTask({ label: lbl.id }); setIsLabelOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GripVertical size={14} color="#9CA3AF" /><span style={{ fontSize: '11px', fontWeight: '500', color: '#FFFFFF', backgroundColor: lbl.color, padding: '2px 8px', borderRadius: '4px' }}>{lbl.name}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><Clock size={16} /> Status</div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#065F46', backgroundColor: '#D1FAE5', padding: '4px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getColumnDetails(task.status).color }}></span>
                  {getColumnDetails(task.status).name}
                </span>
              </div>
            </div>

            {/* Start Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><CalendarIcon size={16} /> Start Date</div>
              <div>
                {isEditingStartDate ? (
                  <input type="date" autoFocus value={task.start_date || ''} onChange={(e) => { onUpdateTask({ start_date: e.target.value }); setIsEditingStartDate(false); }} onBlur={() => setIsEditingStartDate(false)} style={{ fontSize: '13px', padding: '4px', border: '1px solid #3B82F6', borderRadius: '4px', outline: 'none' }} />
                ) : (
                  <span onClick={() => setIsEditingStartDate(true)} style={{ fontSize: '14px', color: task.start_date ? '#111827' : '#9CA3AF', cursor: 'text', padding: '4px 8px', borderRadius: '4px', marginLeft: '-8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    {formatDate(task.start_date) || 'Empty'}
                  </span>
                )}
              </div>
            </div>

            {/* End Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}><CalendarIcon size={16} /> End Date</div>
              <div>
                {isEditingEndDate ? (
                  <input type="date" autoFocus value={task.end_date || ''} onChange={(e) => { onUpdateTask({ end_date: e.target.value }); setIsEditingEndDate(false); }} onBlur={() => setIsEditingEndDate(false)} style={{ fontSize: '13px', padding: '4px', border: '1px solid #3B82F6', borderRadius: '4px', outline: 'none' }} />
                ) : (
                  <span onClick={() => setIsEditingEndDate(true)} style={{ fontSize: '14px', color: task.end_date ? '#111827' : '#9CA3AF', cursor: 'text', padding: '4px 8px', borderRadius: '4px', marginLeft: '-8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    {formatDate(task.end_date) || 'Empty'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0 0 24px 0' }} />

          {/* Description & Upload File Area */}
          <div style={{ paddingBottom: '32px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlignLeft size={18} /> Description
            </h4>
            
            {isEditingDesc ? (
              <div style={{ border: '1px solid #3B82F6', borderRadius: '8px', overflow: 'hidden' }}>
                <textarea
                   autoFocus value={descVal} onChange={(e) => setDescVal(e.target.value)} 
                   style={{ width: '100%', minHeight: '120px', padding: '12px', border: 'none', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#111827' }}
                   placeholder="Add a more detailed description..."
                />
                <div style={{ padding: '8px 12px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  
                  {/* --- PERBAIKAN: Input file sekarang menerima gambar, PDF, Word, PPT, Excel --- */}
                  <input 
                    type="file" 
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload} 
                  />
                  
                  {/* Custom Upload Button diubah teks dan ikonnya */}
                  <button type="button" onClick={() => fileInputRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '500', padding: '4px 8px', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Paperclip size={16} /> Attach File
                  </button>

                  <button 
                    onClick={() => { onUpdateTask({ description: descVal }); setIsEditingDesc(false); }} 
                    style={{ marginLeft: 'auto', backgroundColor: '#111827', color: 'white', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => { setDescVal(task.description || ''); setIsEditingDesc(true); }}
                style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', fontSize: '14px', color: task.description ? '#111827' : '#9CA3AF', cursor: 'text', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {task.description || 'Add a more detailed description...'}
              </div>
            )}

            {/* --- MENAMPILKAN FILE YANG DI-UPLOAD (Logika Gambar vs Dokumen) --- */}
            {task.attachment && (
              <div style={{ marginTop: '16px', position: 'relative', width: '100%' }}>
                
                {isImageAttachment(task.attachment) ? (
                  // JIKA FILE ADALAH GAMBAR
                  <div style={{ display: 'inline-block', position: 'relative' }}>
                    <img src={task.attachment} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'block' }} />
                  </div>
                ) : (
                  // JIKA FILE ADALAH DOKUMEN (PDF, WORD, DLL)
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', maxWidth: '350px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#3B82F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.attachment_name || 'Attached Document'}
                      </p>
                      <a href={task.attachment} download={task.attachment_name || "Attachment"} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3B82F6', textDecoration: 'none', fontWeight: '500' }}>
                        <Download size={12} /> Download File
                      </a>
                    </div>
                  </div>
                )}

                {/* Tombol Hapus Attachment (Berlaku untuk Gambar maupun Dokumen) */}
                <button 
                  onClick={() => onUpdateTask({ attachment: null, attachment_name: null })} 
                  style={{ position: 'absolute', top: '8px', right: isImageAttachment(task.attachment) ? 'auto' : '8px', left: isImageAttachment(task.attachment) ? '8px' : 'auto', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '6px', borderRadius: '6px', border: '1px solid #E5E7EB', cursor: 'pointer', color: '#EF4444', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  title="Remove Attachment"
                >
                  <Trash2 size={16} />
                </button>
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