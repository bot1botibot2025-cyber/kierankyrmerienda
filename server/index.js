import express from 'express';
import cors from 'cors';
import db, { initDatabase, seedDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite schema
initDatabase();

// 1. Health & Database Status
app.get('/api/status', (req, res) => {
  try {
    const counts = {
      products: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
      ingredients: db.prepare('SELECT COUNT(*) as count FROM ingredients').get().count,
      orders: db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
      expenses: db.prepare('SELECT COUNT(*) as count FROM expenses').get().count,
    };
    res.json({
      status: 'connected',
      engine: 'SQLite (better-sqlite3)',
      databaseFile: 'data/merienda.db',
      counts
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 2. Fetch All Store Data in one go
app.get('/api/all', (req, res) => {
  try {
    // Ingredients
    const rawIngs = db.prepare('SELECT * FROM ingredients').all();
    const ingredients = rawIngs.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      unit: i.unit,
      currentStock: i.current_stock,
      minStockThreshold: i.min_stock_threshold,
      targetStock: i.target_stock,
      unitCost: i.unit_cost,
      packageUnit: i.package_unit,
      packageCost: i.package_cost,
      supplier: i.supplier
    }));

    // Products
    const rawProds = db.prepare('SELECT * FROM products').all();
    const menuItems = rawProds.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      emoji: p.emoji,
      badge: p.badge,
      description: p.description,
      recipe: JSON.parse(p.recipe_json || '[]')
    }));

    // Orders
    const rawOrders = db.prepare('SELECT * FROM orders ORDER BY timestamp DESC').all();
    const orders = rawOrders.map(o => ({
      id: o.id,
      timestamp: o.timestamp,
      customerName: o.customer_name,
      subtotal: o.subtotal,
      discount: o.discount,
      totalAmount: o.total_amount,
      paymentMethod: o.payment_method,
      cashReceived: o.cash_received,
      changeGiven: o.change_given,
      refNumber: o.ref_number,
      status: o.status,
      items: JSON.parse(o.items_json || '[]')
    }));

    // Expenses
    const rawExpenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
    const expenses = rawExpenses.map(e => ({
      id: e.id,
      date: e.date,
      title: e.title,
      category: e.category,
      amount: e.amount,
      paymentMethod: e.payment_method,
      receiptNo: e.receipt_no,
      notes: e.notes
    }));

    // Settings
    const rawSettings = db.prepare('SELECT * FROM store_settings').all();
    const storeSettings = {};
    for (const row of rawSettings) {
      try {
        storeSettings[row.key] = JSON.parse(row.value);
      } catch {
        storeSettings[row.key] = row.value;
      }
    }

    res.json({
      success: true,
      ingredients,
      menuItems,
      orders,
      expenses,
      storeSettings
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Complete Order & Atomically Deduct Ingredients in SQLite
app.post('/api/orders', (req, res) => {
  const order = req.body;
  if (!order || !order.id || !order.items) {
    return res.status(400).json({ success: false, error: 'Invalid order payload' });
  }

  const orderTransaction = db.transaction(() => {
    // Insert order
    db.prepare(`
      INSERT INTO orders (
        id, timestamp, customer_name, subtotal, discount, total_amount, 
        payment_method, cash_received, change_given, ref_number, status, items_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order.id,
      order.timestamp || new Date().toISOString(),
      order.customerName || 'Walk-in',
      order.subtotal,
      order.discount || 0,
      order.totalAmount,
      order.paymentMethod,
      order.cashReceived || null,
      order.changeGiven || null,
      order.refNumber || null,
      order.status || 'Completed',
      JSON.stringify(order.items || [])
    );

    // Fetch products to look up recipes
    const productsMap = {};
    const prods = db.prepare('SELECT id, recipe_json FROM products').all();
    prods.forEach(p => {
      productsMap[p.id] = JSON.parse(p.recipe_json || '[]');
    });

    // Deduct stock for each recipe ingredient
    const updateStockStmt = db.prepare(`
      UPDATE ingredients 
      SET current_stock = MAX(0, current_stock - ?)
      WHERE id = ?
    `);

    for (const item of order.items) {
      const recipe = productsMap[item.menuItemId];
      if (recipe && Array.isArray(recipe)) {
        for (const part of recipe) {
          const totalQty = part.amount * item.quantity;
          updateStockStmt.run(totalQty, part.ingredientId);
        }
      }
    }
  });

  try {
    orderTransaction();
    res.json({ success: true, message: 'Order recorded and inventory deducted in SQLite database' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Log Expense
app.post('/api/expenses', (req, res) => {
  const exp = req.body;
  try {
    db.prepare(`
      INSERT INTO expenses (id, date, title, category, amount, payment_method, receipt_no, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      exp.id || `exp_${Date.now()}`,
      exp.date || new Date().toISOString().slice(0, 10),
      exp.title,
      exp.category,
      exp.amount,
      exp.paymentMethod || 'Cash from Drawer',
      exp.receiptNo || 'N/A',
      exp.notes || ''
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Expense
app.delete('/api/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Restock / Stock-In Ingredient
app.post('/api/ingredients/restock', (req, res) => {
  const { ingredientId, quantityAdded } = req.body;
  try {
    db.prepare(`
      UPDATE ingredients 
      SET current_stock = current_stock + ? 
      WHERE id = ?
    `).run(quantityAdded, ingredientId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Adjust Physical Count
app.post('/api/ingredients/adjust', (req, res) => {
  const { ingredientId, newCount } = req.body;
  try {
    db.prepare(`
      UPDATE ingredients 
      SET current_stock = ? 
      WHERE id = ?
    `).run(newCount, ingredientId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Save Store Settings
app.post('/api/settings', (req, res) => {
  const settings = req.body;
  const updateStmt = db.prepare(`
    INSERT INTO store_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  try {
    for (const [k, v] of Object.entries(settings)) {
      updateStmt.run(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Reset Starter Database
app.post('/api/reset', (req, res) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset to Kieran & Kyr\'s Merienda starter data' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Kieran & Kyr's Merienda Database Server running on http://localhost:${PORT}`);
});
