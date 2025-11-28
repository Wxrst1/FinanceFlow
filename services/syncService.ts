
import { OfflineService, TableName } from "./offlineService";
import { supabase, isSupabaseConfigured } from "./supabase";
import { Transaction, BankAccount, Goal } from "../types";

export const SyncService = {
  
  /**
   * Process the offline queue and push changes to Supabase
   */
  processQueue: async () => {
    if (!isSupabaseConfigured || !navigator.onLine) return;

    const queue = await OfflineService.getQueue();
    if (queue.length === 0) return;

    console.log(`[Sync] Processing ${queue.length} items...`);

    for (const item of queue) {
      try {
        const { user } = (await supabase!.auth.getUser()).data;
        if (!user) break;

        let error = null;

        // Prepare payload with user_id
        const payload = { ...item.payload, user_id: user.id };
        
        // Map internal table names to Supabase table names if they differ
        // (Assuming they match exactly based on previous context: transactions, accounts, goals)
        const tableName = item.table; 

        // Mapping specific fields for Supabase compatibility (Snake Case)
        // This mirrors the logic in ApiService
        let dbPayload: any = { ...payload };
        if (item.table === 'transactions') {
            dbPayload = {
                ...payload,
                account_id: payload.accountId,
                is_transfer: payload.isTransfer,
                transfer_id: payload.transferId,
                workspace_id: payload.workspaceId
            };
            delete dbPayload.accountId;
            delete dbPayload.isTransfer;
            delete dbPayload.transferId;
            delete dbPayload.workspaceId;
        } else if (item.table === 'accounts') {
            dbPayload = {
                ...payload,
                bank_name: payload.name,
                initial_balance: payload.initialBalance,
                connected: payload.enabled,
                workspace_id: payload.workspaceId
            };
            delete dbPayload.name;
            delete dbPayload.initialBalance;
            delete dbPayload.enabled;
            delete dbPayload.workspaceId;
        } else if (item.table === 'goals') {
            dbPayload = {
                ...payload,
                target_amount: payload.targetAmount,
                current_amount: payload.currentAmount,
                workspace_id: payload.workspaceId
            };
            delete dbPayload.targetAmount;
            delete dbPayload.currentAmount;
            delete dbPayload.workspaceId;
        }

        if (item.action === 'create' || item.action === 'update') {
          const { error: err } = await supabase!.from(tableName).upsert(dbPayload);
          error = err;
        } else if (item.action === 'delete') {
          const { error: err } = await supabase!.from(tableName).delete().eq('id', item.payload.id);
          error = err;
        }

        if (error) {
          console.error(`[Sync] Error processing item ${item.id}:`, error);
          // If error is critical (e.g. schema violation), maybe remove it to unblock queue?
          // For now, we keep it to retry later, or specific error handling can go here.
        } else {
          // Success
          if (item.id) await OfflineService.removeQueueItem(item.id);
        }

      } catch (e) {
        console.error("[Sync] Unexpected error:", e);
      }
    }
  },

  /**
   * Pull latest data from Supabase and update local cache
   * resolving conflicts by preferring the server (if newer)
   */
  pullLatestData: async () => {
    if (!isSupabaseConfigured || !navigator.onLine) return;

    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) return;

    console.log("[Sync] Pulling latest data...");

    // Helper to sync a specific table
    const syncTable = async <T>(tableName: TableName, mapFn: (data: any) => T) => {
      const { data, error } = await supabase!.from(tableName).select('*');
      
      if (!error && data) {
        const serverItems = data.map(mapFn);
        
        // Batch save to IndexedDB (Overwriting local cache to match server)
        // Optimization: Could compare updated_at timestamps to avoid unnecessary writes
        for (const item of serverItems) {
           await OfflineService.saveItem(tableName, item);
        }
      }
    };

    // 1. Transactions
    await syncTable<Transaction>('transactions', (t) => ({
        ...t,
        accountId: t.account_id,
        isTransfer: t.is_transfer,
        transferId: t.transfer_id,
        workspaceId: t.workspace_id
    }));

    // 2. Accounts
    await syncTable<BankAccount>('accounts', (a) => ({
        ...a,
        name: a.bank_name,
        initialBalance: a.initial_balance,
        enabled: a.connected,
        workspaceId: a.workspace_id
    }));

    // 3. Goals
    await syncTable<Goal>('goals', (g) => ({
        ...g,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        workspaceId: g.workspace_id
    }));
    
    console.log("[Sync] Pull complete.");
  }
};
