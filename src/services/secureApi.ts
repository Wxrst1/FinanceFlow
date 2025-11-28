import { supabase } from './supabase';
import { logger } from '@/lib/logger';

/**
 * Interface segura para operações críticas.
 */
export const SecureApiService = {
  
  /**
   * Executa uma transferência atómica no servidor via RPC.
   * Isso garante que o dinheiro não "desapareça" se a segunda query falhar.
   */
  transferFunds: async (sourceId: string, destId: string, amount: number, date: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.rpc('transfer_funds_atomic', {
      p_source_id: sourceId,
      p_dest_id: destId,
      p_amount: amount,
      p_date: date,
      p_user_id: user.id
    });

    if (error) {
        logger.error("Transfer failed", error);
        throw new Error(error.message || "Erro na transferência bancária");
    }
  },

  checkFeatureAccess: async (feature: 'ai_access' | 'can_add_member' | 'max_accounts'): Promise<boolean> => {
    const { data, error } = await supabase.functions.invoke('verify-plan', {
      body: { feature }
    });

    if (error || !data) return false;
    return data.allowed;
  },

  checkRewardEligibility: async (): Promise<boolean> => {
    const { data, error } = await supabase.rpc('check_reward_eligibility');
    if (error) return false;
    return data as boolean;
  }
};