import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Calendar,
  Layers,
  ArrowRight,
  Receipt,
  Eye
} from 'lucide-react';
import { 
  reconcileCashDrawer, 
  calculateTheoreticalIngredientUsage, 
  formatCurrency 
} from '../utils/calculations';

export function TallyView({ 
  orders, 
  expenses, 
  ingredients, 
  menuItems, 
  storeSettings,
  onViewReceipt 
}) {
  const [selectedDateFilter, setSelectedDateFilter] = useState('today'); // 'today', 'yesterday', 'all'
  const [actualCashInput, setActualCashInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Filter orders and expenses based on selected date
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = new Date(o.timestamp).toISOString().slice(0, 10);
      if (selectedDateFilter === 'today') return orderDate === todayStr;
      if (selectedDateFilter === 'yesterday') return orderDate === yesterdayStr;
      return true;
    });
  }, [orders, selectedDateFilter, todayStr, yesterdayStr]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (selectedDateFilter === 'today') return e.date === todayStr;
      if (selectedDateFilter === 'yesterday') return e.date === yesterdayStr;
      return true;
    });
  }, [expenses, selectedDateFilter, todayStr, yesterdayStr]);

  // Ingredients and menu maps
  const ingredientsMap = useMemo(() => {
    const map = {};
    ingredients.forEach(i => { map[i.id] = i; });
    return map;
  }, [ingredients]);

  const menuItemsMap = useMemo(() => {
    const map = {};
    menuItems.forEach(m => { map[m.id] = m; });
    return map;
  }, [menuItems]);

  // Perform Financial and Cash Drawer Reconciliation
  const reconciliation = useMemo(() => {
    return reconcileCashDrawer({
      openingFloat: storeSettings.openingCashFloat || 1000.00,
      orders: filteredOrders,
      expenses: filteredExpenses,
      actualCashCounted: actualCashInput
    });
  }, [filteredOrders, filteredExpenses, storeSettings, actualCashInput]);

  // Theoretical Ingredient Usage for the filtered orders
  const ingredientUsages = useMemo(() => {
    return calculateTheoreticalIngredientUsage(filteredOrders, menuItemsMap, ingredientsMap);
  }, [filteredOrders, menuItemsMap, ingredientsMap]);

  const totalFoodCostCOGS = ingredientUsages.reduce((sum, u) => sum + u.totalCost, 0);

  return (
    <div className="tally-container">
      {/* Top Controls: Filter by Date & Print */}
      <div className="luxe-card tally-header-banner mb-4 no-print flex-align-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex-align-center gap-2">
            <BarChart3 className="text-amber" size={24} />
            <h2 className="text-xl font-bold text-white">Daily Sales & Inventory Tally</h2>
          </div>
          <p className="text-muted text-sm mt-0.5">
            Reconcile daily cash register drawer, tally ingredients sold vs recipe formulas, and audit store net profit.
          </p>
        </div>

        <div className="flex-align-center gap-2">
          <div className="pos-category-pills" style={{ margin: 0 }}>
            <button 
              className={`category-pill ${selectedDateFilter === 'today' ? 'active' : ''}`}
              onClick={() => setSelectedDateFilter('today')}
            >
              Today ({todayStr})
            </button>
            <button 
              className={`category-pill ${selectedDateFilter === 'yesterday' ? 'active' : ''}`}
              onClick={() => setSelectedDateFilter('yesterday')}
            >
              Yesterday
            </button>
            <button 
              className={`category-pill ${selectedDateFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedDateFilter('all')}
            >
              All Time ({orders.length} orders)
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => window.print()} title="Print Tally Report">
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL OVERVIEW KPI CARDS */}
      <div className="inventory-kpi-grid mb-4">
        <div className="luxe-card kpi-card">
          <span className="kpi-card-label">Gross Revenue</span>
          <div className="kpi-card-value text-emerald mono-num">{formatCurrency(reconciliation.totalGrossSales)}</div>
          <div className="text-xs text-dim mt-1">
            Cash: {formatCurrency(reconciliation.cashSales)} • GCash: {formatCurrency(reconciliation.gcashSales)}
          </div>
        </div>

        <div className="luxe-card kpi-card">
          <span className="kpi-card-label">Food Cost (COGS)</span>
          <div className="kpi-card-value text-amber mono-num">{formatCurrency(totalFoodCostCOGS)}</div>
          <div className="text-xs text-dim mt-1">
            Ingredients consumed from sold recipes
          </div>
        </div>

        <div className="luxe-card kpi-card">
          <span className="kpi-card-label">Total Expenses</span>
          <div className="kpi-card-value text-danger mono-num">{formatCurrency(reconciliation.totalExpenses)}</div>
          <div className="text-xs text-dim mt-1">
            Paid from Drawer: {formatCurrency(reconciliation.cashExpensesPaid)}
          </div>
        </div>

        <div className="luxe-card kpi-card">
          <span className="kpi-card-label">Store Net Profit</span>
          <div className={`kpi-card-value mono-num ${reconciliation.netStoreProfit >= 0 ? 'text-emerald' : 'text-danger'}`}>
            {formatCurrency(reconciliation.netStoreProfit)}
          </div>
          <div className="text-xs text-dim mt-1">
            Gross Sales minus all store expenses
          </div>
        </div>
      </div>

      {/* SECTION 2: CASH DRAWER RECONCILIATION AUDIT (OVER / SHORT) */}
      <div className="luxe-card mb-4 drawer-audit-card">
        <div className="flex-align-center justify-between pb-3 mb-4 border-b border-card">
          <div className="flex-align-center gap-2">
            <Scale className="text-primary" size={22} />
            <h3 className="font-bold text-lg text-white">Cash Drawer Audit & Balancing</h3>
          </div>
          <span className="badge badge-gold">Closing Audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formula Breakdown */}
          <div className="drawer-breakdown-box space-y-3">
            <div className="flex-align-center justify-between py-1">
              <span className="text-muted">Opening Cash Float (Sukli fund):</span>
              <span className="mono-num font-bold text-white">{formatCurrency(reconciliation.openingFloat)}</span>
            </div>

            <div className="flex-align-center justify-between py-1 text-emerald">
              <span>+ Cash Sales Collected:</span>
              <span className="mono-num font-bold">+{formatCurrency(reconciliation.cashSales)}</span>
            </div>

            <div className="flex-align-center justify-between py-1 text-danger">
              <span>- Cash Expenses Paid from Drawer:</span>
              <span className="mono-num font-bold">-{formatCurrency(reconciliation.cashExpensesPaid)}</span>
            </div>

            <div className="receipt-divider-solid my-2"></div>

            <div className="flex-align-center justify-between py-2 bg-surface-elevated px-3 rounded-lg">
              <span className="font-bold text-white text-base">EXPECTED CASH IN DRAWER:</span>
              <span className="mono-num font-bold text-xl text-primary">{formatCurrency(reconciliation.expectedCashInDrawer)}</span>
            </div>
          </div>

          {/* Actual Count Input & Over/Short Result */}
          <div className="drawer-count-box luxe-card" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <label className="input-label text-white">Enter Actual Physical Cash Counted (₱)</label>
            <div className="flex-align-center gap-2 mt-1">
              <input 
                type="number" 
                step="1"
                className="input-control mono-num font-bold text-2xl text-emerald"
                placeholder="e.g. 1196.00"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
              />
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setActualCashInput(reconciliation.expectedCashInDrawer.toString())}
                title="Set to exact expected amount"
              >
                Auto-Match
              </button>
            </div>

            {/* Over / Short Feedback Banner */}
            {reconciliation.variance !== null && (
              <div className="mt-4">
                {reconciliation.variance === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex-align-center gap-2 text-emerald">
                    <CheckCircle size={20} />
                    <div>
                      <strong className="block text-white">Drawer is Perfectly Balanced!</strong>
                      <span className="text-xs">Physical bills and coins match recorded transactions.</span>
                    </div>
                  </div>
                ) : reconciliation.variance > 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex-align-center gap-2 text-emerald">
                    <TrendingUp size={20} />
                    <div>
                      <strong className="block text-white">Drawer is OVER by +{formatCurrency(reconciliation.variance)}</strong>
                      <span className="text-xs">More cash in drawer than recorded in system (extra tip or unrecorded item).</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex-align-center gap-2 text-danger">
                    <AlertTriangle size={20} />
                    <div>
                      <strong className="block text-white">Drawer is SHORT by {formatCurrency(reconciliation.variance)}</strong>
                      <span className="text-xs">Cash in drawer is less than expected. Check for unrecorded expenses or change errors.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: INGREDIENT CONSUMPTION TALLY (RECIPE VS USAGE) */}
      <div className="luxe-card mb-4">
        <div className="flex-align-center justify-between pb-3 mb-3 border-b border-card">
          <div className="flex-align-center gap-2">
            <Layers className="text-amber" size={20} />
            <h3 className="font-bold text-base text-white">Ingredient Consumption Tally (From Sold Orders)</h3>
          </div>
          <span className="text-dim text-xs mono-num">{ingredientUsages.length} ingredients utilized</span>
        </div>

        {ingredientUsages.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">No orders or recipe usage recorded for this date filter.</p>
        ) : (
          <div className="table-responsive">
            <table className="pos-data-table">
              <thead>
                <tr>
                  <th>INGREDIENT / SUPPLY</th>
                  <th>CONSUMED (RECIPE FORMULA)</th>
                  <th>UNIT COST</th>
                  <th>TOTAL FOOD COST (₱)</th>
                  <th>REMAINING STOCK ON HAND</th>
                </tr>
              </thead>
              <tbody>
                {ingredientUsages.map(usage => {
                  const currentStock = ingredientsMap[usage.ingredientId]?.currentStock ?? 'N/A';
                  return (
                    <tr key={usage.ingredientId}>
                      <td className="font-bold text-white">{usage.ingredientName}</td>
                      <td>
                        <span className="mono-num font-bold text-amber">
                          {usage.theoreticalUsage} {usage.unit}
                        </span>
                      </td>
                      <td className="mono-num text-dim">{formatCurrency(usage.unitCost)}</td>
                      <td className="mono-num font-bold text-white">{formatCurrency(usage.totalCost)}</td>
                      <td>
                        <span className="mono-num text-emerald font-bold">
                          {currentStock} {usage.unit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: TRANSACTIONS LIST FOR THIS PERIOD */}
      <div className="luxe-card">
        <div className="flex-align-center justify-between pb-3 mb-3 border-b border-card">
          <div className="flex-align-center gap-2">
            <Receipt className="text-primary" size={20} />
            <h3 className="font-bold text-base text-white">Orders Log ({filteredOrders.length})</h3>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">No transactions recorded for this period.</p>
        ) : (
          <div className="table-responsive">
            <table className="pos-data-table">
              <thead>
                <tr>
                  <th>ORDER #</th>
                  <th>TIME</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>PAYMENT</th>
                  <th>TOTAL</th>
                  <th style={{ textAlign: 'right' }}>RECEIPT</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="mono-num font-bold text-white">{order.id}</td>
                    <td className="text-dim text-xs mono-num">
                      {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{order.customerName || 'Walk-in'}</td>
                    <td className="text-xs">
                      {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td>
                      <span className={`badge ${order.paymentMethod === 'Cash' ? 'badge-green' : order.paymentMethod === 'Credit/Utang' ? 'badge-red' : 'badge-blue'}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="mono-num font-bold text-emerald">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewReceipt(order)}
                        title="View & print receipt slip"
                      >
                        <Eye size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
