
import { Transaction, BankAccount, FixedExpense, CoachingPlan, Asset, LanguageCode } from "../types";
export const CoachingService = {
    generateCoachingPlan: async (t: Transaction[], a: BankAccount[], f: FixedExpense[], as: Asset[], l: LanguageCode): Promise<CoachingPlan> => ({
        phase: 'survival', focusArea: 'N/A', monthlySavingsTarget: 0, emergencyFundTarget: 0, steps: [], generatedAt: new Date().toISOString()
    })
};
