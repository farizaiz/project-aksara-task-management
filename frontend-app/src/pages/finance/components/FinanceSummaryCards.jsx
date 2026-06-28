import React from 'react';
import { formatRupiah } from '../utils/financeUtils';
import { Folder, TrendingDown, TrendingUp } from 'lucide-react';

const FinanceSummaryCards = ({ totalBudget, totalSpent, remainingBudget, currentMonth, categoriesCount }) => {
  const percentSpent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const percentLeft = 100 - percentSpent;

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr 1fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Monthly Budget Overview */}
        <div>
          <p style={{ fontSize: '14px', color: '#71717A', marginBottom: '8px', fontWeight: '500' }}>Monthly Budget Overview</p>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#18181B', margin: 0 }}>{formatRupiah(totalBudget)}</h3>
          <p style={{ fontSize: '13px', color: '#71717A', marginTop: '8px' }}>Total budget for {currentMonth}</p>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '100%', backgroundColor: '#E5E7EB' }} />

        {/* Spent */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#71717A', marginBottom: '8px', fontWeight: '500' }}>Spent</p>
              <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: '#18181B', margin: 0 }}>{formatRupiah(totalSpent)}</h4>
              <p style={{ fontSize: '13px', color: '#6366F1', marginTop: '8px', fontWeight: '500' }}>{percentSpent}% of budget</p>
            </div>
            <div style={{ backgroundColor: '#EEF2FF', padding: '10px', borderRadius: '50%' }}>
              <TrendingDown color="#6366F1" size={20} />
            </div>
          </div>
        </div>

        {/* Remaining */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#71717A', marginBottom: '8px', fontWeight: '500' }}>Remaining</p>
              <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: '#18181B', margin: 0 }}>{formatRupiah(remainingBudget)}</h4>
              <p style={{ fontSize: '13px', color: '#10B981', marginTop: '8px', fontWeight: '500' }}>{percentLeft}% left</p>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', padding: '10px', borderRadius: '50%' }}>
              <TrendingUp color="#10B981" size={20} />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#71717A', marginBottom: '8px', fontWeight: '500' }}>Categories</p>
              <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: '#18181B', margin: 0 }}>{categoriesCount}</h4>
              <p style={{ fontSize: '13px', color: '#71717A', marginTop: '8px' }}>Active categories</p>
            </div>
            <div style={{ backgroundColor: '#EFF6FF', padding: '10px', borderRadius: '50%' }}>
              <Folder color="#3B82F6" size={20} />
            </div>
          </div>
        </div>

      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: '24px', height: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ 
          height: '100%', 
          backgroundColor: '#6366F1', 
          width: `${percentSpent}%`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '8px',
          minWidth: '20px'
        }}>
          {percentSpent >= 5 && <span style={{ color: '#FFFFFF', fontSize: '10px', fontWeight: '600' }}>{percentSpent}%</span>}
        </div>
      </div>
      
    </div>
  );
};

export default FinanceSummaryCards;
