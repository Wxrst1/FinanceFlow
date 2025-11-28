
import { BankAccount, Transaction } from "../types";
export const ReconcileService = {
    calculateDiscrepancy: (sys: number, act: number) => ({ difference: 0, isMatch: true, type: 'surplus' }),
    createAdjustmentTransaction: (a: BankAccount, d: number): Transaction => ({} as Transaction)
};
