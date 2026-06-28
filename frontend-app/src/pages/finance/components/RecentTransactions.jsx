import React from 'react';
import { formatRupiah } from '../utils/financeUtils';
import { Plus } from 'lucide-react';

const RecentTransactions = ({ transactions, onAddTransaction }) => {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#18181B', margin: 0 }}>Recent Transactions</h3>
        <button style={{ background: 'none', border: 'none', color: '#3F3F46', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
          View All
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
              <th style={{ paddingBottom: '12px', fontSize: '13px', color: '#71717A', fontWeight: '500' }}>Date</th>
              <th style={{ paddingBottom: '12px', fontSize: '13px', color: '#71717A', fontWeight: '500' }}>Description</th>
              <th style={{ paddingBottom: '12px', fontSize: '13px', color: '#71717A', fontWeight: '500' }}>Category</th>
              <th style={{ paddingBottom: '12px', fontSize: '13px', color: '#71717A', fontWeight: '500', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #F4F4F5' }}>
                <td style={{ padding: '16px 0', fontSize: '14px', color: '#3F3F46' }}>{tx.date}</td>
                <td style={{ padding: '16px 0', fontSize: '14px', color: '#18181B' }}>{tx.description}</td>
                <td style={{ padding: '16px 0' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: tx.categoryBg || '#F4F4F5', color: tx.categoryColor || '#71717A' }}>
                    {tx.category}
                  </span>
                </td>
                <td style={{ padding: '16px 0', fontSize: '14px', color: tx.amount < 0 ? '#EF4444' : '#10B981', textAlign: 'right', fontWeight: '500' }}>
                  {tx.amount < 0 ? '-' : '+'} {formatRupiah(Math.abs(tx.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={onAddTransaction}
        style={{ marginTop: '24px', width: '100%', padding: '12px', backgroundColor: '#F4F4F5', border: '1px dashed #D4D4D8', borderRadius: '8px', color: '#71717A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E4E4E7'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F4F4F5'}
      >
        <Plus size={16} /> Add New Transaction
      </button>
    </div>
  );
};

export default RecentTransactions;
