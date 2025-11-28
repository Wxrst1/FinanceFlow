import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '@/services/transaction.service';
import { Transaction } from '@/core/schema';
import { useAuth } from '@/features/auth/AuthContext';

export const useTransactions = (workspaceId?: string | null) => {
  const { user } = useAuth();
  const targetWorkspace = workspaceId ?? user?.id; // Default to personal workspace

  return useQuery({
    queryKey: ['transactions', targetWorkspace],
    queryFn: () => TransactionService.getAll(targetWorkspace),
    enabled: !!targetWorkspace, // Only fetch if we have an ID
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id'>) => {
        // Create ID client-side for optimistic updates if needed
        const newTx = { 
            ...transaction, 
            id: crypto.randomUUID(), 
            workspaceId: user?.id ?? null,
            tags: transaction.tags ?? [] 
        }; 
        // Cast to any to avoid type mismatch issues if Service signature varies
        return TransactionService.create(newTx as any);
    },
    onSuccess: (_, variables) => {
      // Invalidate cache to refetch or update manually
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] }); // Recalculate totals
    },
  });
};

// Derived Metrics Hook (Substitutes calculateNetWorth/Risk inside Context)
export const useTransactionMetrics = (transactions: Transaction[] = []) => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
        
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    };
};