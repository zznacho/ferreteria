import { localDB } from '../db/database';
import { syncService } from './api';

class SyncService {
  constructor() {
    this.syncInterval = null;
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.sync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async sync() {
    if (!this.isOnline) {
      console.log('Offline - sync postponed');
      return;
    }

    try {
      await this.pushChanges();
      await this.pullChanges();
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  async pushChanges() {
    const pendingChanges = localDB.getPendingChanges();
    
    if (pendingChanges.length === 0) return;
    
    const changes = pendingChanges.map(change => ({
      table: change.table_name,
      recordId: change.record_id,
      action: change.action,
      data: JSON.parse(change.data)
    }));
    
    await syncService.push(changes);
    
    const syncedIds = pendingChanges.map(c => c.id);
    localDB.markAsSynced(syncedIds);
    await localDB.save();
  }

  async pullChanges() {
    const lastSync = localStorage.getItem('last_sync_timestamp');
    const response = await syncService.pull(lastSync);
    
    const { changes, syncTimestamp } = response.data;
    
    // Apply changes to local database
    for (const [table, records] of Object.entries(changes)) {
      for (const record of records) {
        this.applyChange(table, record);
      }
    }
    
    localStorage.setItem('last_sync_timestamp', syncTimestamp);
    await localDB.save();
  }

  applyChange(table, record) {
    const sql = `
      INSERT OR REPLACE INTO ${table} (${Object.keys(record).join(', ')})
      VALUES (${Object.keys(record).map(() => '?').join(', ')})
    `;
    
    localDB.execute(sql, Object.values(record));
  }

  startAutoSync(intervalMs = 30000) {
    this.syncInterval = setInterval(() => {
      this.sync();
    }, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncManager = new SyncService();