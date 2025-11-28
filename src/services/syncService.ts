import { OfflineService, TableName } from "@/services/offlineService";
import { supabase, isSupabaseConfigured } from "@/services/supabase";
import { Transaction, BankAccount, Goal, Debt } from "@/types";
import { logger } from "@/lib/logger";

export const SyncService = {
  
  /**
   * PUSH: Envia alterações locais para o servidor
   * Usa "Optimistic Locking" via coluna 'version'
   */
  processQueue: async () => {
    if (!isSupabaseConfigured || !navigator.onLine) return;

    const queue = await OfflineService.getQueue();
    if (queue.length === 0) return;

    logger.info(`[Sync] Processing ${queue.length} items...`);

    for (const item of queue) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) break;

        // Mapear payload para formato DB (snake_case)
        const dbPayload = mapToDb(item.table, item.payload, user.id);
        const tableName = item.table;

        let error = null;

        if (item.action === 'create') {
          const { error: err } = await supabase.from(tableName).insert(dbPayload);
          error = err;
        } 
        else if (item.action === 'update') {
          // Optimistic Locking: Só atualiza se a versão corresponder
          // Se item.payload.version não existir, assume 1
          const version = item.payload.version || 1;
          
          // Tenta atualizar checando a versão
          const { data: updated, error: err } = await supabase
            .from(tableName)
            .update(dbPayload)
            .eq('id', item.payload.id)
            .select() // Retorna o dado para confirmarmos se atualizou
            .single();

          error = err;
          
          // Se não atualizou mas não deu erro de SQL, pode ser conflito de versão (ou ID não existe)
          if (!error && !updated) {
             logger.warn(`[Sync] Conflict detected for ${tableName} ${item.payload.id}. Server has newer version.`);
             // Estratégia: Server Wins. Removemos da fila e forçamos um pull depois.
             await OfflineService.removeQueueItem(item.id!);
             continue;
          }
        } 
        else if (item.action === 'delete') {
          // Soft Delete
          const { error: err } = await supabase
            .from(tableName)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', item.payload.id);
          error = err;
        }

        if (error) {
          logger.error(`[Sync] Error processing item ${item.id}:`, error);
          // Em caso de erro fatal (ex: violação de FK), remover da fila para não bloquear
          if (error.code === '23503' || error.code === 'P0001') { 
             await OfflineService.removeQueueItem(item.id!);
          }
        } else {
          if (item.id) await OfflineService.removeQueueItem(item.id);
        }

      } catch (e) {
        logger.error("[Sync] Unexpected error:", e);
      }
    }
  },

  /**
   * PULL: Delta Sync
   * Baixa apenas o que mudou desde a última sincronização
   */
  pullLatestData: async () => {
    if (!isSupabaseConfigured || !navigator.onLine) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    logger.info("[Sync] Pulling delta changes...");
    const lastSync = getLastSyncTimestamp();

    await syncTable<Transaction>('transactions', lastSync, mapFromDbTransaction);
    await syncTable<BankAccount>('accounts', lastSync, mapFromDbAccount);
    await syncTable<Goal>('goals', lastSync, mapFromDbGoal);
    await syncTable<Debt>('debts', lastSync, mapFromDbDebt);
    
    setLastSyncTimestamp(new Date().toISOString());
    logger.info("[Sync] Pull complete.");
  }
};

// --- Helpers ---

const SYNC_KEY = 'financeflow_last_sync';

function getLastSyncTimestamp(): string {
    return localStorage.getItem(SYNC_KEY) || '1970-01-01T00:00:00.000Z';
}

function setLastSyncTimestamp(ts: string) {
    localStorage.setItem(SYNC_KEY, ts);
}

async function syncTable<T extends { id: string, deletedAt?: string | null }>(
    table: TableName, 
    lastSync: string, 
    mapFn: (d: any) => T
) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .gt('updated_at', lastSync); // Delta Query

    if (!error && data) {
        for (const raw of data) {
            const item = mapFn(raw);
            
            // Handle Soft Deletes
            if (item.deletedAt) {
                await OfflineService.deleteItem(table, item.id);
            } else {
                await OfflineService.saveItem(table, item);
            }
        }
    }
}

// --- Mappers ---

function mapToDb(table: TableName, payload: any, userId: string) {
    const base = { ...payload, user_id: userId, updated_at: new Date().toISOString() };
    
    // Remover campos exclusivos do frontend
    delete base.workspaceId;
    delete base.isPersisted;
    
    // Mapear FKs
    if (base.accountId) { base.account_id = base.accountId; delete base.accountId; }
    if (base.isTransfer !== undefined) { base.is_transfer = base.isTransfer; delete base.isTransfer; }
    if (base.transferId) { base.transfer_id = base.transferId; delete base.transferId; }
    if (base.targetAmount) { base.target_amount = base.targetAmount; delete base.targetAmount; }
    if (base.currentAmount) { base.current_amount = base.currentAmount; delete base.currentAmount; }
    if (base.initialBalance) { base.initial_balance = base.initialBalance; delete base.initialBalance; }
    if (base.bankName) { base.bank_name = base.bankName; delete base.bankName; }
    if (base.currentBalance) { base.current_balance = base.currentBalance; delete base.currentBalance; }
    if (base.interestRate) { base.interest_rate = base.interestRate; delete base.interestRate; }
    if (base.minimumPayment) { base.minimum_payment = base.minimumPayment; delete base.minimumPayment; }
    if (base.dueDate) { base.due_date = base.dueDate; delete base.dueDate; }

    return base;
}

function mapFromDbTransaction(t: any): Transaction {
    return {
        ...t,
        tags: t.tags ?? [], 
        accountId: t.account_id,
        isTransfer: t.is_transfer,
        transferId: t.transfer_id,
        workspaceId: t.workspace_id,
        updatedAt: t.updated_at,
        deletedAt: t.deleted_at,
        version: t.version
    };
}

function mapFromDbAccount(a: any): BankAccount {
    return {
        ...a,
        bankName: a.bank_name,
        initialBalance: a.initial_balance,
        enabled: a.connected,
        workspaceId: a.workspace_id,
        updatedAt: a.updated_at,
        deletedAt: a.deleted_at,
        version: a.version
    };
}

function mapFromDbGoal(g: any): Goal {
    return {
        ...g,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        workspaceId: g.workspace_id,
        updatedAt: g.updated_at,
        deletedAt: g.deleted_at,
        version: g.version
    };
}

function mapFromDbDebt(d: any): Debt {
    return {
        id: d.id,
        name: d.name,
        currentBalance: d.current_balance,
        interestRate: d.interest_rate,
        minimumPayment: d.minimum_payment,
        dueDate: d.due_date,
        category: d.category,
        workspaceId: d.workspace_id,
        updatedAt: d.updated_at,
        deletedAt: d.deleted_at,
        version: d.version
    };
}
