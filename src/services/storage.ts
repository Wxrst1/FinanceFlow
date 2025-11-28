import { Transaction, Goal } from "@/types";

const KEYS = {
  TRANSACTIONS: 'financeflow_transactions',
  GOALS: 'financeflow_goals',
  USER: 'financeflow_user',
};

export const StorageService = {
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading transactions", e);
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getGoals: (): Goal[] => {
    try {
      const data = localStorage.getItem(KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveGoals: (goals: Goal[]) => {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },
  
  clear: () => {
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.GOALS);
    localStorage.removeItem(KEYS.USER);
  }
};