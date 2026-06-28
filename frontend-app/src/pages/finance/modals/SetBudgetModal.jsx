import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, CalendarDays } from 'lucide-react';

const SetBudgetModal = ({ isOpen, onClose, currentMonth, monthlyBudgets, setMonthlyBudgets }) => {
  if (!isOpen) return null;

  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const existing = monthlyBudgets.find(b => b.monthYear === currentMonth);
    if (existing) {
      setAmount(existing.amount.toString());
    } else {
      setAmount('');
    }
  }, [currentMonth, monthlyBudgets, isOpen]);

  const handleSave = async () => {
    if (!amount) return;
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        monthYear: currentMonth,
        amount: parseInt(amount, 10)
      };

      const res = await axios.post('http://localhost:8000/finance/budgets', payload, config);
      
      const savedBudget = res.data.data;
      
      // Update local state
      const existingIndex = monthlyBudgets.findIndex(b => b.monthYear === currentMonth);
      if (existingIndex >= 0) {
        const updated = [...monthlyBudgets];
        updated[existingIndex] = savedBudget;
        setMonthlyBudgets(updated);
      } else {
        setMonthlyBudgets([...monthlyBudgets, savedBudget]);
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to update budget", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#18181B' }}>Set Total Budget</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}><X size={20}/></button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#3F3F46', fontWeight: '500' }}>
            <CalendarDays size={16} /> For Month
          </label>
          <input 
            type="text" 
            value={currentMonth} 
            disabled
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#F4F4F5', color: '#71717A', fontSize: '14px', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#3F3F46', fontWeight: '500' }}>
            Total Budget Amount
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '14px', color: '#71717A' }}>Rp</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000000"
              autoFocus
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '6px', border: '1px solid #D4D4D8', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #D4D4D8', backgroundColor: '#FFFFFF', color: '#3F3F46', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cancel</button>
          <button onClick={handleSave} disabled={isSaving || !amount} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#111111', color: '#FFFFFF', cursor: (isSaving || !amount) ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', opacity: (isSaving || !amount) ? 0.7 : 1 }}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Budget'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SetBudgetModal;
