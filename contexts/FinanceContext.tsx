
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { 
    Transaction, BankAccount, Asset, User, Goal, 
    Automation, Subscription, Budget, RecurringTransaction,
    RiskAnalysis, LanguageCode, CurrencyCode
} from '../types';
// FIX: Usar caminho relativo estrito para evitar erro de alias
import { RiskAnalysis as CoreRiskAnalysis } from '../core/schema';
import { TransactionService } from '../services/transaction.service';
import { FinancialEngine } from '../core/financial-engine';
import { ApiService } from '../services/api';

interface FinanceContextType {
  transactions: Transaction[];
  accounts: BankAccount[];
  assets: Asset[];
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  netWorth: number;
  riskAnalysis: RiskAnalysis;
  
  // Actions
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (t: Transaction) => void;
  refreshBankData: any;
  
  // Auth
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  register: any;
  deleteUserAccount: any;

  // Preferences
  currency: CurrencyCode;
  language: LanguageCode;
  updatePreferences: (currency: CurrencyCode, language: LanguageCode) => Promise<void>;

  // Placeholders (Legacy Support)
  financialScore: any;
  goals: Goal[];
  automations: Automation[];
  fixedExpenses: any[];
  budgets: Budget[];
  subscriptions: Subscription[];
  recurringTransactions: RecurringTransaction[];
  investments: any[];
  workspaces: any[];
  currentWorkspace: any;
  advisorInsights: any[];
  dashboardLayout: any;
  achievements: any[];
  userLevel: any;
  notificationSettings: any[];
  pendingInvites: any[];
  sentInvites: any[];
  isSyncing: boolean;
  isOnline: boolean;
  isPrivacyEnabled: boolean;
  budget: number;
  
  // Methods Stubs
  updateNotificationSettings: any;
  upgradePlan: any;
  saveDashboardLayout: any;
  getPlanLimits: any;
  checkAccess: any;
  addMultipleTransactions: any;
  transferFunds: any;
  addGoal: any; updateGoal: any; deleteGoal: any;
  addAutomation: any; deleteAutomation: any;
  addAccount: any; updateAccount: any; deleteAccount: any;
  addFixedExpense: any; deleteFixedExpense: any;
  addBudget: any; deleteBudget: any; getBudgetAnalysis: any;
  addSubscription: any; updateSubscription: any; deleteSubscription: any;
  addRecurringTransaction: any; deleteRecurringTransaction: any;
  addAsset: any; updateAsset: any; deleteAsset: any;
  addInvestment: any; updateInvestment: any; deleteInvestment: any;
  createWorkspace: any; switchWorkspace: any;
  formatMoney: any;
  updateBudget: any;
  sendInvite: any; acceptInvite: any; rejectInvite: any;
  togglePrivacyMode: any;
  importData: any;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children?: ReactNode }) => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- PREFERENCES ---
  const currency = user?.currency || 'EUR';
  const language = user?.language || 'pt';

  const updatePreferences = async (newCurrency: CurrencyCode, newLanguage: LanguageCode) => {
      if (user) {
          const updatedUser = { ...user, currency: newCurrency, language: newLanguage };
          setUser(updatedUser);
          await ApiService.updateUserPreferences(newCurrency, newLanguage);
      }
  };

  // --- CORE ENGINE CALCULATIONS (Memoized) ---
  
  const netWorth = useMemo(() => {
    const assetsVal = assets.reduce((acc, a) => a.type !== 'liability' ? acc + a.value : acc, 0);
    const liabVal = assets.reduce((acc, a) => a.type === 'liability' ? acc + a.value : acc, 0);
    return FinancialEngine.calculateNetWorth(accounts as any, assetsVal, liabVal);
  }, [accounts, assets]);

  const riskAnalysis = useMemo(() => {
    const monthlyFixed = fixedExpenses.reduce((acc, f) => acc + f.amount, 0);
    const analysis = FinancialEngine.analyzeRisk(transactions as any, accounts as any, monthlyFixed);
    return analysis as RiskAnalysis;
  }, [transactions, accounts, fixedExpenses]);


  // --- DATA LOADING ---

  const loadData = useCallback(async () => {
      if (!user) return;
      
      try {
          // Parallel Fetching
          const [txs, accs, assts, fixed] = await Promise.all([
              TransactionService.getAll(user.id),
              ApiService.getAccounts(user.id),
              ApiService.getAssets(user.id),
              ApiService.getFixedExpenses(user.id)
          ]);

          setTransactions(txs as Transaction[]);
          setAccounts(accs);
          setAssets(assts);
          setFixedExpenses(fixed);
      } catch (e) {
          console.error("Data load failed", e);
      }
  }, [user]);

  useEffect(() => {
      if (user) loadData();
  }, [user, loadData]);

  // Auth Init
  useEffect(() => {
    const initAuth = async () => {
        const u = await ApiService.auth.getCurrentUser();
        if (u) {
            setUser(u);
            setIsAuthenticated(true);
        }
        setIsAuthLoading(false);
    };
    initAuth();
  }, []);

  // --- ACTIONS ---

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
      // Gera ID temporário para UI otimista
      const tempId = crypto.randomUUID();
      const newT = { 
          ...t, 
          id: tempId, 
          workspaceId: user?.id || null,
          isPersisted: false 
      };
      
      // Optimistic UI Update
      setTransactions(prev => [newT as Transaction, ...prev]);
      
      try {
        // Background Service Call
        const savedTransaction = await TransactionService.create(newT);
        
        // Atualiza com o objeto validado/real se necessário
        setTransactions(prev => prev.map(tx => tx.id === tempId ? savedTransaction : tx));
      } catch (error) {
        console.error("Failed to save transaction", error);
        // Reverter em caso de erro grave (opcional)
        setTransactions(prev => prev.filter(tx => tx.id !== tempId));
      }
  };

  // Legacy wrappers using ApiService for now (Migration Phase 1)
  const editTransaction = async (t: Transaction) => {
      await ApiService.updateTransaction(t);
      setTransactions(prev => prev.map(tx => tx.id === t.id ? t : tx));
  };

  const deleteTransaction = async (id: string) => {
      await ApiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- PLACEHOLDERS & UTILS ---
  
  const formatMoney = (val: number) => {
      return new Intl.NumberFormat(language === 'pt' ? 'pt-PT' : 'en-US', { style: 'currency', currency: currency }).format(val);
  };

  const placeholder: any = {
      goals: [], automations: [], budgets: [], subscriptions: [], recurringTransactions: [], investments: [], workspaces: [], advisorInsights: [], achievements: [],
      dashboardLayout: null, userLevel: { currentLevel: 'Bronze', nextLevel: 'Prata', progress: 0, score: 0 }, notificationSettings: [], pendingInvites: [], sentInvites: [],
      financialScore: { score: 0, label: 'Razoável', breakdown: { savingsRate: {score:0,value:0,label:''}, essentials: {score:0,value:0,label:''}, emergencyFund: {score:0,value:0,label:''}, growth: {score:0,value:0,label:''} }, tips: [] },
      currentWorkspace: null, isSyncing: false, isOnline: true, isPrivacyEnabled: false, budget: 0
  };

  const value = {
      ...placeholder,
      transactions, accounts, assets, fixedExpenses,
      user, isAuthenticated, isAuthLoading,
      netWorth, riskAnalysis,
      addTransaction, editTransaction, deleteTransaction,
      formatMoney,
      currency,
      language,
      updatePreferences,
      login: async (e: string, p: string) => { await ApiService.auth.signIn(e, p); window.location.reload(); },
      logout: async () => { await ApiService.auth.signOut(); window.location.reload(); },
      register: ApiService.auth.signUp,
      deleteUserAccount: ApiService.deleteUserAccount,
      getPlanLimits: () => ({ maxAccounts: 99, maxAutomations: 99, maxGoals: 99, maxMonthlyTransactions: 999, maxWorkspaces: 5 }),
      checkAccess: () => true,
      // Stubs to prevent crash
      addMultipleTransactions: async (txs: any[]) => { await ApiService.saveMultipleTransactions(txs); loadData(); },
      addAccount: async (a: any) => { await ApiService.saveAccount(a); loadData(); },
      updateAccount: async (id: string, data: any) => { const acc = accounts.find(a => a.id === id); if(acc) { await ApiService.saveAccount({...acc, ...data}); loadData(); } },
      deleteAccount: async (id: string) => { await ApiService.deleteAccount(id); loadData(); },
      refreshBankData: async () => {},
      addGoal: async () => {}, updateGoal: async () => {}, deleteGoal: async () => {},
      addFixedExpense: async (f: any) => { await ApiService.saveFixedExpense({...f, id: crypto.randomUUID()}); loadData(); },
      deleteFixedExpense: async (id: string) => { await ApiService.deleteFixedExpense(id); loadData(); },
      addAsset: async (a: any) => { await ApiService.saveAsset({...a, id: crypto.randomUUID()}); loadData(); },
      updateAsset: async (id: string, d: any) => { const old = assets.find(a => a.id === id); if(old) { await ApiService.saveAsset({...old, ...d}); loadData(); } },
      deleteAsset: async (id: string) => { await ApiService.deleteAsset(id); loadData(); },
  };

  return (
    <FinanceContext.Provider value={value as any}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
