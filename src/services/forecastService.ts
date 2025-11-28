
import { Transaction, FixedExpense, RecurringTransaction, ForecastPoint, ForecastSummary, BankAccount } from "../types";
export const ForecastService = {
    calculateBurnRate: (transactions: Transaction[]): number => 0,
    generateForecast: (a: BankAccount[], f: FixedExpense[], r: RecurringTransaction[], b: number): { data: ForecastPoint[], summary: ForecastSummary } => ({
        data: [], summary: { monthEndBalance: 0, lowestBalance: 0, lowestBalanceDate: '', burnRate: 0, status: 'safe', daysUntilNegative: null }
    })
};
