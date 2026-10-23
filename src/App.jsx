import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_EXPENSES, 
  INITIAL_ORDERS, 
  INITIAL_STORE_SETTINGS 
} from './data/initialData';
import { 
  loadStoredData, 
  saveStoredData, 
  STORAGE_KEYS 
} from './utils/storage';
import { deductIngredientsForOrder, reconcileCashDrawer } from './utils/calculations';
import { getSupabase, fetchAllFromSupabase } from './utils/supabase';

// Components
import { Header } from './components/Header';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { WhatToBuyView } from './components/WhatToBuyView';
import { ExpensesView } from './components/ExpensesView';
import { TallyView } from './components/TallyView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';

import './App.css';

export function App() {
  const [dbConnected, setDbConnected] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // State with LocalStorage Persistence + DB Hydration
  const [ingredients, setIngredients] = useState(() => 
    loadStoredData(STORAGE_KEYS.INGREDIENTS, INITIAL_INGREDIENTS)
  );

  const [menuItems, setMenuItems] = useState(() => 
    loadStoredData(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS)
  );

  const [orders, setOrders] = useState(() => 
    loadStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );

  const [expenses, setExpenses] = useState(() => 
    loadStoredData(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES)
  );

  const [storeSettings, setStoreSettings] = useState(() => 
    loadStoredData(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS)
  );

  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'inventory', 'reorder', 'expenses', 'tally', 'settings'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);

  // Load from Supabase Cloud or Local SQLite Database
  const loadDatabaseData = useCallback(async () => {
    // 1. Try Supabase Cloud Database first
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const sbData = await fetchAllFromSupabase(supabaseClient);
        if (sbData && sbData.success) {
          setSupabaseConnected(true);
          if (sbData.ingredients && sbData.ingredients.length > 0) setIngredients(sbData.ingredients);
          if (sbData.menuItems && sbData.menuItems.length > 0) setMenuItems(sbData.menuItems);
          if (sbData.orders) setOrders(sbData.orders);
          if (sbData.expenses) setExpenses(sbData.expenses);
          if (sbData.storeSettings && Object.keys(sbData.storeSettings).length > 0) setStoreSettings(sbData.storeSettings);
          console.log('⚡ Loaded data directly from Supabase Cloud Database!');
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to SQLite/Local:', err);
      }
    }

    // 2. Fallback to Local SQLite Server
    try {
      const res = await fetch('/api/all');
      const data = await res.json();
      if (data && data.success) {
        setDbConnected(true);
        if (data.ingredients && data.ingredients.length > 0) setIngredients(data.ingredients);
        if (data.menuItems && data.menuItems.length > 0) setMenuItems(data.menuItems);
        if (data.orders) setOrders(data.orders);
        if (data.expenses) setExpenses(data.expenses);
        if (data.storeSettings && Object.keys(data.storeSettings).length > 0) setStoreSettings(data.storeSettings);
        console.log('✅ SQLite Database Connected and loaded successfully!');
      }
    } catch {
      console.log('ℹ️ Running in Offline Local Storage Mode');
      setDbConnected(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Sync to localStorage as offline safety backup
  useEffect(() => { saveStoredData(STORAGE_KEYS.INGREDIENTS, ingredients); }, [ingredients]);
  useEffect(() => { saveStoredData(STORAGE_KEYS.MENU_ITEMS, menuItems); }, [menuItems]);
  useEffect(() => { saveStoredData(STORAGE_KEYS.ORDERS, orders); }, [orders]);
  useEffect(() => { saveStoredData(STORAGE_KEYS.EXPENSES, expenses); }, [expenses]);
  useEffect(() => { saveStoredData(STORAGE_KEYS.SETTINGS, storeSettings); }, [storeSettings]);

  // Menu items map
  const menuItemsMap = useMemo(() => {
    const map = {};
    menuItems.forEach(m => { map[m.id] = m; });
    return map;
  }, [menuItems]);

  // Live KPI calculation for Header
  const headerStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayOrders = orders.filter(o => 
      new Date(o.timestamp).toISOString().slice(0, 10) === todayStr && o.status !== 'Cancelled'
    );
    const todayExpenses = expenses.filter(e => e.date === todayStr);

    const todaySales = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const todayNetProfit = todaySales - todayExpensesTotal;

    const lowStockCount = ingredients.filter(i => i.currentStock <= i.minStockThreshold).length;
    const urgentToBuyCount = ingredients.filter(i => i.currentStock <= i.minStockThreshold).length;

    // Expected Cash In Drawer
    const reconciliation = reconcileCashDrawer({
      openingFloat: storeSettings.openingCashFloat || 1000.00,
      orders: todayOrders,
      expenses: todayExpenses,
      actualCashCounted: null
    });

    return {
      todaySales,
      todayNetProfit,
      expectedCashInDrawer: reconciliation.expectedCashInDrawer,
      lowStockCount,
      urgentToBuyCount,
      dbConnected,
      supabaseConnected
    };
  }, [orders, expenses, ingredients, storeSettings, dbConnected, supabaseConnected]);

  // Handle Order Checkout Completion
  const handleCompleteOrder = async (newOrder) => {
    // 1. Deduct ingredients locally based on recipe
    const { updatedIngredients } = deductIngredientsForOrder(
      newOrder.items,
      menuItemsMap,
      ingredients
    );

    setIngredients(updatedIngredients);

    // 2. Add to orders
    setOrders(prev => [newOrder, ...prev]);

    // 3. Open receipt modal
    setActiveReceiptOrder(newOrder);

    // 4. Persist to Supabase if connected
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        await supabaseClient.from('orders').insert({
          id: newOrder.id,
          timestamp: newOrder.timestamp,
          customer_name: newOrder.customerName,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount || 0,
          total_amount: newOrder.totalAmount,
          payment_method: newOrder.paymentMethod,
          cash_received: newOrder.cashReceived,
          change_given: newOrder.changeGiven,
          ref_number: newOrder.refNumber,
          status: newOrder.status,
          items: newOrder.items
        });

        // Update each deducted ingredient in Supabase
        for (const ing of updatedIngredients) {
          await supabaseClient
            .from('ingredients')
            .update({ current_stock: ing.currentStock })
            .eq('id', ing.id);
        }
      } catch (err) {
        console.warn('Supabase order insert error:', err);
      }
    }

    // 5. Also persist to SQLite backend
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch {
      // ignore
    }
  };

  // Add Expense from Restock or Expenses tab
  const handleAddExpenseFromRestock = async (expensePayload) => {
    const newExp = {
      id: `exp_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      title: expensePayload.title,
      amount: expensePayload.amount,
      category: expensePayload.category || "Ingredients & Groceries",
      paymentMethod: expensePayload.paymentMethod || "Cash from Drawer",
      receiptNo: "RESTOCK",
      notes: expensePayload.notes || "Auto-logged from inventory restock"
    };
    setExpenses(prev => [newExp, ...prev]);

    // Persist to Supabase
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        await supabaseClient.from('expenses').insert({
          id: newExp.id,
          date: newExp.date,
          title: newExp.title,
          category: newExp.category,
          amount: newExp.amount,
          payment_method: newExp.paymentMethod,
          receipt_no: newExp.receiptNo,
          notes: newExp.notes
        });
      } catch (err) {
        console.warn('Supabase expense error:', err);
      }
    }

    // Persist to SQLite Database
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp)
      });
    } catch {
      // ignore
    }
  };

  // Reset to Sample Starter Data
  const handleResetStarterData = async () => {
    if (confirm('Are you sure you want to reset all store data to Kieran & Kyr\'s Merienda menu flyer state?')) {
      setIngredients(INITIAL_INGREDIENTS);
      setMenuItems(INITIAL_MENU_ITEMS);
      setExpenses(INITIAL_EXPENSES);
      setOrders(INITIAL_ORDERS);
      setStoreSettings(INITIAL_STORE_SETTINGS);

      try {
        await fetch('/api/reset', { method: 'POST' });
      } catch {
        // ignore
      }
      alert('Store data reset to official Kieran & Kyr\'s Merienda flyer products!');
    }
  };

  // Restore from Uploaded Backup
  const handleRestoreBackupData = (backupData) => {
    if (backupData.ingredients) setIngredients(backupData.ingredients);
    if (backupData.menuItems) setMenuItems(backupData.menuItems);
    if (backupData.expenses) setExpenses(backupData.expenses);
    if (backupData.orders) setOrders(backupData.orders);
    if (backupData.storeSettings) setStoreSettings(backupData.storeSettings);
  };

  return (
    <div className="app-layout">
      {/* Top Header & Navigation */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={headerStats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        storeSettings={storeSettings}
      />

      {/* Main View Area */}
      <main className="main-viewport">
        {activeTab === 'pos' && (
          <POSView 
            menuItems={menuItems}
            ingredients={ingredients}
            onCompleteOrder={handleCompleteOrder}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView 
            ingredients={ingredients}
            setIngredients={setIngredients}
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            onAddExpenseFromRestock={handleAddExpenseFromRestock}
          />
        )}

        {activeTab === 'reorder' && (
          <WhatToBuyView 
            ingredients={ingredients}
            setIngredients={setIngredients}
            storeSettings={storeSettings}
            onAddExpenseFromRestock={handleAddExpenseFromRestock}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView 
            expenses={expenses}
            setExpenses={setExpenses}
          />
        )}

        {activeTab === 'tally' && (
          <TallyView 
            orders={orders}
            expenses={expenses}
            ingredients={ingredients}
            menuItems={menuItems}
            storeSettings={storeSettings}
            onViewReceipt={(order) => setActiveReceiptOrder(order)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            storeSettings={storeSettings}
            setStoreSettings={setStoreSettings}
            allDatabaseData={{
              ingredients,
              menuItems,
              orders,
              expenses,
              storeSettings
            }}
            onResetData={handleResetStarterData}
            onRestoreData={handleRestoreBackupData}
            onSupabaseConnected={loadDatabaseData}
          />
        )}
      </main>

      {/* Thermal Receipt Modal */}
      {activeReceiptOrder && (
        <ReceiptModal 
          order={activeReceiptOrder}
          storeSettings={storeSettings}
          onClose={() => setActiveReceiptOrder(null)}
        />
      )}
    </div>
  );
}

export default App;
