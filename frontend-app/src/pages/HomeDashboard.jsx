import React from 'react';
import { 
  ClipboardList, Users, CreditCard, Target, 
  FileText, ChevronDown, CheckCircle2 
} from 'lucide-react';

// Komponen pembungkus kartu agar seragam
const Card = ({ children, style }) => (
  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E4E7', padding: '20px', ...style }}>
    {children}
  </div>
);

const HomeDashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* --- BARIS 1: SUMMARY CARDS (4 Kolom) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { icon: <ClipboardList size={28} color="#09090B" />, title: "Today's Tasks", value: "8 tasks", sub: "5 personal • 3 shared" },
          { icon: <Users size={28} color="#09090B" />, title: "Shared Tasks", value: "6 tasks", sub: "With spouse & family" },
          { icon: <CreditCard size={28} color="#09090B" />, title: "Monthly Spending", value: "Rp 6.250.000", sub: "72% of Rp 8.700.000 budget" },
          { icon: <Target size={28} color="#09090B" />, title: "Savings Progress", value: "Rp 25.500.000", sub: "68% of Rp 37.500.000 goal" },
        ].map((item, i) => (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: '#F4F4F5', borderRadius: '10px', display: 'flex' }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#71717A', fontWeight: '500', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#09090B' }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px' }}>{item.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- BARIS 2: TASKS & FINANCE --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '20px' }}>
        
        {/* 1. Personal Tasks */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>1. Personal Tasks</h3>
            <span style={{ fontSize: '12px', color: '#71717A', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              Today <ChevronDown size={12} />
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Morning workout', 'Review marketing report', 'Prepare meeting deck'].map((task, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#3F3F46' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }}/> {task}
                </span>
                <span style={{ color: '#A1A1AA' }}>09:00 AM</span>
              </div>
            ))}
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#A1A1AA', cursor: 'pointer', fontWeight: '500' }}>+ Add personal task</div>
          </div>
        </Card>

        {/* 2. Shared Tasks (Mini Kanban Mockup) */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>2. Shared Tasks with Spouse</h3>
            <span style={{ fontSize: '12px', color: '#71717A', cursor: 'pointer' }}>View all</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {['To Do', 'In Progress', 'Done'].map((col) => (
              <div key={col} style={{ backgroundColor: '#FAFAFA', padding: '12px', borderRadius: '8px', border: '1px solid #F4F4F5' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#3F3F46' }}>{col}</div>
                <div style={{ backgroundColor: '#FFF', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid #E4E4E7', marginBottom: '8px', color: '#09090B', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  Grocery shopping
                </div>
                <div style={{ fontSize: '12px', color: '#A1A1AA', cursor: 'pointer', fontWeight: '500' }}>+ Add task</div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Finance Overview */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>3. Finance Overview</h3>
            <span style={{ fontSize: '12px', color: '#71717A', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              This Month <ChevronDown size={12} />
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px' }}>Total Spending</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#09090B' }}>Rp 6.250.000</div>
          <div style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '16px' }}>72% of Rp 8.700.000 budget</div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#F4F4F5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '72%', height: '100%', backgroundColor: '#09090B', borderRadius: '4px' }}></div>
          </div>
        </Card>
      </div>

      {/* --- BARIS 3: SAVINGS, BUDGET, LEARNING, NOTES (4 Kolom) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        {/* 4. Savings Goal */}
        <Card>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600' }}>4. Savings Goal</h3>
          <p style={{ fontSize: '13px', color: '#71717A', margin: 0, lineHeight: '1.6' }}>
            Dana Pendidikan Anak<br/>
            <b style={{color: '#09090B', fontSize: '18px', display: 'block', marginTop: '4px'}}>Rp 25.500.000</b>
          </p>
        </Card>

        {/* 5. Budget Allocation (CSS Donut Chart Mockup) */}
        <Card>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600' }}>5. Budget Allocation</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Visual Donut Chart */}
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'conic-gradient(#09090B 0% 60%, #A1A1AA 60% 85%, #E4E4E7 85% 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#FFFFFF', borderRadius: '50%' }}></div>
            </div>
            {/* Legend */}
            <div style={{ fontSize: '12px', color: '#71717A', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#09090B', borderRadius: '50%' }}></span> Needs (60%)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#A1A1AA', borderRadius: '50%' }}></span> Wants (25%)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#E4E4E7', borderRadius: '50%' }}></span> Savings (15%)</div>
            </div>
          </div>
        </Card>

        {/* 6. Learning Progress */}
        <Card>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600' }}>6. Learning Progress</h3>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#09090B', margin: '0 0 12px 0' }}>UI/UX Fundamentals</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '6px', backgroundColor: '#F4F4F5', borderRadius: '3px' }}>
              <div style={{ width: '64%', height: '100%', backgroundColor: '#09090B', borderRadius: '3px' }}></div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#3F3F46' }}>64%</span>
          </div>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#09090B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
            Continue
          </button>
        </Card>

        {/* 7. Meeting / Notes */}
        <Card>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600' }}>7. Meeting / Notes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: '#3F3F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} color="#71717A" /> Weekly Planning
            </div>
            <div style={{ fontSize: '13px', color: '#3F3F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} color="#71717A" /> Family Meeting
            </div>
          </div>
        </Card>
      </div>

      {/* --- BARIS 4: DOCUMENTS (Full Width) --- */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>8. Family Documents & Memories</h3>
          <span style={{ fontSize: '12px', color: '#71717A', cursor: 'pointer' }}>View all</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['KTP - Fariz', 'Kartu Keluarga', 'Akte Kelahiran'].map((doc, i) => (
            <div key={i} style={{ border: '1px solid #E4E4E7', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', color: '#3F3F46', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: '#FAFAFA' }}>
              <FileText size={16} color="#A1A1AA" /> {doc}
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default HomeDashboard;