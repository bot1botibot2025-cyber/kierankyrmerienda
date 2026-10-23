import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  PlusCircle, 
  Edit3, 
  Layers, 
  TrendingUp, 
  CheckCircle, 
  Search,
  DollarSign,
  UtensilsCrossed,
  X,
  Save,
  ShoppingBag
} from 'lucide-react';
import { 
  calculateMenuItemCost, 
  calculateProfitMargin, 
  formatCurrency 
} from '../utils/calculations';

export function InventoryView({ 
  ingredients, 
  setIngredients, 
  menuItems, 
  setMenuItems, 
  onAddExpenseFromRestock 
}) {
  const [activeSubTab, setActiveSubTab] = useState('raw'); // 'raw' or 'recipes'
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockCost, setRestockCost] = useState('');
  const [autoLogExpense, setAutoLogExpense] = useState(true);

  const [editIngredientModal, setEditIngredientModal] = useState(null);
  const [newIngredientModal, setNewIngredientModal] = useState(false);

  // New Ingredient form state
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState('Breads & Buns');
  const [newIngUnit, setNewIngUnit] = useState('pcs');
  const [newIngStock, setNewIngStock] = useState('50');
  const [newIngMin, setNewIngMin] = useState('15');
  const [newIngTarget, setNewIngTarget] = useState('60');
  const [newIngUnitCost, setNewIngUnitCost] = useState('5.00');
  const [newIngPackUnit, setNewIngPackUnit] = useState('Pack of 10 pcs');
  const [newIngPackCost, setNewIngPackCost] = useState('50.00');
  const [newIngSupplier, setNewIngSupplier] = useState('');

  // Map of ingredients
  const ingredientsMap = useMemo(() => {
    const map = {};
    ingredients.forEach(i => { map[i.id] = i; });
    return map;
  }, [ingredients]);

  // Categories matching official ingredients
  const categories = ['All', 'Breads & Buns', 'Meats & Proteins', 'Batter & Sweets', 'Beverages & Drinks', 'Sauces & Condiments', 'Packaging & Disposables'];

  // Metrics
  const totalValue = ingredients.reduce((sum, ing) => sum + (ing.currentStock * ing.unitCost), 0);
  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minStockThreshold).length;
  const outOfStockCount = ingredients.filter(i => i.currentStock <= 0).length;

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing => {
      const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
      const matchesSearch = ing.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            (ing.supplier && ing.supplier.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [ingredients, selectedCategory, searchFilter]);

  // Handle Quick Restock Submission
  const handleConfirmRestock = () => {
    if (!restockModalItem) return;
    const qtyToAdd = parseFloat(restockQty) || 0;
    const costAmount = parseFloat(restockCost) || 0;

    if (qtyToAdd <= 0) {
      alert('Please enter a valid restock quantity');
      return;
    }

    // Update ingredient stock
    setIngredients(prev => prev.map(item => {
      if (item.id === restockModalItem.id) {
        return {
          ...item,
          currentStock: Number((item.currentStock + qtyToAdd).toFixed(2))
        };
      }
      return item;
    }));

    // Auto-create expense record if checked
    if (autoLogExpense && costAmount > 0 && onAddExpenseFromRestock) {
      onAddExpenseFromRestock({
        title: `Restocked ${qtyToAdd} ${restockModalItem.unit} of ${restockModalItem.name}`,
        amount: costAmount,
        category: "Ingredients & Groceries",
        paymentMethod: "Cash from Drawer",
        notes: `Restock delivery from ${restockModalItem.supplier || 'Supplier'}`
      });
    }

    setRestockModalItem(null);
    setRestockQty('');
    setRestockCost('');
  };

  // Handle Physical Stock Audit Count Adjustment
  const handleQuickAdjustStock = (ingId, newCount) => {
    const num = parseFloat(newCount);
    if (isNaN(num) || num < 0) return;
    setIngredients(prev => prev.map(item => {
      if (item.id === ingId) {
        return { ...item, currentStock: num };
      }
      return item;
    }));
  };

  // Handle Create New Ingredient
  const handleCreateIngredient = () => {
    if (!newIngName.trim()) {
      alert('Please enter ingredient name');
      return;
    }

    const newId = `ing_${Date.now()}`;
    const newObj = {
      id: newId,
      name: newIngName.trim(),
      category: newIngCategory,
      unit: newIngUnit,
      currentStock: parseFloat(newIngStock) || 0,
      minStockThreshold: parseFloat(newIngMin) || 10,
      targetStock: parseFloat(newIngTarget) || 50,
      unitCost: parseFloat(newIngUnitCost) || 0,
      packageUnit: newIngPackUnit,
      packageCost: parseFloat(newIngPackCost) || 0,
      supplier: newIngSupplier.trim() || 'Local Market'
    };

    setIngredients(prev => [...prev, newObj]);
    setNewIngredientModal(false);
    // Reset form
    setNewIngName('');
  };

  return (
    <div className="inventory-container">
      {/* Sub-tab Navigation */}
      <div className="inventory-header-tabs">
        <div className="subtabs-group">
          <button 
            className={`subtab-btn ${activeSubTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('raw')}
          >
            <Package size={17} />
            <span>Raw Ingredients & Stock ({ingredients.length})</span>
            {lowStockCount > 0 && (
              <span className="badge badge-red ml-1">{lowStockCount} Low</span>
            )}
          </button>
          <button 
            className={`subtab-btn ${activeSubTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('recipes')}
          >
            <UtensilsCrossed size={17} />
            <span>Menu Recipes & Food Cost Margins ({menuItems.length})</span>
          </button>
        </div>

        {activeSubTab === 'raw' && (
          <button className="btn btn-primary btn-sm" onClick={() => setNewIngredientModal(true)}>
            <PlusCircle size={16} /> Add Ingredient
          </button>
        )}
      </div>

      {/* VIEW 1: RAW INGREDIENTS LIST */}
      {activeSubTab === 'raw' && (
        <>
          {/* KPI Summary Cards */}
          <div className="inventory-kpi-grid">
            <div className="luxe-card kpi-card">
              <span className="kpi-card-label">Total Ingredients</span>
              <div className="kpi-card-value mono-num">{ingredients.length} items</div>
              <span className="text-dim text-xs">Across 5 store categories</span>
            </div>

            <div className="luxe-card kpi-card">
              <span className="kpi-card-label">Estimated Stock Value</span>
              <div className="kpi-card-value text-emerald mono-num">{formatCurrency(totalValue)}</div>
              <span className="text-dim text-xs">Total cost of on-hand inventory</span>
            </div>

            <div className="luxe-card kpi-card">
              <span className="kpi-card-label">Low Stock Alerts</span>
              <div className="kpi-card-value text-amber mono-num">{lowStockCount}</div>
              <span className="text-dim text-xs">Items below safe buffer</span>
            </div>

            <div className="luxe-card kpi-card">
              <span className="kpi-card-label">Out of Stock</span>
              <div className={`kpi-card-value mono-num ${outOfStockCount > 0 ? 'text-danger' : 'text-emerald'}`}>
                {outOfStockCount}
              </div>
              <span className="text-dim text-xs">Completely depleted</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="luxe-card inventory-filter-bar">
            <div className="pos-search-wrapper" style={{ flex: 1, minWidth: '240px' }}>
              <Search size={16} className="pos-search-icon" />
              <input 
                type="text" 
                placeholder="Search buns, patties, cups, jellies, sauces..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
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

          {/* Ingredients Table */}
          <div className="luxe-card table-responsive">
            <table className="pos-data-table">
              <thead>
                <tr>
                  <th>INGREDIENT / SUPPLY</th>
                  <th>CATEGORY</th>
                  <th>CURRENT STOCK</th>
                  <th>MIN BUFFER</th>
                  <th>STATUS</th>
                  <th>UNIT COST</th>
                  <th>PACKAGE INFO</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map(ing => {
                  const isOut = ing.currentStock <= 0;
                  const isLow = ing.currentStock <= ing.minStockThreshold;
                  const percentOfTarget = Math.min(100, Math.round((ing.currentStock / ing.targetStock) * 100));

                  return (
                    <tr key={ing.id} className={isLow ? 'row-highlight-warning' : ''}>
                      <td>
                        <div className="font-bold text-white">{ing.name}</div>
                        <div className="text-dim text-xs">Supplier: {ing.supplier || 'Standard'}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue">{ing.category}</span>
                      </td>
                      <td>
                        <div className="flex-align-center gap-2">
                          <span className="mono-num font-bold text-lg text-white">
                            {ing.currentStock} {ing.unit}
                          </span>
                        </div>
                        {/* Visual stock progress bar */}
                        <div className="stock-progress-track">
                          <div 
                            className={`stock-progress-fill ${isOut ? 'bg-danger' : isLow ? 'bg-amber' : 'bg-emerald'}`}
                            style={{ width: `${Math.max(5, percentOfTarget)}%` }}
                          />
                        </div>
                      </td>
                      <td>
                        <span className="mono-num text-muted">{ing.minStockThreshold} {ing.unit}</span>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="badge badge-red pulse-badge">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-gold pulse-badge">Low Stock</span>
                        ) : (
                          <span className="badge badge-green">In Stock</span>
                        )}
                      </td>
                      <td>
                        <span className="mono-num font-bold">{formatCurrency(ing.unitCost)}</span>
                        <div className="text-dim text-xs">per {ing.unit}</div>
                      </td>
                      <td>
                        <div className="text-xs text-white">{ing.packageUnit}</div>
                        <div className="text-dim text-xs mono-num">({formatCurrency(ing.packageCost)})</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex-align-center gap-1 justify-end">
                          <button 
                            className="btn btn-emerald btn-sm"
                            onClick={() => {
                              setRestockModalItem(ing);
                              setRestockQty('');
                              setRestockCost(ing.packageCost ? ing.packageCost.toString() : '');
                            }}
                            title="Receive new delivery"
                          >
                            <PlusCircle size={14} /> Stock In
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              const promptVal = prompt(`Update physical count for ${ing.name} (${ing.unit}):`, ing.currentStock);
                              if (promptVal !== null) {
                                handleQuickAdjustStock(ing.id, promptVal);
                              }
                            }}
                            title="Physical Audit Count"
                          >
                            <Edit3 size={14} /> Count
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* VIEW 2: MENU RECIPES & FOOD COST MARGINS */}
      {activeSubTab === 'recipes' && (
        <div className="menu-recipes-list">
          <div className="luxe-card mb-4">
            <h3 className="text-lg font-bold text-white mb-1">🍔 Recipe Bill of Materials (BOM) & Food Cost Margins</h3>
            <p className="text-muted text-sm">
              Each recipe links directly to your ingredients. When a hotdog or coffee jelly is sold, ingredients are automatically deducted, and your true profit margin is calculated!
            </p>
          </div>

          <div className="recipes-grid">
            {menuItems.map(menuItem => {
              const cost = calculateMenuItemCost(menuItem, ingredientsMap);
              const { profit, marginPercent } = calculateProfitMargin(menuItem.price, cost);

              return (
                <div key={menuItem.id} className="luxe-card recipe-card">
                  <div className="recipe-card-header">
                    <div className="flex-align-center gap-2">
                      <span className="recipe-item-emoji">{menuItem.emoji}</span>
                      <div>
                        <h4 className="recipe-item-title">{menuItem.name}</h4>
                        <span className="badge badge-gold">{menuItem.category}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="text-dim text-xs">Selling Price</span>
                      <div className="mono-num font-bold text-lg text-emerald">{formatCurrency(menuItem.price)}</div>
                    </div>
                  </div>

                  {/* Margins Bar */}
                  <div className="recipe-margin-banner">
                    <div>
                      <span className="text-dim text-xs">Food Cost (COGS)</span>
                      <div className="mono-num font-bold text-white">{formatCurrency(cost)}</div>
                    </div>
                    <div>
                      <span className="text-dim text-xs">Net Profit / Item</span>
                      <div className="mono-num font-bold text-emerald">{formatCurrency(profit)}</div>
                    </div>
                    <div>
                      <span className="text-dim text-xs">Gross Margin</span>
                      <div className="mono-num font-bold text-amber">{marginPercent}%</div>
                    </div>
                  </div>

                  {/* Ingredients Used in this Item */}
                  <div className="recipe-ingredients-box">
                    <div className="recipe-ing-title">Ingredients Used Per Order:</div>
                    <div className="recipe-ing-list">
                      {menuItem.recipe && menuItem.recipe.map((r, idx) => {
                        const ing = ingredientsMap[r.ingredientId];
                        const ingCost = ing ? (ing.unitCost * r.amount) : 0;
                        return (
                          <div key={idx} className="recipe-ing-line">
                            <span className="recipe-ing-bullet">•</span>
                            <span className="recipe-ing-name">{ing ? ing.name : r.ingredientId}</span>
                            <span className="recipe-ing-qty mono-num">{r.amount} {ing ? ing.unit : ''}</span>
                            <span className="recipe-ing-cost mono-num text-dim">({formatCurrency(ingCost)})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: STOCK IN / RESTOCK */}
      {restockModalItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header flex-align-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-card-border)' }}>
              <div>
                <h3 className="font-bold text-lg text-white">Receive Stock Delivery</h3>
                <p className="text-dim text-xs">{restockModalItem.name}</p>
              </div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setRestockModalItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }} className="space-y-4">
              <div className="current-stock-callout luxe-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.3)' }}>
                <span className="text-muted text-xs">Current Stock On Hand:</span>
                <div className="mono-num font-bold text-xl text-white">
                  {restockModalItem.currentStock} {restockModalItem.unit}
                </div>
                <div className="text-xs text-dim">Target Safe Stock: {restockModalItem.targetStock} {restockModalItem.unit}</div>
              </div>

              <div>
                <label className="input-label">Quantity to Add ({restockModalItem.unit})</label>
                <input 
                  type="number" 
                  className="input-control font-bold mono-num text-lg"
                  placeholder="e.g. 24"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label">Total Purchase Cost Paid (₱)</label>
                <input 
                  type="number" 
                  className="input-control mono-num font-bold"
                  placeholder="0.00"
                  value={restockCost}
                  onChange={(e) => setRestockCost(e.target.value)}
                />
                <span className="text-dim text-xs">Package estimate: {restockModalItem.packageUnit} @ {formatCurrency(restockModalItem.packageCost)}</span>
              </div>

              <div className="checkbox-row flex-align-center gap-2" style={{ paddingTop: '8px' }}>
                <input 
                  type="checkbox" 
                  id="chkAutoExpense"
                  checked={autoLogExpense}
                  onChange={(e) => setAutoLogExpense(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="chkAutoExpense" className="text-sm text-white" style={{ cursor: 'pointer' }}>
                  Auto-record this purchase in <strong>Expenses Tracker</strong> (Cash from Drawer)
                </label>
              </div>
            </div>

            <div className="modal-footer flex-align-center justify-end gap-2" style={{ padding: '16px 20px', borderTop: '1px solid var(--bg-card-border)' }}>
              <button className="btn btn-secondary" onClick={() => setRestockModalItem(null)}>
                Cancel
              </button>
              <button className="btn btn-emerald" onClick={handleConfirmRestock}>
                <PlusCircle size={16} /> Confirm Stock In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW INGREDIENT */}
      {newIngredientModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header flex-align-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-card-border)' }}>
              <h3 className="font-bold text-lg text-white">Add New Ingredient or Supply</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setNewIngredientModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }} className="space-y-4">
              <div>
                <label className="input-label">Ingredient / Supply Name</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="e.g. Mayonnaise Standard, Bacon Strips, Straws"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Category</label>
                  <select 
                    className="input-control" 
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value)}
                  >
                    <option value="Breads & Buns">Breads & Buns</option>
                    <option value="Meats & Proteins">Meats & Proteins</option>
                    <option value="Coffee Jelly & Drinks">Coffee Jelly & Drinks</option>
                    <option value="Sauces & Condiments">Sauces & Condiments</option>
                    <option value="Packaging & Disposables">Packaging & Disposables</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Unit of Measure</label>
                  <select 
                    className="input-control" 
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value)}
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="grams">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="packs">Packs</option>
                    <option value="portion">Portion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="input-label">Starting Stock</label>
                  <input 
                    type="number" 
                    className="input-control mono-num"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Min Alert Buffer</label>
                  <input 
                    type="number" 
                    className="input-control mono-num"
                    value={newIngMin}
                    onChange={(e) => setNewIngMin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Target Ideal Stock</label>
                  <input 
                    type="number" 
                    className="input-control mono-num"
                    value={newIngTarget}
                    onChange={(e) => setNewIngTarget(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Unit Cost (₱ per {newIngUnit})</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-control mono-num"
                    value={newIngUnitCost}
                    onChange={(e) => setNewIngUnitCost(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Package Description</label>
                  <input 
                    type="text" 
                    className="input-control" 
                    placeholder="e.g. Pack of 12 pcs"
                    value={newIngPackUnit}
                    onChange={(e) => setNewIngPackUnit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Supplier / Store Source</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="e.g. Puregold, Sunshine Bakery, Market Stall"
                  value={newIngSupplier}
                  onChange={(e) => setNewIngSupplier(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer flex-align-center justify-end gap-2" style={{ padding: '16px 20px', borderTop: '1px solid var(--bg-card-border)' }}>
              <button className="btn btn-secondary" onClick={() => setNewIngredientModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateIngredient}>
                Save Ingredient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
