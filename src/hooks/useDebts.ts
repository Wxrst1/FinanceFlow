import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/types';
import { DebtService } from '@/services/debt.service';
import { useFinance } from '@/contexts/FinanceContext';

export const useDebts = () => {
  const { currentWorkspace } = useFinance();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDebts = useCallback(async () => {
    if (!currentWorkspace) return;
    setIsLoading(true);
    try {
      const data = await DebtService.getAll(currentWorkspace.id);
      setDebts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const addDebt = async (debt: Omit<Debt, 'id' | 'workspaceId'>) => {
    const newDebt = {
      ...debt,
      id: crypto.randomUUID(),
      workspaceId: currentWorkspace?.id || null
    };
    // Optimistic Update
    setDebts(prev => [...prev, newDebt]);
    await DebtService.create(newDebt);
  };

  const removeDebt = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    await DebtService.delete(id);
  };

  return {
    debts,
    isLoading,
    addDebt,
    removeDebt,
    refresh: loadDebts
  };
};
