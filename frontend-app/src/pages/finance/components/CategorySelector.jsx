import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, Trash2, Check, Search, X, Plus, MoreHorizontal } from 'lucide-react';

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

const CategorySelector = ({ categories, setCategories, selectedCategoryName, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingCatName, setEditingCatName] = useState(null);
  
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(NOTION_COLORS[0]);

  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
        setEditingCatName(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedCat = () => {
    return categories.find(c => c.name === selectedCategoryName) || categories[0] || null;
  };

  const handleCreateCategory = async () => {
    if (!search.trim()) return;
    const newName = search.trim();
    
    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const newCatPayload = {
        name: newName,
        budget: 0,
        icon: 'MoreHorizontal',
        colorBg: NOTION_COLORS[0].bg,
        colorIcon: NOTION_COLORS[0].color
      };
      
      const res = await axios.post('http://localhost:8000/finance/categories', newCatPayload, config);
      
      // Inject icon component dynamically for frontend rendering
      const savedCat = {
        ...res.data.data,
        icon: <MoreHorizontal size={20} />
      };

      const updated = [...categories, savedCat];
      setCategories(updated);
      onChange(newName);
      setSearch('');
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create category", error);
    }
  };

  const updateCategory = async (oldName, newName, colorObj) => {
    const catToUpdate = categories.find(c => c.name === oldName);
    if (!catToUpdate || !catToUpdate.id) return;

    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        name: newName,
        colorBg: colorObj.bg,
        colorIcon: colorObj.color
      };

      await axios.put(`http://localhost:8000/finance/categories/${catToUpdate.id}`, payload, config);

      const updated = categories.map(c => 
        c.name === oldName 
          ? { ...c, name: newName, colorBg: colorObj.bg, colorIcon: colorObj.color } 
          : c
      );
      setCategories(updated);
      if (selectedCategoryName === oldName) {
        onChange(newName);
      }
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  const handleDeleteCategory = async (catName) => {
    const catToDelete = categories.find(c => c.name === catName);
    if (!catToDelete || !catToDelete.id) return;

    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`http://localhost:8000/finance/categories/${catToDelete.id}`, config);

      const updated = categories.filter(c => c.name !== catName);
      setCategories(updated);
      if (selectedCategoryName === catName) {
        onChange(updated.length > 0 ? updated[0].name : '');
      }
      setEditingCatName(null);
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  const selectedCat = getSelectedCat();

  const searchTrimmed = search.trim().toLowerCase();
  const showCreateOption = searchTrimmed && !categories.some(c => c.name.toLowerCase() === searchTrimmed);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <div 
        onClick={() => { setIsOpen(!isOpen); setSearch(''); setEditingCatName(null); }}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D4D4D8', 
          backgroundColor: '#FFFFFF', cursor: 'pointer', boxSizing: 'border-box'
        }}
      >
        {selectedCat ? (
          <span style={{ 
            fontSize: '13px', fontWeight: '500', color: selectedCat.colorIcon, 
            backgroundColor: selectedCat.colorBg, padding: '4px 10px', borderRadius: '4px',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            {selectedCat.name}
          </span>
        ) : (
          <span style={{ fontSize: '14px', color: '#A1A1AA' }}>Select category...</span>
        )}
      </div>

      {/* Popover */}
      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '100%', 
          backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, display: 'flex', 
          flexDirection: 'column', overflow: 'hidden'
        }}>
          
          {editingCatName ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #E5E7EB' }}>
                <button type="button" onClick={() => setEditingCatName(null)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '0 8px 0 0' }}>
                  <ChevronLeft size={16} />
                </button>
                <input 
                  autoFocus 
                  value={editName} 
                  onChange={(e) => { 
                    setEditName(e.target.value); 
                    if (e.target.value.trim()) {
                      updateCategory(editingCatName, e.target.value, editColor);
                      setEditingCatName(e.target.value);
                    }
                  }} 
                  style={{ flex: 1, backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '6px 8px', fontSize: '13px', outline: 'none' }} 
                />
              </div>
              
              <div style={{ padding: '4px 0', borderBottom: '1px solid #E5E7EB' }}>
                <div onClick={() => handleDeleteCategory(editingCatName)} style={{ padding: '8px 12px', fontSize: '13px', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Trash2 size={14} /> Delete
                </div>
              </div>

              <div style={{ padding: '8px 0', maxHeight: '180px', overflowY: 'auto' }}>
                <div style={{ padding: '0 12px', marginBottom: '4px', fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>Colors</div>
                {NOTION_COLORS.map(c => (
                  <div key={c.name} onClick={() => { setEditColor(c); updateCategory(editingCatName, editName, c); }} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                      <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: c.dot }}></span>
                      {c.name}
                    </div>
                    {editColor.name === c.name && <Check size={14} color="#6B7280" />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #E5E7EB', gap: '8px' }}>
                <Search size={14} color="#6B7280" />
                <input 
                  type="text" autoFocus placeholder="Search or create category..." 
                  value={search} onChange={(e) => setSearch(e.target.value)} 
                  style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '13px', outline: 'none' }} 
                />
                {search && <X size={14} color="#6B7280" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
              </div>

              <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
                <div style={{ padding: '0 12px', marginBottom: '4px', fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>Select Category</div>
                {categories.filter(c => c.name.toLowerCase().includes(searchTrimmed)).map(c => (
                  <div 
                    key={c.name} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', cursor: 'pointer' }} 
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.querySelector('.edit-btn').style.opacity = 1; }} 
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.querySelector('.edit-btn').style.opacity = 0; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }} onClick={() => { onChange(c.name); setIsOpen(false); }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: c.colorIcon, backgroundColor: c.colorBg, padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {c.icon && React.cloneElement(c.icon, { size: 14 })} {c.name}
                      </span>
                    </div>
                    
                    <button 
                      type="button"
                      className="edit-btn" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingCatName(c.name); 
                        setEditName(c.name); 
                        setEditColor(NOTION_COLORS.find(col => col.color === c.colorIcon) || NOTION_COLORS[0]); 
                      }} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0, padding: '4px', color: '#6B7280', transition: 'opacity 0.2s' }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {showCreateOption && (
                <div style={{ padding: '8px', borderTop: '1px solid #E5E7EB' }}>
                  <div onClick={handleCreateCategory} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Plus size={14} color="#2563EB" /> Create "{search.trim()}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
