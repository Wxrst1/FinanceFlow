import { Transaction, TransactionSchema } from '@/core/schema';
import { supabase } from '@/services/supabase';
import { OfflineService } from '@/services/offlineService';

export class TransactionService {
  private static TABLE = 'transactions';

  /**
   * Obtém todas as transações (Cache First -> Network Background)
   */
  static async getAll(workspaceId?: string | null): Promise<Transaction[]> {
    try {
      // 1. Leitura Local Rápida
      let localData = await OfflineService.getAll<Transaction>(this.TABLE as any);
      
      // Filtro por Workspace
      if (workspaceId) {
        localData = localData.filter(t => t.workspaceId === workspaceId);
      }

      // 2. Sincronização em Background (se online)
      if (navigator.onLine && workspaceId) {
        this.syncWithRemote(workspaceId).catch(console.error);
      }
      
      // Retorno Ordenado
      return localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("TransactionService Error:", error);
      return [];
    }
  }

  /**
   * Cria uma nova transação (Optimistic UI)
   */
  static async create(transaction: unknown): Promise<Transaction> {
    // 1. Validação Robusta (Zod)
    const validated = TransactionSchema.parse(transaction);

    // 2. Gravar Localmente (IndexedDB)
    await OfflineService.saveItem(this.TABLE as any, validated);
    
    // 3. Adicionar à Fila de Sync
    await OfflineService.addToQueue(this.TABLE as any, 'create', validated);

    return validated;
  }

  /**
   * Sincronização Interna (Snake_case DB -> CamelCase App)
   */
  private static async syncWithRemote(workspaceId: string) {
    if (!supabase) return; // Safety check

    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('workspace_id', workspaceId);
      
    if (!error && data) {
      const formatted = data.map((t: any) => ({
        ...t,
        accountId: t.account_id,
        isTransfer: t.is_transfer,
        transferId: t.transfer_id,
        workspaceId: t.workspace_id
      }));
      
      // Atualiza cache local com a verdade do servidor
      for (const item of formatted) {
        // Validação silenciosa antes de salvar
        const safeItem = TransactionSchema.safeParse(item);
        if (safeItem.success) {
            await OfflineService.saveItem(this.TABLE as any, safeItem.data);
        }
      }
    }
  }
}
