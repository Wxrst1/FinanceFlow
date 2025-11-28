
import { Transaction, BankAccount, Goal, Debt } from "@/types";

const DB_NAME = 'financeflow_db';
const DB_VERSION = 4; // Incremented version

export type TableName = 'transactions' | 'accounts' | 'goals' | 'debts';
export type SyncAction = 'create' | 'update' | 'delete';

export interface SyncItem {
  id?: number;
  table: TableName;
  action: SyncAction;
  payload: any;
  timestamp: number;
}

class OfflineServiceImpl {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.dbPromise = this.openDB();
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create Stores if they don't exist
        ['transactions', 'accounts', 'goals', 'debts'].forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, { keyPath: 'id' });
            }
        });

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    if (!db) throw new Error("Database not initialized");
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  async getAll<T>(table: TableName): Promise<T[]> {
    try {
      const store = await this.getStore(table);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`Error getting all from ${table}`, e);
      return [];
    }
  }

  async getById<T>(table: TableName, id: string): Promise<T | undefined> {
    const store = await this.getStore(table);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  async saveItem<T>(table: TableName, item: T): Promise<void> {
    const store = await this.getStore(table, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteItem(table: TableName, id: string): Promise<void> {
    const store = await this.getStore(table, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Queue Methods
  async addToQueue(table: TableName, action: SyncAction, payload: any): Promise<void> {
    const store = await this.getStore('sync_queue', 'readwrite');
    const item: SyncItem = {
      table,
      action,
      payload,
      timestamp: Date.now()
    };
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getQueue(): Promise<SyncItem[]> {
    try {
      const store = await this.getStore('sync_queue');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as SyncItem[]);
        request.onerror = () => reject(request.error);
      });
    } catch { return []; }
  }

  async removeQueueItem(id: number): Promise<void> {
    const store = await this.getStore('sync_queue', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clearDatabase(): Promise<void> {
      const tables = ['transactions', 'accounts', 'goals', 'debts', 'sync_queue'];
      try {
        const db = await this.dbPromise;
        if (!db) return;
        const tx = db.transaction(tables, 'readwrite');
        tables.forEach(t => tx.objectStore(t).clear());
      } catch(e) { console.error("Error clearing DB", e); }
  }
}

export const OfflineService = new OfflineServiceImpl();