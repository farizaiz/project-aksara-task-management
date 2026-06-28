import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Icons from 'lucide-react';
import FinanceControls from './components/FinanceControls';
import FinanceSummaryCards from './components/FinanceSummaryCards';
import BudgetCategoryList from './components/BudgetCategoryList';
import RecentTransactions from './components/RecentTransactions';

import AddTransactionModal from './modals/AddTransactionModal';
import ManageCategoryModal from './modals/ManageCategoryModal';
import SetBudgetModal from './modals/SetBudgetModal';

const renderIcon = (iconName) => {
  const IconComponent = Icons[iconName] || Icons.MoreHorizontal;
  return <IconComponent size={20} />;
};

const Finance = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentMonth, setCurrentMonth] = useState('Mei 2026');
  const [searchTx, setSearchTx] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('aksara_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const catRes = await axios.get('http://localhost:8000/finance/categories', config);
        setCategories(catRes.data.data.map(c => ({
          ...c,
          icon: renderIcon(c.icon)
        })));

        const txRes = await axios.get('http://localhost:8000/finance/transactions', config);
        setTransactions(txRes.data.data);

        const budgetRes = await axios.get('http://localhost:8000/finance/budgets', config);
        setMonthlyBudgets(budgetRes.data.data);

        const catBudgetRes = await axios.get('http://localhost:8000/finance/category-budgets', config);
        setCategoryBudgets(catBudgetRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch finance data:", error);
      }
    };
    fetchData();
  }, []);

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const handlePrevMonth = () => {
    const [m, y] = currentMonth.split(' ');
    let idx = months.indexOf(m);
    let year = parseInt(y, 10);
    if (idx === 0) {
      idx = 11;
      year--;
    } else {
      idx--;
    }
    setCurrentMonth(`${months[idx]} ${year}`);
  };

  const handleNextMonth = () => {
    const [m, y] = currentMonth.split(' ');
    let idx = months.indexOf(m);
    let year = parseInt(y, 10);
    if (idx === 11) {
      idx = 0;
      year++;
    } else {
      idx++;
    }
    setCurrentMonth(`${months[idx]} ${year}`);
  };

  // Modals state
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);
  const [isManageCategoryOpen, setManageCategoryOpen] = useState(false);
  const [isSetBudgetOpen, setSetBudgetOpen] = useState(false);

  const tabs = ['Overview', 'Transactions', 'Budget'];

  // Global Budget calculations
  const currentBudgetObj = monthlyBudgets.find(b => b.monthYear === currentMonth);
  const totalBudget = currentBudgetObj ? currentBudgetObj.amount : 0;
  
  // Calculate total spent only for current month transactions (or all for now)
  const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const remainingBudget = totalBudget - totalSpent;

  // Augment categories with spent amount and allocated budget
  const categoriesWithSpent = categories.map(cat => {
    const catSpent = transactions
      .filter(tx => tx.category === cat.name && tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const cb = categoryBudgets.find(b => b.categoryId === cat.id && b.monthYear === currentMonth);
    return { ...cat, spent: catSpent, allocatedBudget: cb ? cb.amount : 0 };
  });

  const handleAddTransaction = (newTx) => {
    setTransactions([newTx, ...transactions]);
    // update category spent
    setCategories(categories.map(cat => {
      if (cat.name === newTx.category) {
        return { ...cat, spent: cat.spent + Math.abs(newTx.amount) };
      }
      return cat;
    }));
  };

  const handleDeleteCategory = async (catId) => {
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

  const handleRenameCategory = async (cat) => {
    const newName = window.prompt("Enter new name for category:", cat.name);
    if (!newName || newName.trim() === '' || newName === cat.name) return;
    
    try {
      const token = localStorage.getItem('aksara_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        name: newName.trim(),
        colorBg: cat.colorBg,
        colorIcon: cat.colorIcon
      };
      await axios.put(`http://localhost:8000/finance/categories/${cat.id}`, payload, config);
      
      setCategories(categories.map(c => 
        c.id === cat.id ? { ...c, name: newName.trim() } : c
      ));
    } catch (error) {
      console.error("Failed to rename category", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <p style={{ color: '#71717A', fontSize: '14px', margin: 0 }}>Manage personal finances and easily track monthly expenses.</p>
        </div>
        {activeTab === 'Budget' ? (
          <button
            onClick={() => setSetBudgetOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#111111', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}
          >
            <Icons.Settings2 size={16} /> Set Monthly Budget
          </button>
        ) : (
          <button
            onClick={() => setAddTransactionOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#111111', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}
          >
            <Icons.Plus size={16} /> Add Transaction
          </button>
        )}
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: activeTab === tab ? '1px solid #E4E4E7' : '1px solid transparent',
                backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                color: activeTab === tab ? '#09090B' : '#71717A',
                boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on tab */}
      {activeTab === 'Overview' && (
        <>
          <FinanceControls 
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onManageCategories={() => setManageCategoryOpen(true)}
          />

          <FinanceSummaryCards 
            totalBudget={totalBudget} 
            totalSpent={totalSpent} 
            remainingBudget={remainingBudget} 
            currentMonth={currentMonth}
            categoriesCount={categories.length}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '500px' }}>
            <BudgetCategoryList 
              categories={categoriesWithSpent} 
              onSetBudget={() => setSetBudgetOpen(true)}
              onAddCategory={() => setManageCategoryOpen(true)}
              currentMonth={currentMonth}
              totalBudget={totalBudget}
              categoryBudgets={categoryBudgets}
              setCategoryBudgets={setCategoryBudgets}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
            />
            <RecentTransactions 
              transactions={transactions} 
              onAddTransaction={() => setAddTransactionOpen(true)}
            />
          </div>

        </>
      )}

      {activeTab === 'Transactions' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Icons.Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#A1A1AA' }} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#3F3F46', fontWeight: '500' }}>
                <Icons.Filter size={16} /> Filter
              </button>
              <button 
                onClick={() => setAddTransactionOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#111111', border: '1px solid #111111', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#FFFFFF', fontWeight: '500' }}
              >
                <Icons.Plus size={16} /> Add Transaction
              </button>
            </div>
          </div>

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
              {transactions
                .filter(tx => tx.description.toLowerCase().includes(searchTx.toLowerCase()))
                .map((tx, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F4F4F5' }}>
                  <td style={{ padding: '16px 0', fontSize: '14px', color: '#3F3F46' }}>{tx.date}</td>
                  <td style={{ padding: '16px 0', fontSize: '14px', color: '#18181B' }}>{tx.description}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: tx.categoryBg || '#F4F4F5', color: tx.categoryColor || '#71717A' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 0', fontSize: '14px', color: tx.amount < 0 ? '#EF4444' : '#10B981', textAlign: 'right', fontWeight: '500' }}>
                    {tx.amount < 0 ? '-' : '+'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Budget' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <FinanceControls 
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onManageCategories={() => setManageCategoryOpen(true)}
          />

          <FinanceSummaryCards 
            totalBudget={totalBudget} 
            totalSpent={totalSpent} 
            remainingBudget={remainingBudget} 
            currentMonth={currentMonth}
            categoriesCount={categories.length}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <BudgetCategoryList 
              categories={categoriesWithSpent} 
              onSetBudget={() => setSetBudgetOpen(true)}
              onAddCategory={() => setManageCategoryOpen(true)}
              currentMonth={currentMonth}
              totalBudget={totalBudget}
              categoryBudgets={categoryBudgets}
              setCategoryBudgets={setCategoryBudgets}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AddTransactionModal 
        isOpen={isAddTransactionOpen} 
        onClose={() => setAddTransactionOpen(false)} 
        onSave={handleAddTransaction}
        categories={categories}
        setCategories={setCategories}
      />
      <ManageCategoryModal 
        isOpen={isManageCategoryOpen} 
        onClose={() => setManageCategoryOpen(false)} 
        categories={categories}
        setCategories={setCategories}
      />
      <SetBudgetModal 
        isOpen={isSetBudgetOpen} 
        onClose={() => setSetBudgetOpen(false)} 
        currentMonth={currentMonth}
        monthlyBudgets={monthlyBudgets}
        setMonthlyBudgets={setMonthlyBudgets}
      />

    </div>
  );
};

export default Finance;
