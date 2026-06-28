import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import CategorySelector from '../components/CategorySelector';

const AddTransactionModal = ({ isOpen, onClose, onSave, categories, setCategories }) => {
  if (!isOpen) return null;

  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [type, setType] = useState('expense');

  const handleSave = async () => {
    if (!date || !amount || !category) return;
    
    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        date,
        description,
        category,
        amount: parseInt(amount) * (type === 'expense' ? -1 : 1)
      };

      const res = await axios.post('http://localhost:8000/finance/transactions', payload, config);
      
      onSave(res.data.data);
      onClose();
      
      // Reset form
      setDate('');
      setDescription('');
      setCategory(categories.length > 0 ? categories[0].name : '');
      setAmount('');
      setType('expense');
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#18181B' }}>Add New Transaction</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}><X size={20}/></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#3F3F46' }}>Date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D4D4D8' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#3F3F46' }}>Description</label>
            <input type="text" required placeholder="e.g. Bought Lunch" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D4D4D8' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#3F3F46' }}>Category</label>
            <CategorySelector 
              categories={categories}
              setCategories={setCategories}
              selectedCategoryName={category}
              onChange={setCategory}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#3F3F46' }}>Amount (Rp)</label>
            <input type="number" required placeholder="e.g. 50000" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D4D4D8' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #D4D4D8', backgroundColor: '#FFFFFF', color: '#3F3F46', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#18181B', color: '#FFFFFF', cursor: 'pointer', fontWeight: '500' }}>Save Transaction</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddTransactionModal;
