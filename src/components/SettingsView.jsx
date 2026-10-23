import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  Download, 
  Upload, 
  RotateCcw, 
  Copy, 
  Check, 
  Key, 
  Globe, 
  UserPlus, 
  Terminal, 
  ShieldCheck, 
  Save,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  FileCode,
  RefreshCw
} from 'lucide-react';

function GithubIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

import { exportDatabaseBackup } from '../utils/storage';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  getSupabase, 
  seedSupabaseDatabase 
} from '../utils/supabase';

export function SettingsView({ 
  storeSettings, 
  setStoreSettings, 
  allDatabaseData, 
  onResetData, 
  onRestoreData,
  onSupabaseConnected
}) {
  const [formData, setFormData] = useState({ ...storeSettings });
  const [copiedKey, setCopiedKey] = useState(null);

  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseTestStatus, setSupabaseTestStatus] = useState(null); // { loading, success, message }
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds.url) setSupabaseUrl(creds.url);
    if (creds.anonKey) setSupabaseKey(creds.anonKey);
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setStoreSettings(formData);
    alert('Store settings saved successfully!');
  };

  // Test & Save Supabase
  const handleTestAndSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Please enter both Supabase Project URL and Public Anon Key.');
      return;
    }

    setSupabaseTestStatus({ loading: true });
    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    
    if (result.success) {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      setSupabaseTestStatus({
        loading: false,
        success: true,
        message: 'Connected to Supabase! Tables verified and active.'
      });
      if (onSupabaseConnected) onSupabaseConnected();
    } else {
      setSupabaseTestStatus({
        loading: false,
        success: false,
        message: `Connection failed: ${result.error}. (Tip: make sure you ran the SQL Schema script below in your Supabase SQL Editor!)`
      });
    }
  };

  // 1-Click Seed Cloud Database
  const handleSeedCloudDatabase = async () => {
    const client = getSupabase();
    if (!client) {
      alert('Please connect to Supabase first before uploading seed data.');
      return;
    }

    if (!confirm('Upload all 21 Kieran & Kyr\'s Merienda menu items, recipes, and 36 ingredients to your Supabase Cloud Database?')) return;

    try {
      setSupabaseTestStatus({ loading: true, message: 'Uploading menu products to Supabase...' });
      await seedSupabaseDatabase(client);
      setSupabaseTestStatus({ loading: false, success: true, message: '🎉 All products and ingredients uploaded to Supabase Cloud!' });
      alert('Successfully uploaded Kieran & Kyr\'s Merienda menu to your Supabase Cloud database!');
    } catch (err) {
      setSupabaseTestStatus({ loading: false, success: false, message: `Upload error: ${err.message}` });
      alert(`Error uploading: ${err.message}`);
    }
  };

  const handleExportBackup = () => {
    exportDatabaseBackup(allDatabaseData);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.data) {
          onRestoreData(parsed.data);
          alert('Database restored successfully from backup file!');
        } else {
          alert('Invalid backup file format');
        }
      } catch {
        alert('Error parsing backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  const sqlSchemaText = `-- Copy this SQL and paste into Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  emoji TEXT,
  badge TEXT,
  description TEXT,
  recipe JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  min_stock_threshold NUMERIC NOT NULL DEFAULT 0,
  target_stock NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  package_unit TEXT,
  package_cost NUMERIC DEFAULT 0,
  supplier TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  cash_received NUMERIC,
  change_given NUMERIC,
  ref_number TEXT,
  status TEXT NOT NULL DEFAULT 'Completed',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  receipt_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);`;

  return (
    <div className="settings-container space-y-6">
      {/* SECTION 1: SUPABASE CLOUD DATABASE CONFIGURATION */}
      <div className="luxe-card supabase-config-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div className="flex-align-center justify-between pb-3 mb-4 border-b border-card">
          <div className="flex-align-center gap-3">
            <div className="p-2 rounded-lg bg-emerald/20 text-emerald">
              <Cloud size={24} />
            </div>
            <div>
              <div className="flex-align-center gap-2">
                <h2 className="text-xl font-bold text-white">Supabase Cloud Database</h2>
                <span className="badge badge-green">Recommended</span>
              </div>
              <p className="text-muted text-sm">
                Connect your free Supabase cloud database to access your store POS from any phone, tablet, or laptop!
              </p>
            </div>
          </div>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSqlSchema(!showSqlSchema)}
          >
            <FileCode size={15} /> {showSqlSchema ? 'Hide SQL Script' : 'View SQL Schema'}
          </button>
        </div>

        {/* Collapsible SQL Script */}
        {showSqlSchema && (
          <div className="mb-4 p-4 rounded-xl bg-black/60 border border-white/10">
            <div className="flex-align-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald uppercase flex-align-center gap-1">
                <FileCode size={14} /> Paste this into your Supabase Dashboard ➔ SQL Editor
              </span>
              <button 
                className="btn btn-emerald btn-sm"
                onClick={() => copyToClipboard(sqlSchemaText, 'sql_schema')}
              >
                {copiedKey === 'sql_schema' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'sql_schema' ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="text-xs mono-num text-muted overflow-x-auto max-h-48 p-2">
              {sqlSchemaText}
            </pre>
          </div>
        )}

        {/* Credentials Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="input-label text-white">Supabase Project URL</label>
            <input 
              type="text" 
              className="input-control mono-num"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
            <span className="text-dim text-xs">Found in Supabase: Project Settings ➔ API ➔ Project URL</span>
          </div>

          <div>
            <label className="input-label text-white">Supabase Anon Public API Key</label>
            <input 
              type="password" 
              className="input-control mono-num"
              placeholder="eyJhbGciOi..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
            />
            <span className="text-dim text-xs">Found in Supabase: Project Settings ➔ API ➔ anon public key</span>
          </div>
        </div>

        {/* Status Feedback */}
        {supabaseTestStatus && (
          <div className={`p-3 rounded-lg mb-4 flex-align-center gap-2 ${supabaseTestStatus.success ? 'bg-emerald-950/40 text-emerald border border-emerald-500/30' : 'bg-red-950/40 text-danger border border-red-500/30'}`}>
            {supabaseTestStatus.loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : supabaseTestStatus.success ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="text-sm">{supabaseTestStatus.message}</span>
          </div>
        )}

        {/* Supabase Action Buttons */}
        <div className="flex-align-center justify-between flex-wrap gap-3">
          <div className="flex-align-center gap-2">
            <button 
              className="btn btn-emerald"
              onClick={handleTestAndSaveSupabase}
              disabled={supabaseTestStatus?.loading}
            >
              <CheckCircle2 size={16} /> Save & Connect Supabase
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleSeedCloudDatabase}
              title="Upload all 21 items and ingredients to cloud"
            >
              <Upload size={16} /> Push Initial Menu to Cloud
            </button>
          </div>

          <a 
            href="https://supabase.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-emerald flex-align-center gap-1 hover:underline"
          >
            Don't have a Supabase database yet? Create free on supabase.com ➔
          </a>
        </div>
      </div>

      {/* SECTION 2: GITHUB MULTI-PROFILE & PUSH INSTRUCTIONS */}
      <div className="luxe-card github-guide-card">
        <div className="flex-align-center justify-between pb-3 mb-4 border-b border-card">
          <div className="flex-align-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <GithubIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Push to Your GitHub Repository</h2>
              <p className="text-muted text-sm">
                Target Repo: <code>https://github.com/bot1botibot2025-cyber/kierankyrmerienda.git</code>
              </p>
            </div>
          </div>
          <span className="badge badge-gold">Remote Configured</span>
        </div>

        <p className="text-sm text-dim mb-3">
          Your remote repository is already configured as <code>origin</code>. Because GitHub requires personal account authentication, choose either method below:
        </p>

        {/* Copyable Quick Setup Commands */}
        <div className="space-y-3">
          {/* Option 1: Standard Push with Personal Access Token */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-white/10">
            <div className="flex-align-center justify-between mb-2">
              <span className="font-bold text-white text-sm flex-align-center gap-2">
                <Terminal size={16} className="text-primary" /> Push with Username & Personal Access Token (PAT)
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(`git push -u origin main`, 'git_push_standard')}
              >
                {copiedKey === 'git_push_standard' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'git_push_standard' ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="text-xs mono-num text-muted bg-black/50 p-3 rounded-lg overflow-x-auto">
{`git push -u origin main
# When prompted:
# Username: bot1botibot2025-cyber
# Password: <Paste your GitHub Personal Access Token with repo scope>`}
            </pre>
          </div>

          {/* Option 2: 1-Step Push with Token in URL */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-white/10">
            <div className="flex-align-center justify-between mb-2">
              <span className="font-bold text-white text-sm flex-align-center gap-2">
                <Key size={16} className="text-emerald" /> 1-Step Push (Insert your token in URL)
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(`git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/bot1botibot2025-cyber/kierankyrmerienda.git\ngit push -u origin main`, 'git_push_token')}
              >
                {copiedKey === 'git_push_token' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'git_push_token' ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="text-xs mono-num text-muted bg-black/50 p-3 rounded-lg overflow-x-auto">
{`git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/bot1botibot2025-cyber/kierankyrmerienda.git
git push -u origin main`}
            </pre>
          </div>
        </div>
      </div>

      {/* SECTION 3: STORE PROFILE & CONFIGURATION */}
      <div className="luxe-card store-settings-card">
        <div className="flex-align-center justify-between pb-3 mb-4 border-b border-card">
          <div className="flex-align-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Store size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Store Profile & Cash Float</h2>
              <p className="text-muted text-sm">Configure receipt details, store name, and daily petty cash.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Store Name</label>
              <input 
                type="text" 
                className="input-control font-bold"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Store Tagline / Subtitle</label>
              <input 
                type="text" 
                className="input-control"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Store Address</label>
              <input 
                type="text" 
                className="input-control"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Contact / GCash Number</label>
              <input 
                type="text" 
                className="input-control mono-num"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Opening Cash Float (Sukli Fund ₱)</label>
              <input 
                type="number" 
                className="input-control mono-num font-bold text-emerald"
                value={formData.openingCashFloat}
                onChange={(e) => setFormData({ ...formData, openingCashFloat: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Thermal Receipt Footer Message</label>
            <input 
              type="text" 
              className="input-control"
              value={formData.receiptFooterMessage}
              onChange={(e) => setFormData({ ...formData, receiptFooterMessage: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Store Profile
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: DATA BACKUP & OFFLINE PERSISTENCE */}
      <div className="luxe-card backup-card">
        <div className="flex-align-center justify-between pb-3 mb-4 border-b border-card">
          <div className="flex-align-center gap-3">
            <div className="p-2 rounded-lg bg-emerald/20 text-emerald">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Offline Data Backup & Sync</h2>
              <p className="text-muted text-sm">Download full JSON database snapshots anytime.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-elevated border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white mb-1">Download Backup (JSON)</h4>
              <p className="text-xs text-dim mb-4">Export all ingredients, recipes, orders, expenses, and settings into a single backup file.</p>
            </div>
            <button className="btn btn-emerald btn-sm" onClick={handleExportBackup}>
              <Download size={15} /> Export Backup
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white mb-1">Restore Backup</h4>
              <p className="text-xs text-dim mb-4">Load a previous backup JSON file to sync data from another device or phone.</p>
            </div>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Upload size={15} /> Select Backup File
              <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white mb-1">Reset to Starter Menu</h4>
              <p className="text-xs text-dim mb-4">Reset all burgers, hotdogs, waffles, fries, fruit sodas, and coffee jellies to official flyer data.</p>
            </div>
            <button className="btn btn-danger btn-sm" onClick={onResetData}>
              <RotateCcw size={15} /> Reset Starter Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
