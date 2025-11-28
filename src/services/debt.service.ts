import { Debt } from '@/types';
import { DebtSchema } from '@/core/schema';
import { supabase } from '@/services/supabase';
import { OfflineService } from '@/services/offlineService';

export class DebtService {
  private static TABLE = 'debts';

  static async getAll(workspaceId?: string | null): Promise<Debt[]> {
    try {
      // 1. Offline First
      const localData = await OfflineService.getAll<Debt>(this.TABLE as any);
      
      if (navigator.onLine && workspaceId) {
        this.syncWithRemote(workspaceId).catch(console.error);
      }

      let data = localData;
      if (workspaceId) {
        data = data.filter(t => t.workspaceId === workspaceId);
      }
      return data.sort((a, b) => b.currentBalance - a.currentBalance);
    } catch (error) {
      console.error("DebtService Error:", error);
      return [];
    }
  }

  static async create(debt: unknown): Promise<Debt> {
    const validated = DebtSchema.parse(debt);
    await OfflineService.saveItem(this.TABLE as any, validated);
    await OfflineService.addToQueue(this.TABLE as any, 'create', validated);
    return validated;
  }

  static async delete(id: string): Promise<void> {
    await OfflineService.deleteItem(this.TABLE as any, id);
    await OfflineService.addToQueue(this.TABLE as any, 'delete', { id });
  }

  private static async syncWithRemote(workspaceId: string) {
    if (!supabase) return; // Safety check

    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('workspace_id', workspaceId);
      
    if (!error && data) {
      // Mapeamento snake_case (DB) -> camelCase (App)
      const formatted = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        currentBalance: d.current_balance,
        interestRate: d.interest_rate,
        minimumPayment: d.minimum_payment,
        dueDate: d.due_date,
        category: d.category,
        workspaceId: d.workspace_id
      }));
      
      for (const item of formatted) {
        const safeItem = DebtSchema.safeParse(item);
        if (safeItem.success) {
            await OfflineService.saveItem(this.TABLE as any, safeItem.data);
        }
      }
    }
  }
}