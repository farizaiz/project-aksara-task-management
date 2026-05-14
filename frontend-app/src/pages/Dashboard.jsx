import React from 'react';

// Komponen pembungkus kartu agar seragam
const Card = ({ children, style }) => (
  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E4E7', padding: '20px', ...style }}>
    {children}
  </div>
);

const Board = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Judul */}
      <div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#09090B' }}>
          Home Workspace
        </h1>
      </div>

      {/* Baris 1: Summary Cards (4 Kolom) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { icon: '📋', title: "Today's Tasks", value: "8 tasks", sub: "5 personal • 3 shared" },
          { icon: '👥', title: "Shared Tasks", value: "6 tasks", sub: "With spouse & family" },
          { icon: '💳', title: "Monthly Spending", value: "Rp 6.250.000", sub: "72% of Rp 8.700.000 budget" },
          { icon: '🎯', title: "Savings Progress", value: "Rp 25.500.000", sub: "68% of Rp 37.500.000 goal" },
        ].map((item, i) => (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '28px' }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: '13px', color: '#71717A', fontWeight: '500', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#09090B' }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px' }}>{item.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Baris 2: Tasks & Finance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '20px' }}>
        {/* Personal Tasks */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>1. Personal Tasks</h3>
            <span style={{ fontSize: '12px', color: '#71717A' }}>Today ▼</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Morning workout', 'Review marketing report', 'Prepare meeting deck'].map((task, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#3F3F46' }}>
                <span><input type="checkbox" style={{ marginRight: '8px' }}/> {task}</span>
                <span style={{ color: '#A1A1AA' }}>09:00 AM</span>
              </div>
            ))}
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#71717A', cursor: 'pointer' }}>+ Add personal task</div>
          </div>
        </Card>

        {/* Shared Tasks (Mini Kanban Mockup) */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>2. Shared Tasks with Spouse</h3>
            <span style={{ fontSize: '12px', color: '#71717A' }}>View all</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {['To Do', 'In Progress', 'Done'].map((col) => (
              <div key={col} style={{ backgroundColor: '#FAFAFA', padding: '12px', borderRadius: '8px', border: '1px solid #F4F4F5' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>{col}</div>
                <div style={{ backgroundColor: '#FFF', padding: '8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #E4E4E7', marginBottom: '8px' }}>Grocery shopping</div>
                <div style={{ fontSize: '12px', color: '#71717A', cursor: 'pointer' }}>+ Add task</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Finance Overview */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>3. Finance Overview</h3>
            <span style={{ fontSize: '12px', color: '#71717A' }}>This Month ▼</span>
          </div>
          <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px' }}>Total Spending</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Rp 6.250.000</div>
          <div style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '16px' }}>72% of Rp 8.700.000 budget</div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#F4F4F5', borderRadius: '4px', marginBottom: '20px' }}>
            <div style={{ width: '72%', height: '100%', backgroundColor: '#09090B', borderRadius: '4px' }}></div>
          </div>
        </Card>
      </div>

      {/* Baris 3: Savings, Budget, Learning, Notes (4 Kolom) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <Card><h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>4. Savings Goal</h3><p style={{ fontSize: '13px', color: '#71717A' }}>Dana Pendidikan Anak<br/><b style={{color: '#09090B', fontSize: '18px'}}>Rp 25.500.000</b></p></Card>
        <Card><h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>5. Budget Allocation</h3><div style={{ fontSize: '30px', textAlign: 'center' }}>🍩</div></Card>
        <Card><h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>6. Learning Progress</h3><p style={{ fontSize: '13px', fontWeight: 'bold' }}>UI/UX Fundamentals</p><button style={{ width: '100%', padding: '8px', backgroundColor: '#09090B', color: 'white', border: 'none', borderRadius: '6px', marginTop: '10px' }}>Continue</button></Card>
        <Card><h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>7. Meeting / Notes</h3><p style={{ fontSize: '13px', color: '#3F3F46' }}>📄 Weekly Planning<br/>📄 Family Meeting</p></Card>
      </div>

      {/* Baris 4: Documents (Full Width) */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>8. Family Documents & Memories</h3>
          <span style={{ fontSize: '12px', color: '#71717A' }}>View all</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['KTP - Fariz', 'Kartu Keluarga', 'Akte Kelahiran'].map((doc, i) => (
            <div key={i} style={{ border: '1px solid #E4E4E7', padding: '12px', borderRadius: '8px', fontSize: '13px', minWidth: '150px' }}>📄 {doc}</div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default Board;