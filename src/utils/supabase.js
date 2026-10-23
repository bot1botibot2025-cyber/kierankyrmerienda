import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_STORE_SETTINGS, 
  INITIAL_INGREDIENTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_EXPENSES 
} from '../data/initialData';

const STORAGE_SUPABASE_CONFIG_KEY = 'kks_supabase_credentials_v1';

// Get current Supabase credentials (from LocalStorage or Vite .env)
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const stored = localStorage.getItem(STORAGE_SUPABASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim(), source: 'custom' };
      }
    }
  } catch {
    // ignore
  }

  return {
    url: envUrl.trim(),
    anonKey: envKey.trim(),
    source: envUrl ? 'env' : 'none'
  };
}

// Save Supabase credentials to LocalStorage
export function saveSupabaseCredentials(url, anonKey) {
  try {
    if (!url || !anonKey) {
      localStorage.removeItem(STORAGE_SUPABASE_CONFIG_KEY);
      return false;
    }
    localStorage.setItem(STORAGE_SUPABASE_CONFIG_KEY, JSON.stringify({
      url: url.trim(),
      anonKey: anonKey.trim()
    }));
    return true;
  } catch {
    return false;
  }
}

// Instantiate Supabase Client
let cachedClient = null;
let lastUsedKey = '';

export function getSupabase() {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  const cacheKey = `${url}___${anonKey}`;
  if (cachedClient && lastUsedKey === cacheKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: false }
    });
    lastUsedKey = cacheKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

// Test Connection
export async function testSupabaseConnection(url, anonKey) {
  try {
    const testClient = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false }
    });

    // Try a simple select from products or store_settings
    const { data, error } = await testClient
      .from('store_settings')
      .select('*')
      .limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Successfully connected to Supabase Database!' };
  } catch (err) {
    return { success: false, error: err.message || 'Connection failed' };
  }
}

// Fetch all data from Supabase Cloud Database
export async function fetchAllFromSupabase(client) {
  if (!client) return null;

  try {
    const [prodsRes, ingsRes, ordersRes, expensesRes, settingsRes] = await Promise.all([
      client.from('products').select('*'),
      client.from('ingredients').select('*'),
      client.from('orders').select('*').order('timestamp', { ascending: false }),
      client.from('expenses').select('*').order('date', { ascending: false }),
      client.from('store_settings').select('*')
    ]);

    if (prodsRes.error || ingsRes.error) {
      throw new Error(prodsRes.error?.message || ingsRes.error?.message);
    }

    // Format settings map
    const storeSettings = {};
    if (settingsRes.data) {
      settingsRes.data.forEach(row => {
        storeSettings[row.key] = row.value;
      });
    }

    // Format ingredients
    const ingredients = (ingsRes.data || []).map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      unit: i.unit,
      currentStock: Number(i.current_stock) || 0,
      minStockThreshold: Number(i.min_stock_threshold) || 0,
      targetStock: Number(i.target_stock) || 0,
      unitCost: Number(i.unit_cost) || 0,
      packageUnit: i.package_unit,
      packageCost: Number(i.package_cost) || 0,
      supplier: i.supplier
    }));

    // Format products
    const menuItems = (prodsRes.data || []).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price) || 0,
      emoji: p.emoji,
      badge: p.badge,
      description: p.description,
      recipe: Array.isArray(p.recipe) ? p.recipe : JSON.parse(p.recipe || '[]')
    }));

    return {
      success: true,
      ingredients,
      menuItems,
      orders: ordersRes.data || [],
      expenses: expensesRes.data || [],
      storeSettings
    };
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return null;
  }
}

// 1-Click Seed Initial Menu Data to Supabase
export async function seedSupabaseDatabase(client) {
  if (!client) throw new Error('Supabase client not initialized');

  // 1. Settings
  const settingsRows = Object.entries(INITIAL_STORE_SETTINGS).map(([key, value]) => ({
    key,
    value
  }));
  await client.from('store_settings').upsert(settingsRows);

  // 2. Ingredients
  const ingRows = INITIAL_INGREDIENTS.map(i => ({
    id: i.id,
    name: i.name,
    category: i.category,
    unit: i.unit,
    current_stock: i.currentStock,
    min_stock_threshold: i.minStockThreshold,
    target_stock: i.targetStock,
    unit_cost: i.unitCost,
    package_unit: i.packageUnit,
    package_cost: i.packageCost,
    supplier: i.supplier
  }));
  await client.from('ingredients').upsert(ingRows);

  // 3. Products
  const prodRows = INITIAL_MENU_ITEMS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    emoji: p.emoji,
    badge: p.badge,
    description: p.description,
    recipe: p.recipe
  }));
  await client.from('products').upsert(prodRows);

  // 4. Initial Expenses
  const expRows = INITIAL_EXPENSES.map(e => ({
    id: e.id,
    date: e.date,
    title: e.title,
    category: e.category,
    amount: e.amount,
    payment_method: e.paymentMethod,
    receipt_no: e.receiptNo,
    notes: e.notes
  }));
  await client.from('expenses').upsert(expRows);

  return true;
}
