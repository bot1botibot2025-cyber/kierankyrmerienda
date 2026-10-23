import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  Copy, 
  Printer, 
  DollarSign, 
  Truck, 
  CheckCircle,
  ExternalLink,
  Store
} from 'lucide-react';
import { generateShoppingList, formatCurrency } from '../utils/calculations';

export function WhatToBuyView({ 
  ingredients, 
  setIngredients, 
  storeSettings, 
  onAddExpenseFromRestock 
}) {
  const [filterMode, setFilterMode] = useState('all_needed'); // 'all_needed' or 'urgent_only'
  const [checkedItems, setCheckedItems] = useState({});

  // Generate dynamic shopping list based on stock thresholds
  const fullShoppingList = useMemo(() => {
    return generateShoppingList(ingredients);
  }, [ingredients]);

  const displayList = useMemo(() => {
    if (filterMode === 'urgent_only') {
      return fullShoppingList.filter(item => item.isUrgent);
    }
    return fullShoppingList;
  }, [fullShoppingList, filterMode]);

  // Total estimated budget needed
  const totalEstBudget = displayList.reduce((sum, item) => sum + item.estTotalCost, 0);
  const urgentCount = fullShoppingList.filter(i => i.isUrgent).length;

  // Toggle checklist item
  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group by Supplier
  const groupedBySupplier = useMemo(() => {
    const groups = {};
    displayList.forEach(item => {
      const supplier = item.supplier || 'General Market / Groceries';
      if (!groups[supplier]) groups[supplier] = [];
      groups[supplier].push(item);
    });
    return groups;
  }, [displayList]);

  // Copy shopping list to clipboard for SMS or Messenger
  const handleCopyText = () => {
    const lines = [
      `🛒 [${storeSettings.storeName.toUpperCase()}] REORDER / SHOPPING LIST`,
      `Date: ${new Date().toLocaleDateString()} - Est. Budget: ${formatCurrency(totalEstBudget)}`,
      '----------------------------------------'
    ];

    Object.entries(groupedBySupplier).forEach(([supplier, items]) => {
      lines.push(`\n📍 ${supplier.toUpperCase()}:`);
      items.forEach(i => {
        const checkMark = checkedItems[i.id] ? '[x]' : '[ ]';
        const urgentFlag = i.isUrgent ? '⚠️ URGENT' : '';
        lines.push(`${checkMark} ${i.name} - Buy: ${i.packsToBuy} pack(s) (~${i.deficit} ${i.unit}) | Est: ${formatCurrency(i.estTotalCost)} ${urgentFlag}`);
      });
    });

    lines.push('\n----------------------------------------');
    lines.push(`Total Estimated Cost: ${formatCurrency(totalEstBudget)}`);

    navigator.clipboard.writeText(lines.join('\n'));
    alert('Shopping list copied to clipboard! You can paste it into Messenger, Viber, or SMS.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Bulk Receive Checked Items
  const handleBulkRestockChecked = () => {
    const itemsToRestock = displayList.filter(i => checkedItems[i.id]);
    if (itemsToRestock.length === 0) {
      alert('Please check off the items you have purchased first using the checkboxes.');
      return;
    }

    const totalCostOfChecked = itemsToRestock.reduce((sum, i) => sum + i.estTotalCost, 0);
    const confirmMsg = `Restock ${itemsToRestock.length} item(s) and add stock to inventory?\n\nTotal Cost: ${formatCurrency(totalCostOfChecked)}`;
    if (!confirm(confirmMsg)) return;

    // Update ingredients stock
    setIngredients(prev => {
      const updated = [...prev];
      itemsToRestock.forEach(restockItem => {
        const found = updated.find(x => x.id === restockItem.id);
        if (found) {
          found.currentStock += restockItem.deficit;
        }
      });
      return updated;
    });

    // Auto record expense
    if (onAddExpenseFromRestock && totalCostOfChecked > 0) {
      onAddExpenseFromRestock({
        title: `Market Run Restock (${itemsToRestock.length} items purchased)`,
        amount: totalCostOfChecked,
        category: "Ingredients & Groceries",
        paymentMethod: "Cash from Drawer",
        notes: `Auto-restocked: ${itemsToRestock.map(i => `${i.name} (+${i.deficit})`).join(', ')}`
      });
    }

    // Clear checked state
    setCheckedItems({});
    alert(`Successfully restocked ${itemsToRestock.length} items and recorded ${formatCurrency(totalCostOfChecked)} in expenses!`);
  };

  return (
    <div className="what-to-buy-container">
      {/* Top Banner */}
      <div className="luxe-card what-to-buy-header mb-4 no-print">
        <div className="flex-align-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex-align-center gap-2">
              <ShoppingBag className="text-amber" size={24} />
              <h2 className="text-xl font-bold text-white">What We Need to Buy (Reorder List)</h2>
            </div>
            <p className="text-muted text-sm mt-1">
              Smart inventory assistant automatically calculates how much ingredients, buns, patties, cups, and sauces you need to reach your target stock buffer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex-align-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={handleCopyText} title="Copy list for Messenger/SMS">
              <Copy size={15} /> Copy List
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint} title="Print checklist">
              <Printer size={15} /> Print
            </button>
            <button className="btn btn-emerald btn-sm" onClick={handleBulkRestockChecked} title="Receive delivery of checked items">
              <CheckCircle size={15} /> Stock-In Checked Items
            </button>
          </div>
        </div>

        {/* Filter Pills & Budget Highlight */}
        <div className="what-to-buy-kpi-bar mt-4 pt-3 border-t border-card flex-align-center justify-between flex-wrap gap-3">
          <div className="flex-align-center gap-2">
            <button 
              className={`category-pill ${filterMode === 'all_needed' ? 'active' : ''}`}
              onClick={() => setFilterMode('all_needed')}
            >
              All Reorder Needs ({fullShoppingList.length})
            </button>
            <button 
              className={`category-pill ${filterMode === 'urgent_only' ? 'active' : ''}`}
              onClick={() => setFilterMode('urgent_only')}
            >
              ⚠️ Critical Buffer Low Only ({urgentCount})
            </button>
          </div>

          <div className="budget-box flex-align-center gap-2">
            <span className="text-muted text-xs uppercase font-bold">Estimated Market Budget:</span>
            <span className="mono-num font-bold text-xl text-emerald">{formatCurrency(totalEstBudget)}</span>
          </div>
        </div>
      </div>

      {/* Main Checklist / Printable Area */}
      {displayList.length === 0 ? (
        <div className="luxe-card text-center py-12">
          <CheckCircle size={48} className="text-emerald mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">All Stock Levels are Healthy!</h3>
          <p className="text-muted text-sm mt-1">
            None of your ingredients or supplies are below their minimum thresholds. You are fully stocked and ready to serve suki!
          </p>
        </div>
      ) : (
        <div className="shopping-supplier-groups space-y-4 printable-area">
          {Object.entries(groupedBySupplier).map(([supplier, items]) => (
            <div key={supplier} className="luxe-card supplier-group-card">
              <div className="supplier-card-header flex-align-center justify-between pb-3 mb-3 border-b border-card">
                <div className="flex-align-center gap-2">
                  <Store className="text-amber" size={18} />
                  <h3 className="font-bold text-white text-base">{supplier}</h3>
                  <span className="badge badge-gold">{items.length} items</span>
                </div>
                <span className="mono-num text-sm text-dim">
                  Subtotal: {formatCurrency(items.reduce((s, i) => s + i.estTotalCost, 0))}
                </span>
              </div>

              {/* Items in this Supplier */}
              <div className="supplier-items-list space-y-2">
                {items.map(item => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div 
                      key={item.id} 
                      className={`shopping-item-row flex-align-center justify-between p-3 rounded-lg ${isChecked ? 'item-checked' : ''} ${item.isUrgent ? 'border-l-4 border-amber-500' : ''}`}
                      onClick={() => toggleCheck(item.id)}
                      style={{ 
                        cursor: 'pointer', 
                        background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div className="flex-align-center gap-3">
                        <button 
                          className="checkbox-toggle-btn no-print" 
                          onClick={(e) => { e.stopPropagation(); toggleCheck(item.id); }}
                          aria-label="Toggle check"
                        >
                          {isChecked ? (
                            <CheckSquare size={20} className="text-emerald" />
                          ) : (
                            <Square size={20} className="text-dim" />
                          )}
                        </button>

                        <div>
                          <div className="flex-align-center gap-2">
                            <span className={`font-bold text-white text-base ${isChecked ? 'line-through text-muted' : ''}`}>
                              {item.name}
                            </span>
                            {item.isUrgent && (
                              <span className="badge badge-red pulse-badge text-xs">⚠️ Urgent Low</span>
                            )}
                          </div>
                          
                          <div className="text-xs text-dim mt-0.5">
                            Current Stock: <span className="mono-num text-amber">{item.currentStock} {item.unit}</span> (Min Buffer: {item.minStockThreshold} {item.unit}) • Target: {item.targetStock} {item.unit}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div className="font-bold text-white mono-num text-base">
                          Buy: {item.packsToBuy} pack(s)
                        </div>
                        <div className="text-xs text-emerald mono-num">
                          Est: {formatCurrency(item.estTotalCost)}
                        </div>
                        <div className="text-dim text-xs">
                          {item.packageUnit}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
