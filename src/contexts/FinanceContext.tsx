
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { 
    Transaction, BankAccount, Asset, User, Goal, 
    Automation, Subscription, Budget, RecurringTransaction,
    RiskAnalysis, LanguageCode, CurrencyCode, Debt, BudgetAnalysis, Investment
} from '@/types';
import { TransactionService } from '@/services/transaction.service';
import { FinancialEngine } from '@/core/financial-engine';
import { ApiService } from '@/services/api';
import { DebtService } from '@/services/debt.service';
import { OfflineService } from '@/services/offlineService';
import { DemoData } from '@/services/demoData';
import { generateId } from '@/utils';

interface FinanceContextType {
  transactions: Transaction[];
  accounts: BankAccount[];
  assets: Asset[];
  goals: Goal[]; 
  debts: Debt[];
  budgets: Budget[];
  subscriptions: Subscription[];
  fixedExpenses: any[];
  automations: Automation[];
  recurringTransactions: RecurringTransaction[];
  investments: Investment[];
  
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  netWorth: number;
  riskAnalysis: RiskAnalysis;
  
  // Actions
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (t: Transaction) => void;
  refreshBankData: (account: BankAccount) => Promise<void>;
  transferFunds: (sourceId: string, destId: string, amount: number, date: string) => Promise<void>;
  
  // Goals Actions
  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, currentAmount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Budget Actions
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetAnalysis: (budget: Budget) => BudgetAnalysis;

  // Subscription Actions
  addSubscription: (s: Omit<Subscription, 'id' | 'active'>) => Promise<void>;
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  
  // Fixed Expenses Actions
  addFixedExpense: (f: any) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;

  // Assets Actions
  addAsset: (a: any) => Promise<void>;
  updateAsset: (id: string, data: any) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  // Automations & Recurring & Investments
  addAutomation: (a: Omit<Automation, 'id'>) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  addRecurringTransaction: (r: any) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  addInvestment: (i: any) => Promise<void>;
  updateInvestment: (id: string, data: any) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;

  // Account CRUD
  addAccount: (a: any) => Promise<void>;
  updateAccount: (id: string, data: any) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Auth
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  register: any;
  deleteUserAccount: any;

  // Preferences
  currency: CurrencyCode;
  language: LanguageCode;
  updatePreferences: (currency: CurrencyCode, language: LanguageCode) => Promise<void>;
  updateBudget: (amount: number) => Promise<void>;

  // Placeholders
  financialScore: any;
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
  
  // Stubs
  updateNotificationSettings: any;
  upgradePlan: any;
  saveDashboardLayout: any;
  getPlanLimits: any;
  checkAccess: (feature: string) => boolean;
  addMultipleTransactions: any;
  createWorkspace: any; switchWorkspace: any;
  formatMoney: any;
  sendInvite: any; acceptInvite: any; rejectInvite: any;
  togglePrivacyMode: any;
  importData: any;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children?: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [globalBudget, setGlobalBudget] = useState(2000); // Global simple budget

  const currency = user?.currency || 'EUR';
  const language = user?.language || 'pt';

  // --- SEED DATA LOGIC ---
  const seedDataIfEmpty = async (userId: string) => {
      const accountsList = await OfflineService.getAll<BankAccount>('accounts');
      const hasAccounts = accountsList.length > 0;
      
      if (!hasAccounts) {
          console.log("Seeding Demo Data...");
          
          const saveAll = async (table: any, items: any[]) => {
              for (const item of items) {
                  await OfflineService.saveItem(table, { ...item, id: item.id || generateId(), workspaceId: userId });
              }
          };

          await saveAll('accounts', DemoData.accounts);
          await saveAll('transactions', DemoData.transactions);
          await saveAll('goals', DemoData.goals);
          await saveAll('budgets', DemoData.budgets);
          await saveAll('subscriptions', DemoData.subscriptions);
          await saveAll('fixed_expenses', DemoData.fixedExpenses);
          await saveAll('investments', DemoData.investments);
          await saveAll('automations', DemoData.automations);
          await saveAll('assets', DemoData.assets);
          
          return true; 
      }
      return false;
  };

  const updatePreferences = async (newCurrency: CurrencyCode, newLanguage: LanguageCode) => {
      if (user) {
          const updatedUser = { ...user, currency: newCurrency, language: newLanguage };
          setUser(updatedUser);
          localStorage.setItem('financeflow_user_prefs', JSON.stringify({ currency: newCurrency, language: newLanguage }));
          await ApiService.updateUserPreferences(newCurrency, newLanguage);
      }
  };

  const netWorth = useMemo(() => {
    const assetsVal = assets.reduce((acc, a) => a.type !== 'liability' ? acc + a.value : acc, 0);
    const liabVal = assets.reduce((acc, a) => a.type === 'liability' ? acc + a.value : acc, 0);
    const investmentsVal = investments.reduce((acc, i) => acc + i.currentValue, 0);
    return FinancialEngine.calculateNetWorth(accounts as any, assetsVal + investmentsVal, liabVal);
  }, [accounts, assets, investments]);

  const riskAnalysis = useMemo(() => {
    const monthlyFixed = fixedExpenses.reduce((acc, f) => acc + f.amount, 0);
    return FinancialEngine.analyzeRisk(transactions as any, accounts as any, monthlyFixed);
  }, [transactions, accounts, fixedExpenses]);

  const loadData = useCallback(async () => {
      if (!user) return;
      try {
          const userId = user.id || 'local_user';
          
          // Attempt Seed (Safe to call, checks for existence)
          await seedDataIfEmpty(userId);

          // Safe loading wrapper
          const safeLoad = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
              try { return await fn(); } 
              catch (e) { return fallback; }
          };

          // Parallel Fetching with Resilience
          // NOTE: Only map what is destructured. userDebts needs its own call.
          const [txs, accs, assts, fixed, userGoals, userDebts, userBudgets, userSubs, userAuto, userInv, userRec] = await Promise.all([
              safeLoad(() => TransactionService.getAll(userId), []),
              safeLoad(() => ApiService.getAccounts(userId), []),
              safeLoad(() => ApiService.getAssets(userId), []),
              safeLoad(() => ApiService.getFixedExpenses(userId), []),
              safeLoad(() => ApiService.getGoals(userId), []),
              safeLoad(() => DebtService.getAll(userId), []),
              safeLoad(() => ApiService.getBudgets(userId), []),
              safeLoad(() => ApiService.getSubscriptions(userId), []),
              safeLoad(() => ApiService.getAutomations(userId), []),
              safeLoad(() => ApiService.getInvestments(userId), []),
              safeLoad(() => ApiService.getRecurringTransactions(userId), []),
          ]);

          setTransactions(txs);
          setAccounts(accs);
          setAssets(assts);
          setFixedExpenses(fixed);
          setGoals(userGoals);
          setDebts(userDebts);
          setBudgets(userBudgets);
          setSubscriptions(userSubs);
          setAutomations(userAuto);
          setInvestments(userInv);
          setRecurringTransactions(userRec);

      } catch (e) {
          console.error("Critical Data Load Failure", e);
      }
  }, [user]);

  useEffect(() => {
      if (user) loadData();
  }, [user, loadData]);

  useEffect(() => {
    const initAuth = async () => {
        try {
            const localUser = localStorage.getItem('financeflow_user');
            if (localUser) {
                setUser(JSON.parse(localUser));
                setIsAuthenticated(true);
            } else {
                const u = await ApiService.auth.getCurrentUser();
                if (u) {
                    setUser(u);
                    setIsAuthenticated(true);
                }
            }
        } catch (e) {
            console.warn("Auth init warning", e);
        } finally {
            setIsAuthLoading(false);
        }
    };
    initAuth();
  }, []);

  // --- ACTIONS ---

  const login = async (email: string, pass: string) => {
      try {
          await ApiService.auth.signIn(email, pass);
      } catch (e) {
          // Fallback Demo User for Preview/Offline
          const demoUser = { id: 'demo_user', email, name: 'Demo User', plan: 'pro' as const };
          localStorage.setItem('financeflow_user', JSON.stringify(demoUser));
          setUser(demoUser);
          setIsAuthenticated(true);
      }
      window.location.reload();
  };

  const logout = () => {
      ApiService.auth.signOut();
      localStorage.removeItem('financeflow_user');
      setUser(null);
      setIsAuthenticated(false);
      window.location.reload();
  };

  // --- Transactions ---
  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
      const tempId = crypto.randomUUID();
      const newT = { ...t, id: tempId, tags: t.tags ?? [], workspaceId: user?.id || null, isPersisted: false };
      setTransactions(prev => [newT as Transaction, ...prev]);
      await TransactionService.create(newT);
  };

  const editTransaction = async (t: Transaction) => {
      await ApiService.updateTransaction(t);
      setTransactions(prev => prev.map(tx => tx.id === t.id ? t : tx));
  };

  const deleteTransaction = async (id: string) => {
      await ApiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const transferFunds = async (sourceId: string, destId: string, amount: number, date: string) => {
      const source = accounts.find(a => a.id === sourceId);
      const dest = accounts.find(a => a.id === destId);
      
      if (source && dest) {
          const updatedSource = { ...source, balance: source.balance - amount };
          const updatedDest = { ...dest, balance: dest.balance + amount };
          setAccounts(prev => prev.map(a => a.id === sourceId ? updatedSource : a.id === destId ? updatedDest : a));
          await ApiService.saveAccount(updatedSource);
          await ApiService.saveAccount(updatedDest);

          const txSource = { id: generateId(), description: `Transferência para ${dest.name}`, amount: amount, date: date, type: 'expense' as const, category: 'Transferência', accountId: sourceId, workspaceId: user?.id, isTransfer: true };
          const txDest = { id: generateId(), description: `Transferência de ${source.name}`, amount: amount, date: date, type: 'income' as const, category: 'Transferência', accountId: destId, workspaceId: user?.id, isTransfer: true };
          
          await TransactionService.create(txSource);
          await TransactionService.create(txDest);
          setTransactions(prev => [txSource, txDest, ...prev]);
      }
  };

  // --- Accounts ---
  const addAccount = async (a: any) => {
      const newAcc = { ...a, id: crypto.randomUUID(), workspaceId: user?.id };
      setAccounts(prev => [...prev, newAcc]);
      await ApiService.saveAccount(newAcc);
  };
  const updateAccount = async (id: string, data: any) => {
      const acc = accounts.find(a => a.id === id);
      if(acc) {
          const updated = { ...acc, ...data };
          setAccounts(prev => prev.map(a => a.id === id ? updated : a));
          await ApiService.saveAccount(updated);
      }
  };
  const deleteAccount = async (id: string) => {
      setAccounts(prev => prev.filter(a => a.id !== id));
      await ApiService.deleteAccount(id);
  };

  // --- Goals ---
  const addGoal = async (g: Omit<Goal, 'id'>) => {
      const newGoal = { ...g, id: crypto.randomUUID(), workspaceId: user?.id };
      setGoals(prev => [...prev, newGoal as Goal]);
      await ApiService.saveGoal(newGoal as Goal);
  };
  const updateGoal = async (id: string, amount: number) => {
      const goal = goals.find(g => g.id === id);
      if (goal) {
          const updated = { ...goal, currentAmount: amount };
          setGoals(prev => prev.map(g => g.id === id ? updated : g));
          await ApiService.saveGoal(updated);
      }
  };
  const deleteGoal = async (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
      await ApiService.deleteGoal(id);
  };

  // --- Budgets ---
  const addBudget = async (b: Omit<Budget, 'id'>) => {
      const newB = { ...b, id: crypto.randomUUID(), workspaceId: user?.id };
      setBudgets(prev => [...prev, newB as Budget]);
      await ApiService.saveBudget(newB as Budget);
  };
  const deleteBudget = async (id: string) => {
      setBudgets(prev => prev.filter(b => b.id !== id));
      await ApiService.deleteBudget(id);
  };
  const updateBudget = async (amount: number) => {
      setGlobalBudget(amount);
      // Persist logic needed
  };

  // --- Subscriptions ---
  const addSubscription = async (s: Omit<Subscription, 'id' | 'active'>) => {
      const newS = { ...s, id: crypto.randomUUID(), active: true, workspaceId: user?.id };
      setSubscriptions(prev => [...prev, newS as Subscription]);
      await ApiService.saveSubscription(newS as Subscription);
  };
  const updateSubscription = async (id: string, data: Partial<Subscription>) => {
      const sub = subscriptions.find(s => s.id === id);
      if (sub) {
          const updated = { ...sub, ...data };
          setSubscriptions(prev => prev.map(s => s.id === id ? updated : s));
          await ApiService.saveSubscription(updated);
      }
  };
  const deleteSubscription = async (id: string) => {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      await ApiService.deleteSubscription(id);
  };

  // --- Fixed Expenses ---
  const addFixedExpense = async (f: any) => {
      const newF = { ...f, id: crypto.randomUUID(), workspaceId: user?.id };
      setFixedExpenses(prev => [...prev, newF]);
      await ApiService.saveFixedExpense(newF);
  };
  const deleteFixedExpense = async (id: string) => {
      setFixedExpenses(prev => prev.filter(f => f.id !== id));
      await ApiService.deleteFixedExpense(id);
  };

  // --- Assets ---
  const addAsset = async (a: any) => {
      const newA = { ...a, id: crypto.randomUUID(), workspaceId: user?.id };
      setAssets(prev => [...prev, newA]);
      await ApiService.saveAsset(newA);
  };
  const updateAsset = async (id: string, data: any) => {
      const asset = assets.find(a => a.id === id);
      if (asset) {
          const updated = { ...asset, ...data };
          setAssets(prev => prev.map(a => a.id === id ? updated : a));
          await ApiService.saveAsset(updated);
      }
  };
  const deleteAsset = async (id: string) => {
      setAssets(prev => prev.filter(a => a.id !== id));
      await ApiService.deleteAsset(id);
  };

  // --- Investments ---
  const addInvestment = async (i: any) => {
      const newI = { ...i, id: crypto.randomUUID(), workspaceId: user?.id };
      setInvestments(prev => [...prev, newI]);
      await ApiService.saveInvestment(newI);
  };
  const updateInvestment = async (id: string, data: any) => {
      const inv = investments.find(i => i.id === id);
      if (inv) {
          const updated = { ...inv, ...data };
          setInvestments(prev => prev.map(i => i.id === id ? updated : i));
          await ApiService.saveInvestment(updated);
      }
  };
  const deleteInvestment = async (id: string) => {
      setInvestments(prev => prev.filter(i => i.id !== id));
      await ApiService.deleteInvestment(id);
  };

  // --- Automations ---
  const addAutomation = async (a: Omit<Automation, 'id'>) => {
      const newAuto = { ...a, id: crypto.randomUUID(), workspaceId: user?.id };
      setAutomations(prev => [...prev, newAuto as Automation]);
      await ApiService.saveAutomation(newAuto as Automation);
  };
  const deleteAutomation = async (id: string) => {
      setAutomations(prev => prev.filter(a => a.id !== id));
      await ApiService.deleteAutomation(id);
  };

  // --- Recurring ---
  const addRecurringTransaction = async (r: any) => {
      const newR = { ...r, id: crypto.randomUUID(), workspaceId: user?.id };
      setRecurringTransactions(prev => [...prev, newR]);
      await ApiService.saveRecurringTransaction(newR);
  };
  const deleteRecurringTransaction = async (id: string) => {
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
      await ApiService.deleteRecurringTransaction(id);
  };

  // Helpers
  const formatMoney = (val: number) => {
      return new Intl.NumberFormat(language === 'pt' ? 'pt-PT' : 'en-US', { style: 'currency', currency: currency }).format(val);
  };

  const getBudgetAnalysis = (budget: Budget): BudgetAnalysis => {
      const currentMonth = new Date().getMonth();
      const spent = transactions
          .filter(t => {
              const d = new Date(t.date);
              return d.getMonth() === currentMonth && t.type === 'expense' && (budget.category === 'Global' || t.category === budget.category);
          })
          .reduce((acc, t) => acc + t.amount, 0);
      
      return {
          category: budget.category,
          budget: budget.amount,
          spent,
          remaining: Math.max(0, budget.amount - spent),
          percentage: (spent / budget.amount) * 100,
          status: spent > budget.amount ? 'danger' : 'safe',
          projected: spent * 1.1
      };
  };

  // Bank Data Simulator
  const refreshBankData = async (account: BankAccount) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock logic: add small interest or random transaction
      const randomAmount = Math.random() * 50;
      const newTx: Transaction = {
          id: generateId(),
          description: 'Sincronização Bancária',
          amount: randomAmount,
          date: new Date().toISOString(),
          category: 'Outros',
          type: Math.random() > 0.5 ? 'expense' : 'income',
          accountId: account.id,
          workspaceId: user?.id,
          isPersisted: true
      };
      await addTransaction(newTx);
      const newBalance = account.balance + (newTx.type === 'income' ? newTx.amount : -newTx.amount);
      await updateAccount(account.id, { balance: newBalance, lastSync: new Date().toISOString() });
  };

  const placeholder: any = {
      workspaces: [], advisorInsights: [], achievements: [],
      dashboardLayout: null, userLevel: { currentLevel: 'Bronze', nextLevel: 'Prata', progress: 0, score: 0 }, notificationSettings: [], pendingInvites: [], sentInvites: [],
      financialScore: { score: 75, label: 'Bom', breakdown: { savingsRate: {score:80,value:20,label:'Poupança'}, essentials: {score:70,value:50,label:'Essenciais'}, emergencyFund: {score:60,value:3,label:'Fundo'}, growth: {score:50,value:100,label:'Crescimento'} }, tips: ['Aumente o seu fundo de emergência.'] },
      currentWorkspace: null, isSyncing: false, isOnline: true, isPrivacyEnabled: false
  };

  const value = {
      ...placeholder,
      transactions, accounts, assets, fixedExpenses, goals, debts, budgets, subscriptions,
      automations, recurringTransactions, investments,
      user, isAuthenticated, isAuthLoading,
      netWorth, riskAnalysis, budget: globalBudget,
      addTransaction, editTransaction, deleteTransaction,
      addGoal, updateGoal, deleteGoal,
      transferFunds,
      addAccount, updateAccount, deleteAccount,
      addBudget, deleteBudget, getBudgetAnalysis,
      addSubscription, updateSubscription, deleteSubscription,
      addFixedExpense, deleteFixedExpense,
      addAsset, updateAsset, deleteAsset,
      addInvestment, updateInvestment, deleteInvestment,
      addAutomation, deleteAutomation,
      addRecurringTransaction, deleteRecurringTransaction,
      formatMoney, currency, language, updatePreferences, updateBudget,
      login, logout, register: ApiService.auth.signUp, deleteUserAccount: ApiService.deleteUserAccount,
      getPlanLimits: () => ({ maxAccounts: 99, maxAutomations: 99, maxGoals: 99, maxMonthlyTransactions: 999, maxWorkspaces: 5 }),
      checkAccess: (feature: string) => true,
      addMultipleTransactions: async (txs: any[]) => { 
          for(const t of txs) await addTransaction(t);
      },
      refreshBankData,
      createWorkspace: async () => {}, switchWorkspace: async () => {},
      sendInvite: async () => {}, acceptInvite: async () => {}, rejectInvite: async () => {},
      togglePrivacyMode: async () => {},
      importData: async () => {},
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