
import { Transaction, BankAccount, FixedExpense, FinancialScore, LanguageCode } from "../types";
export const FinancialHealthService = {
    calculateScore: (t: Transaction[], a: BankAccount[], f: FixedExpense[], l: LanguageCode): FinancialScore => ({
        score: 0, label: 'Razoável', breakdown: { savingsRate: {score:0,value:0,label:''}, essentials: {score:0,value:0,label:''}, emergencyFund: {score:0,value:0,label:''}, growth: {score:0,value:0,label:''} }, tips: []
    })
};
