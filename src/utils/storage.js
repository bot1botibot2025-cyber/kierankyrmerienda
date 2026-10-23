// Local storage persistence and JSON backup/restore for KK's Tindahan

const STORAGE_KEYS = {
  INGREDIENTS: "kks_pos_ingredients_v1",
  MENU_ITEMS: "kks_pos_menu_items_v1",
  ORDERS: "kks_pos_orders_v1",
  EXPENSES: "kks_pos_expenses_v1",
  SETTINGS: "kks_pos_settings_v1"
};

export function loadStoredData(key, fallbackData) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallbackData;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading key ${key} from localStorage:`, err);
    return fallbackData;
  }
}

export function saveStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key} to localStorage:`, err);
  }
}

export { STORAGE_KEYS };

// Export complete database as a downloadable JSON file
export function exportDatabaseBackup(allData) {
  const backupObject = {
    appName: "KK's Tindahan POS & Inventory",
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    data: allData
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObject, null, 2));
  const downloadAnchor = document.createElement("a");
  const filename = `kks_tindahan_backup_${new Date().toISOString().slice(0, 10)}.json`;
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
