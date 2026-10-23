import React, { useState } from 'react';
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
  Save 
} from 'lucide-react';

function GithubIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
import { exportDatabaseBackup } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';

export function SettingsView({ 
  storeSettings, 
  setStoreSettings, 
  allDatabaseData, 
  onResetData, 
  onRestoreData 
}) {
  const [formData, setFormData] = useState({ ...storeSettings });
  const [copiedKey, setCopiedKey] = useState(null);

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
      } catch (err) {
        alert('Error parsing backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-container space-y-6">
      {/* SECTION 1: GITHUB MULTI-PROFILE & ACCOUNT SWITCHER GUIDE */}
      <div className="luxe-card github-guide-card">
        <div className="flex-align-center justify-between pb-3 mb-4 border-b border-card">
          <div className="flex-align-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <GithubIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">GitHub Account Switching & Multi-Profile Guide</h2>
              <p className="text-muted text-sm">
                How to sign in directly or seamlessly switch between your personal and store GitHub accounts.
              </p>
            </div>
          </div>
          <span className="badge badge-gold">Direct Answer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Method A: Built-in GitHub Web Switcher */}
          <div className="method-box luxe-card" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex-align-center gap-2 mb-2 text-primary font-bold">
              <Globe size={18} />
              <span>1. Direct Web Switcher</span>
            </div>
            <p className="text-sm text-dim mb-3">
              GitHub has a native <strong>Account Switcher</strong> built directly into the website:
            </p>
            <ol className="text-xs text-muted space-y-1.5 pl-4 list-decimal">
              <li>Open <strong>github.com</strong> in your browser.</li>
              <li>Click your <strong>Profile Avatar</strong> (top-right corner).</li>
              <li>Click <strong>"Switch account"</strong>.</li>
              <li>Click <strong>"Add account"</strong> & sign in.</li>
              <li>Switch between both accounts with <strong>1 click</strong>!</li>
            </ol>
          </div>

          {/* Method B: Dedicated Browser Profile */}
          <div className="method-box luxe-card" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex-align-center gap-2 mb-2 text-emerald font-bold">
              <UserPlus size={18} />
              <span>2. Separate Browser Profile</span>
            </div>
            <p className="text-sm text-dim mb-3">
              Best practice for keeping work/store completely isolated from personal:
            </p>
            <ol className="text-xs text-muted space-y-1.5 pl-4 list-decimal">
              <li>In Chrome / Edge / Brave, click your browser profile icon (top right).</li>
              <li>Click <strong>"Add Profile"</strong> (e.g. named <em>"KK's Store"</em>).</li>
              <li>Sign in to your store's GitHub, email, and social accounts there.</li>
              <li>Keeps tabs, cookies, and passwords 100% separate.</li>
            </ol>
          </div>

          {/* Method C: Local Git Config for this Repo */}
          <div className="method-box luxe-card" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex-align-center gap-2 mb-2 text-amber font-bold">
              <Terminal size={18} />
              <span>3. Git Repo Configuration</span>
            </div>
            <p className="text-sm text-dim mb-3">
              Ensure commits in <code>kks-tindahan-pos</code> use your store profile:
            </p>
            <div className="code-snippet-box">
              <code className="text-xs text-amber block mb-2">
                git config user.name "KK Tindahan"
              </code>
              <code className="text-xs text-amber block">
                git config user.email "store@example.com"
              </code>
            </div>
          </div>
        </div>

        {/* Copyable Quick Setup Commands */}
        <div className="p-4 rounded-xl bg-surface-elevated border border-white/10">
          <div className="flex-align-center justify-between mb-2">
            <span className="font-bold text-white text-sm flex-align-center gap-2">
              <Key size={16} className="text-primary" /> Setup Commands for this Repository (Terminal)
            </span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => copyToClipboard(`git config user.name "KK Store Admin"\ngit config user.email "kks-tindahan@example.com"\ngit remote add origin https://github.com/YOUR_NEW_ACCOUNT/kks-tindahan-pos.git`, 'git_cmds')}
            >
              {copiedKey === 'git_cmds' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copiedKey === 'git_cmds' ? 'Copied!' : 'Copy Commands'}</span>
            </button>
          </div>
          <pre className="text-xs mono-num text-muted bg-black/50 p-3 rounded-lg overflow-x-auto">
{`# 1. Set your custom username and email for this store project:
git config user.name "Your New Account Name"
git config user.email "your-store-email@gmail.com"

# 2. Add your new GitHub remote:
git remote add origin https://github.com/YOUR_NEW_ACCOUNT/kks-tindahan-pos.git

# 3. Push your store POS code:
git add .
git commit -m "feat: complete KK Tindahan POS, Recipe Inventory & Expense Tracker"
git push -u origin main`}
          </pre>
        </div>
      </div>

      {/* SECTION 2: STORE PROFILE & CONFIGURATION */}
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

      {/* SECTION 3: DATA BACKUP & OFFLINE PERSISTENCE */}
      <div className="luxe-card backup-card">
        <div className="flex-align-center justify-between pb-3 mb-4 border-b border-card">
          <div className="flex-align-center gap-3">
            <div className="p-2 rounded-lg bg-emerald/20 text-emerald">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Offline Data Backup & Sync</h2>
              <p className="text-muted text-sm">All store data is saved locally in browser storage. Download backups anytime.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white mb-1">Download Backup (JSON)</h4>
              <p className="text-xs text-dim mb-4">Export all ingredients, recipes, orders, expenses, and settings into a single backup file.</p>
            </div>
            <button className="btn btn-emerald btn-sm" onClick={handleExportBackup}>
              <Download size={15} /> Export Backup
            </button>
          </div>

          {/* Import JSON */}
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

          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white mb-1">Reset to Sample Data</h4>
              <p className="text-xs text-dim mb-4">Reset all hotdogs, burgers, coffee jellies, and inventory to standard starter data.</p>
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
