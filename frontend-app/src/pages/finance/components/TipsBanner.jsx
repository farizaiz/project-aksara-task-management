import React from 'react';
import { Lightbulb } from 'lucide-react';

const TipsBanner = () => {
  return (
    <div style={{ backgroundColor: '#EEF2FF', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '16px', marginTop: '24px' }}>
      <div style={{ backgroundColor: '#C7D2FE', padding: '8px', borderRadius: '50%', color: '#4F46E5', flexShrink: 0 }}>
        <Lightbulb size={20} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#1E1B4B' }}>Tips</h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#312E81' }}>
          Catat setiap pengeluaran agar budget bulanan lebih terkontrol dan keuangan lebih sehat.
        </p>
      </div>
    </div>
  );
};

export default TipsBanner;
