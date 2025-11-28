
import { supabase } from './supabase';
import { secureCall } from '@/lib/resilience';
import { logger } from '@/lib/logger';

interface FeatureFlag {
  key: string;
  enabled: boolean;
}

// Cache em memória para evitar chamadas excessivas ao DB
let flagsCache: Record<string, boolean> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const FeatureFlagService = {
  
  /**
   * Carrega flags do banco de dados ou cache
   */
  async getFlags(): Promise<Record<string, boolean>> {
    const now = Date.now();

    if (flagsCache && (now - cacheTimestamp < CACHE_TTL)) {
      return flagsCache;
    }

    try {
      const query = supabase.from('feature_flags').select('key, enabled');
      
      const data = await secureCall(
        Promise.resolve(query),
        { opName: 'Fetch_FeatureFlags', retries: 2, failSilently: true }
      );

      const flags = (data ?? []) as FeatureFlag[];

      flagsCache = flags.reduce((acc: Record<string, boolean>, flag: FeatureFlag) => {
        acc[flag.key] = flag.enabled;
        return acc;
      }, {});

      cacheTimestamp = now;
      logger.info('Feature flags refreshed', { count: flags.length });
      
      return flagsCache;
    } catch (e) {
      logger.error('Failed to load feature flags, using defaults', e);
      return {};
    }
  },

  /**
   * Verifica se uma feature está ativa
   */
  async isEnabled(key: string): Promise<boolean> {
    const flags = await this.getFlags();
    // Default to false if flag doesn't exist (Fail Safe)
    return !!flags[key];
  },

  /**
   * Força refresh do cache (útil para debug)
   */
  invalidateCache() {
    flagsCache = null;
  }
};
