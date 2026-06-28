import React, { useState } from 'react';
import axios from 'axios';
import { X, Trash2, Edit2, Check, Plus, MoreHorizontal } from 'lucide-react';

const NOTION_COLORS = [
  { name: 'Default', color: '#374151', bg: '#F3F4F6' },
  { name: 'Gray', color: '#4B5563', bg: '#E5E7EB' },
  { name: 'Brown', color: '#92400E', bg: '#FEF3C7' },
  { name: 'Orange', color: '#C2410C', bg: '#FFEDD5' },
  { name: 'Yellow', color: '#A16207', bg: '#FEF9C3' },
  { name: 'Green', color: '#15803D', bg: '#DCFCE7' },
  { name: 'Blue', color: '#1D4ED8', bg: '#DBEAFE' },
  { name: 'Purple', color: '#7E22CE', bg: '#F3E8FF' },
  { name: 'Pink', color: '#BE185D', bg: '#FCE7F3' },
  { name: 'Red', color: '#B91C1C', bg: '#FEE2E2' },
];

const ManageCategoryModal = ({ isOpen, onClose, categories, setCategories }) => {
  if (!isOpen) return null;

  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColorBg, setEditColorBg] = useState('');
  const [editColorIcon, setEditColorIcon] = useState('');

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        name: newCatName.trim(),
        budget: 0,
        icon: 'MoreHorizontal',
        colorBg: NOTION_COLORS[0].bg,
        colorIcon: NOTION_COLORS[0].color
      };
      
      const res = await axios.post('http://localhost:8000/finance/categories', payload, config);
      const savedCat = { ...res.data.data, icon: <MoreHorizontal size={20} /> };
      
      setCategories([...categories, savedCat]);
      setNewCatName('');
    } catch (error) {
      console.error("Failed to create category", error);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditColorBg(cat.colorBg || NOTION_COLORS[0].bg);
    setEditColorIcon(cat.colorIcon || NOTION_COLORS[0].color);
  };

  const handleSaveEdit = async (catId) => {
    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        name: editName,
        colorBg: editColorBg,
        colorIcon: editColorIcon
      };

      await axios.put(`http://localhost:8000/finance/categories/${catId}`, payload, config);
      
      setCategories(categories.map(c => 
        c.id === catId ? { ...c, name: editName, colorBg: editColorBg, colorIcon: editColorIcon } : c
      ));
      setEditingCatId(null);
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`http://localhost:8000/finance/categories/${catId}`, config);
      
      setCategories(categories.filter(c => c.id !== catId));
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#18181B' }}>Manage Categories</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}><X size={20}/></button>
        </div>

        {/* Add Category */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="New category name..." 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={handleCreateCategory} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#111111', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Category List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
          {categories.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#A1A1AA', fontSize: '14px' }}>No categories created yet.</p>
          ) : (
            categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #E4E4E7', borderRadius: '8px' }}>
                
                {editingCatId === cat.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #E4E4E7', fontSize: '14px' }}
                      />
                      <button onClick={() => handleSaveEdit(cat.id)} style={{ padding: '8px', backgroundColor: '#10B981', color: '#FFF', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Check size={16} /></button>
                      <button onClick={() => setEditingCatId(null)} style={{ padding: '8px', backgroundColor: '#F4F4F5', color: '#71717A', borderRadius: '6px', border: '1px solid #D4D4D8', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {NOTION_COLORS.map(colorObj => (
                        <div 
                          key={colorObj.name}
                          onClick={() => { setEditColorBg(colorObj.bg); setEditColorIcon(colorObj.color); }}
                          style={{
                            width: '24px', height: '24px', borderRadius: '50%', backgroundColor: colorObj.bg,
                            border: editColorBg === colorObj.bg ? `2px solid ${colorObj.color}` : '1px solid #E5E7EB',
                            cursor: 'pointer'
                          }}
                          title={colorObj.name}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ backgroundColor: cat.colorBg || '#F4F4F5', color: cat.colorIcon || '#71717A', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cat.icon}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#3F3F46' }}>{cat.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleStartEdit(cat)} style={{ padding: '6px', background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(cat.id)} style={{ padding: '6px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageCategoryModal;
