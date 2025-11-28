
import { Transaction, FixedExpense, RecurringTransaction, BankAccount, Scenario, SimulationResult } from "../types";
export const SimulationService = {
    runSimulation: (t: Transaction[], a: BankAccount[], f: FixedExpense[], r: RecurringTransaction[], s: Scenario[]): SimulationResult => ({
        baseline: [], simulated: [], difference6Months: 0, difference12Months: 0, verdict: 'neutral'
    })
};
