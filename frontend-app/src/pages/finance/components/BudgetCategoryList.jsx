import React, { useState } from 'react';
import axios from 'axios';
import * as Icons from 'lucide-react';
import { Plus, MoreHorizontal, Check, X, Edit2, Tag, Trash2 } from 'lucide-react';

const renderIcon = (iconName) => {
  const IconComponent = Icons[iconName] || Icons.MoreHorizontal;
  return <IconComponent size={20} />;
};

const BudgetCategoryList = ({ categories, onAddCategory, currentMonth, totalBudget, categoryBudgets, setCategoryBudgets, onRenameCategory, onDeleteCategory }) => {
  const [editingCatId, setEditingCatId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleStartEdit = (cat) => {
    setEditingCatId(cat.id);
    setEditAmount(cat.allocatedBudget ? cat.allocatedBudget.toString() : '');
  };

  const handleSaveBudget = async (catId) => {
    const amountNum = parseInt(editAmount, 10) || 0;
    
    // Validate
    const otherBudgetsSum = categories
      .filter(c => c.id !== catId)
      .reduce((sum, c) => sum + (c.allocatedBudget || 0), 0);
      
    if (otherBudgetsSum + amountNum > totalBudget) {
      alert(`Cannot set budget. The total category budgets would exceed the global monthly budget of Rp ${totalBudget.toLocaleString('id-ID')}`);
      return;
    }

    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        monthYear: currentMonth,
        categoryId: catId,
        amount: amountNum
      };
      
      const res = await axios.post('http://localhost:8000/finance/category-budgets', payload, config);
      const savedBudget = res.data.data;
      
      const existingIndex = categoryBudgets.findIndex(b => b.categoryId === catId && b.monthYear === currentMonth);
      let updatedBudgets = [...categoryBudgets];
      if (existingIndex >= 0) {
        updatedBudgets[existingIndex] = savedBudget;
      } else {
        updatedBudgets.push(savedBudget);
      }
      setCategoryBudgets(updatedBudgets);
      setEditingCatId(null);
    } catch (error) {
      console.error("Failed to save category budget", error);
      alert("Failed to save category budget");
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#18181B' }}>Budget Categories</h3>
        <button onClick={onAddCategory} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', color: '#4F46E5', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>
      
      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {categories.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#A1A1AA', textAlign: 'center', padding: '20px' }}>No categories created yet.</p>
        ) : (
          categories.map((cat, index) => {
            const spent = cat.spent || 0;
            const allocated = cat.allocatedBudget || 0;
            const remaining = allocated - spent;
            const progress = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
            const isOverBudget = spent > allocated && allocated > 0;
            
            // Status Logic
            let statusText = "Aman";
            let statusColor = "#10B981";
            let statusBg = "#ECFDF5";
            if (progress >= 100) {
              statusText = "Habis";
              statusColor = "#EF4444";
              statusBg = "#FEF2F2";
            } else if (progress >= 80) {
              statusText = "Perhatian";
              statusColor = "#F59E0B";
              statusBg = "#FEF3C7";
            }

            // Colors for Icon
            const iconBg = cat.colorBg || '#FFF7ED';
            const iconColor = cat.colorIcon || '#EA580C';

            return (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1.5fr auto auto', gap: '20px', alignItems: 'center', padding: '16px', border: '1px solid #F4F4F5', borderRadius: '8px' }}>
                
                {/* 1. Icon & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ backgroundColor: iconBg, color: iconColor, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {renderIcon(cat.icon)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#18181B' }}>{cat.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#71717A', marginTop: '4px' }}>Category</p>
                  </div>
                </div>

                {/* 2. Spent / Budget Progress */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#18181B' }}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(spent)}
                    </span>
                    <span style={{ fontSize: '14px', color: '#A1A1AA' }}>/</span>
                    
                    {editingCatId === cat.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input 
                          type="number" 
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="Amount"
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #E4E4E7', fontSize: '13px', width: '100px' }}
                        />
                        <button onClick={() => handleSaveBudget(cat.id)} style={{ padding: '4px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Check size={14}/></button>
                        <button onClick={() => setEditingCatId(null)} style={{ padding: '4px', backgroundColor: '#F4F4F5', color: '#71717A', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><X size={14}/></button>
                      </div>
                    ) : (
                      <span 
                        style={{ fontSize: '14px', color: '#71717A' }}
                      >
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(allocated)}
                      </span>
                    )}
                  </div>

                  <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ 
                      height: '100%', 
                      backgroundColor: isOverBudget ? '#EF4444' : iconColor, 
                      width: `${progress}%`,
                      borderRadius: '3px' 
                    }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#71717A' }}>{Math.round(progress)}% used</p>
                </div>

                {/* 3. Remaining */}
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: remaining < 0 ? '#EF4444' : '#10B981' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(remaining)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#71717A', marginTop: '4px' }}>Remaining</p>
                </div>

                {/* 4. Status Pill */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: statusBg, padding: '4px 10px', borderRadius: '20px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColor }} />
                    <span style={{ fontSize: '12px', fontWeight: '500', color: statusColor }}>{statusText}</span>
                  </div>
                </div>

                {/* 5. More options */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)} 
                    style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer' }}
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {openMenuId === cat.id && (
                    <div style={{ position: 'absolute', top: '100%', right: '0', backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: '1px solid #E5E7EB', zIndex: 10, width: '180px', overflow: 'hidden', marginTop: '4px' }}>
                      <button onClick={() => { handleStartEdit(cat); setOpenMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid #F4F4F5', cursor: 'pointer', fontSize: '13px', color: '#3F3F46', textAlign: 'left' }}>
                        <Edit2 size={14} /> Edit Budget
                      </button>
                      <button onClick={() => { onRenameCategory(cat); setOpenMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid #F4F4F5', cursor: 'pointer', fontSize: '13px', color: '#3F3F46', textAlign: 'left' }}>
                        <Tag size={14} /> Rename Category
                      </button>
                      <button onClick={() => { onDeleteCategory(cat.id); setOpenMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#EF4444', textAlign: 'left' }}>
                        <Trash2 size={14} /> Delete Category
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default BudgetCategoryList;
