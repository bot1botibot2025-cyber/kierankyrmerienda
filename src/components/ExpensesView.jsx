import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  PlusCircle, 
  Search, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Filter, 
  Tag, 
  CreditCard, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

export function ExpensesView({ expenses, setExpenses }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Expense Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Ingredients & Groceries');
  const [paymentMethod, setPaymentMethod] = useState('Cash from Drawer');
  const [receiptNo, setReceiptNo] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const categories = [
    'All',
    'Ingredients & Groceries',
    'Packaging & Supplies',
    'LPG & Cooking Gas',
    'Ice & Utilities',
    'Stall Rent & Electricity',
    'Transportation',
    'Staff & Allowance',
    'Miscellaneous'
  ];

  // Financial Metrics
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayExpenses = useMemo(() => {
    return expenses
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const totalAllExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const cashDrawerExpenses = useMemo(() => {
    return expenses
      .filter(e => e.paymentMethod === 'Cash from Drawer')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (e.receiptNo && e.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, selectedCategory, searchQuery]);

  // Handle Add Expense
  const handleSaveExpense = () => {
    const amtNum = parseFloat(amount);
    if (!title.trim() || isNaN(amtNum) || amtNum <= 0) {
      alert('Please enter a valid expense title and amount');
      return;
    }

    const newExpense = {
      id: `exp_${Date.now()}`,
      date: date || todayStr,
      title: title.trim(),
      amount: amtNum,
      category,
      paymentMethod,
      receiptNo: receiptNo.trim() || 'N/A',
      notes: notes.trim()
    };

    setExpenses(prev => [newExpense, ...prev]);
    setAddModalOpen(false);

    // Reset Form
    setTitle('');
    setAmount('');
    setReceiptNo('');
    setNotes('');
  };

  const handleDeleteExpense = (id) => {
    if (confirm('Delete this expense record?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="expenses-container">
      {/* Top Banner & KPI Summary */}
      <div className="inventory-kpi-grid mb-4">
        <div className="luxe-card kpi-card">
          <span className="kpi-card-label">Today's Expenses</span>
          <div className="kpi-card-value text-danger mono-num">{formatCurrency(todayExpenses)}</div>
          <span className="text-dim text-xs">Logged for {todayStr}</span>
        </div>

        <div className="luxe-card kpi-card">
          <span className="kpi-card-label">Cash from Drawer</span>
          <div className="kpi-card-value text-amber mono-num">{formatCurrency(cashDrawerExpenses)}</div>
          <span className="text-dim text-xs">Deducted from register float</span>
        </div>

        <div className="luxe-card kpi-card">
          <span className="kpi-card-label">Total Store Expenses</span>
          <div className="kpi-card-value text-white mono-num">{formatCurrency(totalAllExpenses)}</div>
          <span className="text-dim text-xs">{expenses.length} records logged</span>
        </div>

        <div className="luxe-card kpi-card flex flex-col justify-center">
          <button className="btn btn-primary btn-lg" onClick={() => setAddModalOpen(true)}>
            <PlusCircle size={18} /> Record New Expense
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="luxe-card inventory-filter-bar mb-4">
        <div className="pos-search-wrapper" style={{ flex: 1, minWidth: '220px' }}>
          <Search size={16} className="pos-search-icon" />
          <input 
            type="text" 
            placeholder="Search groceries, LPG, ice, rent, receipt #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pos-search-input"
          />
        </div>

        <div className="pos-category-pills" style={{ margin: 0 }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense History Table */}
      <div className="luxe-card table-responsive">
        <table className="pos-data-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>EXPENSE TITLE & NOTES</th>
              <th>CATEGORY</th>
              <th>PAYMENT METHOD</th>
              <th>RECEIPT #</th>
              <th>AMOUNT (₱)</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }} className="text-muted">
                  No expense records found matching criteria.
                </td>
              </tr>
            ) : (
              filteredExpenses.map(exp => (
                <tr key={exp.id}>
                  <td className="mono-num text-dim text-xs">
                    {exp.date}
                  </td>
                  <td>
                    <div className="font-bold text-white">{exp.title}</div>
                    {exp.notes && <div className="text-dim text-xs mt-0.5">{exp.notes}</div>}
                  </td>
                  <td>
                    <span className="badge badge-gold">{exp.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${exp.paymentMethod === 'Cash from Drawer' ? 'badge-red' : 'badge-blue'}`}>
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="mono-num text-xs text-muted">
                    {exp.receiptNo || 'N/A'}
                  </td>
                  <td>
                    <span className="mono-num font-bold text-base text-danger">
                      -{formatCurrency(exp.amount)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn-trash-item"
                      onClick={() => handleDeleteExpense(exp.id)}
                      title="Delete Expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD EXPENSE */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header flex-align-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-card-border)' }}>
              <div className="flex-align-center gap-2">
                <Receipt className="text-amber" size={20} />
                <h3 className="font-bold text-lg text-white">Record Store Expense</h3>
              </div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }} className="space-y-4">
              <div>
                <label className="input-label">Expense Title / Description</label>
                <input 
                  type="text" 
                  className="input-control font-bold"
                  placeholder="e.g. 11kg LPG Refill, Tube Ice, Puregold Meat purchase"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Amount Paid (₱)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-control mono-num font-bold text-lg"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Date</label>
                  <input 
                    type="date" 
                    className="input-control mono-num"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Category</label>
                  <select 
                    className="input-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Ingredients & Groceries">Ingredients & Groceries</option>
                    <option value="Packaging & Supplies">Packaging & Supplies</option>
                    <option value="LPG & Cooking Gas">LPG & Cooking Gas</option>
                    <option value="Ice & Utilities">Ice & Utilities</option>
                    <option value="Stall Rent & Electricity">Stall Rent & Electricity</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Staff & Allowance">Staff & Allowance</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Paid Via</label>
                  <select 
                    className="input-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash from Drawer">Cash from Drawer (Register)</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Owner Personal Cash">Owner Personal Pocket</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Receipt / Invoice # (Optional)</label>
                <input 
                  type="text" 
                  className="input-control mono-num"
                  placeholder="e.g. OR-84192"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Notes</label>
                <input 
                  type="text" 
                  className="input-control"
                  placeholder="e.g. Delivered by Solane rider"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer flex-align-center justify-end gap-2" style={{ padding: '16px 20px', borderTop: '1px solid var(--bg-card-border)' }}>
              <button className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveExpense}>
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
