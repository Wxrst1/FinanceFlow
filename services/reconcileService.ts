
import { BankAccount, Transaction } from "../types";
import { generateId } from "../utils";

export const ReconcileService = {
    /**
     * Calculates difference between user input and system tracking
     */
    calculateDiscrepancy: (systemBalance: number, actualBalance: number) => {
        const difference = actualBalance - systemBalance;
        const isMatch = Math.abs(difference) < 0.01;
        
        return {
            difference,
            isMatch,
            type: difference > 0 ? 'surplus' : 'deficit' // surplus = found money (income), deficit = missing money (expense)
        };
    },

    /**
     * Creates the transaction object to fix the balance
     */
    createAdjustmentTransaction: (
        account: BankAccount, 
        difference: number
    ): Transaction => {
        const isPositive = difference > 0;
        
        return {
            id: generateId(),
            description: 'Ajuste de Reconciliação', // Reconciliation Adjustment
            amount: Math.abs(difference),
            date: new Date().toISOString(),
            category: 'Outros', // Fallback category
            type: isPositive ? 'income' : 'expense',
            accountId: account.id,
            tags: ['Reconciliação', 'Auto-Ajuste'],
            isPersisted: true,
            workspaceId: account.workspaceId
        };
    }
};
