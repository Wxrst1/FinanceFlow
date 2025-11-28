
import { PostgrestError } from '@supabase/supabase-js';
import { logger } from './logger';

interface ServiceOptions {
  retries?: number;
  timeout?: number;
  opName?: string;
  failSilently?: boolean;
}

const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 10000; // 10s

export class ServiceError extends Error {
  constructor(public originalError: any, public context: string) {
    super(`[${context}] ${originalError.message || 'Unknown error'}`);
    this.name = 'ServiceError';
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper seguro para chamadas Supabase com Retry e Timeout
 */
export async function secureCall<T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>,
  options: ServiceOptions = {}
): Promise<T> {
  const { 
    retries = DEFAULT_RETRIES, 
    timeout = DEFAULT_TIMEOUT, 
    opName = 'Unknown_Op',
    failSilently = false
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Timeout Race
      let timer: any;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Request timed out')), timeout);
      });

      const response = await Promise.race([promise, timeoutPromise]) as { data: T | null; error: PostgrestError | null };
      clearTimeout(timer);

      if (response.error) {
        throw response.error;
      }

      // Success
      if (attempt > 1) {
        logger.info(`${opName} recovered on attempt ${attempt}`);
      }
      return response.data as T;

    } catch (error: any) {
      const isLastAttempt = attempt === retries;
      const errorMessage = error.message || 'Unknown Network Error';

      // Log Warning on retries
      if (!isLastAttempt) {
        logger.warn(`${opName} failed (Attempt ${attempt}/${retries})`, { error: errorMessage });
        // Exponential Backoff with Jitter
        const delay = 500 * Math.pow(2, attempt - 1) + Math.random() * 100;
        await wait(delay);
        continue;
      }

      // Log Critical on final failure
      logger.error(`${opName} CRITICAL FAILURE`, error);
      
      if (failSilently) {
        // Return safe fallback (e.g. empty array) by casting
        return [] as unknown as T; 
      }

      throw new ServiceError(error, opName);
    }
  }

  throw new Error('Unreachable code');
}
