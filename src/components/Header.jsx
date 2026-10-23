import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  ShoppingBag, 
  Receipt, 
  BarChart3, 
  Settings, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Flame,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

export function Header({ 
  activeTab, 
  setActiveTab, 
  stats, 
  soundEnabled, 
  setSoundEnabled, 
  storeSettings 
}) {
  const tabs = [
    { id: 'pos', label: 'Cashier POS', icon: ShoppingCart, badge: null },
    { id: 'inventory', label: 'Ingredients & Recipes', icon: Package, badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Low` : null, badgeColor: 'gold' },
    { id: 'reorder', label: 'What to Buy', icon: ShoppingBag, badge: stats.urgentToBuyCount > 0 ? `${stats.urgentToBuyCount} Needs Buy` : null, badgeColor: 'red' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: null },
    { id: 'tally', label: 'Daily Tally & Audit', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings & GitHub', icon: Settings, badge: null }
  ];

  return (
    <header className="header-container no-print">
      {/* Top Banner with Store Branding and Quick Financial KPI Bar */}
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-logo-badge">
            <span className="brand-emoji">🍔🌭🧋</span>
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-name">{storeSettings.storeName || "Kieran & Kyr's Merienda"}</h1>
              <span className={`badge ${stats.dbConnected ? 'badge-green' : 'badge-gold'}`}>
                {stats.dbConnected ? '🟢 SQLite Database' : '💾 Local DB'}
              </span>
            </div>
            <p className="brand-tagline">{storeSettings.tagline || "Good Food • Good Mood • Always a Merienda Time!"}</p>
          </div>
        </div>

        {/* Live Status KPI Badges */}
        <div className="header-kpi-group">
          {/* Today's Sales */}
          <div className="kpi-pill">
            <span className="kpi-label">Today's Sales</span>
            <span className="kpi-value text-emerald mono-num">{formatCurrency(stats.todaySales)}</span>
          </div>

          {/* Today's Net Profit */}
          <div className="kpi-pill">
            <span className="kpi-label">Net Profit</span>
            <span className={`kpi-value mono-num ${stats.todayNetProfit >= 0 ? 'text-emerald' : 'text-danger'}`}>
              {formatCurrency(stats.todayNetProfit)}
            </span>
          </div>

          {/* Cash Drawer Float */}
          <div className="kpi-pill">
            <span className="kpi-label"><Wallet size={12} style={{ display: 'inline', marginRight: 4 }} />Drawer Cash</span>
            <span className="kpi-value mono-num">{formatCurrency(stats.expectedCashInDrawer)}</span>
          </div>

          {/* Low Stock Warning */}
          {stats.lowStockCount > 0 && (
            <div 
              className="kpi-pill kpi-pill-alert pulse-badge" 
              onClick={() => setActiveTab('reorder')}
              title="Click to view What to Buy list"
            >
              <AlertTriangle size={14} className="text-amber" />
              <div>
                <span className="kpi-alert-text">{stats.lowStockCount} Low Stock</span>
              </div>
            </div>
          )}

          {/* Sound Toggle */}
          <button 
            className="btn btn-secondary btn-icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={18} className="text-amber" /> : <VolumeX size={18} className="text-dim" />}
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <nav className="nav-tabs-wrapper">
        <div className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} className={isActive ? 'tab-icon-active' : 'tab-icon'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`badge badge-${tab.badgeColor} tab-badge`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
