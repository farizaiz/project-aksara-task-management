import React from 'react';
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';

const FinanceControls = ({ currentMonth, onPrevMonth, onNextMonth, onManageCategories }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      
      {/* Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
        <button onClick={onPrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#71717A' }}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#18181B', minWidth: '100px', textAlign: 'center' }}>
          {currentMonth}
        </span>
        <button onClick={onNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#71717A' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Manage Categories Button */}
      <button 
        onClick={onManageCategories}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: '8px', color: '#3F3F46', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
      >
        <Settings2 size={18} /> Manage Categories
      </button>

    </div>
  );
};

export default FinanceControls;
