import { Transaction, Goal, Automation, User, BankAccount, SubscriptionPlan, FixedExpense, CurrencyCode, LanguageCode, Budget, Subscription, RecurringTransaction, Asset, Workspace, MonthlyReport, Investment, WorkspaceInvite, WorkspaceMember, WorkspaceRole } from "@/types";
import { supabase } from "@/services/supabase";
import { secureCall } from "@/lib/resilience";
import { logger } from "@/lib/logger";
import { OfflineService } from "@/services/offlineService";

// Transformadores Robustos (DB <-> App <-> Cache)
const Transformers = {
  toTransaction: (data: any): Transaction => ({
    id: data.id,
    description: data.description,
    amount: data.amount,
    date: data.date,
    category: data.category,
    type: data.type,
    tags: data.tags || [],
    accountId: data.accountId || data.account_id,
    isTransfer: data.isTransfer ?? data.is_transfer,
    transferId: data.transferId || data.transfer_id,
    workspaceId: data.workspaceId || data.workspace_id,
    isPersisted: data.isPersisted ?? true
  }),
  toAccount: (data: any): BankAccount => ({
    id: data.id,
    name: data.name,
    type: data.type,
    balance: data.balance,
    initialBalance: data.initialBalance || data.initial_balance,
    color: data.color,
    icon: data.icon,
    enabled: data.enabled ?? data.connected ?? true,
    bankName: data.bankName || data.bank_name,
    accountType: data.accountType || data.account_type,
    lastSync: data.lastSync || data.last_sync,
    workspaceId: data.workspaceId || data.workspace_id,
    providerAccountId: data.providerAccountId || data.provider_account_id,
    accessToken: data.accessToken || data.access_token,
    connected: data.connected ?? data.enabled
  }),
  toWorkspace: (data: any, role: WorkspaceRole = 'viewer'): Workspace => ({
    id: data.id,
    name: data.name,
    plan: data.plan,
    createdAt: data.createdAt || data.created_at,
    ownerId: data.ownerId || data.owner_id,
    role: role
  }),
  toBudget: (data: any): Budget => ({
    id: data.id,
    category: data.category,
    amount: data.amount,
    alertThreshold: data.alertThreshold || data.alert_threshold,
    workspaceId: data.workspaceId || data.workspace_id
  }),
  toGoal: (data: any): Goal => ({
    id: data.id,
    name: data.name,
    targetAmount: data.targetAmount || data.target_amount,
    currentAmount: data.currentAmount || data.current_amount,
    deadline: data.deadline,
    color: data.color,
    workspaceId: data.workspaceId || data.workspace_id
  }),
  toSubscription: (data: any): Subscription => ({
    id: data.id,
    name: data.name,
    amount: data.amount,
    billingCycle: data.billingCycle || data.billing_cycle,
    nextPaymentDate: data.nextPaymentDate || data.next_payment_date,
    category: data.category,
    icon: data.icon,
    color: data.color,
    active: data.active,
    workspaceId: data.workspaceId || data.workspace_id
  }),
  toFixedExpense: (data: any): FixedExpense => ({
    id: data.id,
    description: data.description,
    amount: data.amount,
    day: data.day,
    category: data.category,
    workspaceId: data.workspaceId || data.workspace_id
  }),
  toAsset: (data: any): Asset => ({
    id: data.id,
    name: data.name,
    type: data.type,
    value: data.value,
    currency: data.currency,
    icon: data.icon,
    workspaceId: data.workspaceId || data.workspace_id
  }),
  toInvestment: (data: any): Investment => ({
    id: data.id,
    name: data.name,
    type: data.type,
    initialCost: data.initialCost || data.initial_cost,
    currentValue: data.currentValue || data.current_value,
    quantity: data.quantity,
    purchaseDate: data.purchaseDate || data.purchase_date,
    notes: data.notes,
    workspaceId: data.workspaceId || data.workspace_id
  }),
  toAutomation: (data: any): Automation => ({
    id: data.id,
    name: data.name,
    matchString: data.matchString || data.match_string,
    targetCategory: data.targetCategory || data.target_category,
    targetType: data.targetType || data.target_type,
    isActive: data.isActive ?? data.is_active,
    workspaceId: data.workspaceId || data.workspace_id
  }),
  toRecurring: (data: any): RecurringTransaction => ({
    id: data.id,
    description: data.description,
    amount: data.amount,
    category: data.category,
    type: data.type,
    frequency: data.frequency,
    dayOfMonth: data.dayOfMonth || data.day_of_month,
    nextRun: data.nextRun || data.next_run,
    active: data.active,
    workspaceId: data.workspaceId || data.workspace_id
  })
};

export const ApiService = {
  auth: {
    signUp: async (email: string, password: string, name: string, plan: SubscriptionPlan = 'starter') => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
            data: { name, plan },
            emailRedirectTo: window.location.origin 
        }
      });
      if (error) throw error;
      return data;
    },
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    signInWithOAuth: async (provider: 'google' | 'github') => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
      return data;
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) return null;

            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return null;
            
            // Fetch Profile Data
            const { data: profile } = await secureCall(
                Promise.resolve(supabase.from('profiles').select('*').eq('id', user.id).single()),
                { opName: 'Get_Profile', failSilently: true }
            );

            return {
                id: user.id,
                email: user.email!,
                name: user.user_metadata.name || 'Utilizador',
                plan: profile?.plan || user.user_metadata.plan || 'starter',
                currency: profile?.currency || 'EUR',
                language: profile?.language || 'pt',
                dashboardLayout: profile?.dashboard_layout || null
            };
        } catch(e) { 
            logger.error("Auth check failed", e);
            return null; 
        }
    }
  },

  deleteUserAccount: async () => {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
      await supabase.auth.signOut();
  },

  // --- CORE DATA ---

  getTransactions: async (workspaceId?: string | null): Promise<Transaction[]> => {
      if (!workspaceId) return OfflineService.getAll('transactions');
      const query = supabase.from('transactions').select('*').eq('workspace_id', workspaceId).order('date', { ascending: false });
      const data = await secureCall(Promise.resolve(query), { opName: 'Get_Transactions', failSilently: true });
      return (data || []).map(Transformers.toTransaction);
  },

  getAccounts: async (wsId?: string | null): Promise<BankAccount[]> => {
      if (!wsId) return OfflineService.getAll('accounts');
      const query = supabase.from('accounts').select('*').eq('workspace_id', wsId);
      const data = await secureCall(Promise.resolve(query), { opName: 'Get_Accounts', failSilently: true });
      return (data || []).map(Transformers.toAccount);
  },

  getWorkspaces: async (): Promise<Workspace[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const query = supabase.from('workspace_members').select('role, workspace:workspaces(*)').eq('user_id', user.id);
      const data = await secureCall(Promise.resolve(query), { opName: 'Get_Workspaces', failSilently: true });
      
      if (!data) return [];
      return data.map((item: any) => Transformers.toWorkspace(item.workspace, item.role));
  },

  // --- WRITE OPERATIONS ---

  saveTransaction: async (t: Transaction) => {
      const payload = {
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.category,
          type: t.type,
          tags: t.tags,
          account_id: t.accountId,
          workspace_id: t.workspaceId,
          is_transfer: t.isTransfer,
          transfer_id: t.transferId
      };
      
      await OfflineService.saveItem('transactions', t);
      const query = supabase.from('transactions').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Transaction', failSilently: true });
  },

  updateTransaction: async (t: Transaction) => {
      await ApiService.saveTransaction(t);
  },

  saveAccount: async (a: BankAccount) => {
      const payload = {
          id: a.id,
          name: a.name,
          type: a.type,
          balance: a.balance,
          initial_balance: a.initialBalance,
          color: a.color,
          icon: a.icon,
          bank_name: a.bankName,
          workspace_id: a.workspaceId,
          connected: a.connected
      };
      await OfflineService.saveItem('accounts', a);
      const query = supabase.from('accounts').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Account', failSilently: true });
  },

  saveGoal: async (g: Goal) => {
      const payload = {
          id: g.id,
          name: g.name,
          target_amount: g.targetAmount,
          current_amount: g.currentAmount,
          workspace_id: g.workspaceId,
          color: g.color
      };
      await OfflineService.saveItem('goals', g);
      const query = supabase.from('goals').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Goal', failSilently: true });
  },

  deleteGoal: async (id: string) => {
      await OfflineService.deleteItem('goals', id);
      const query = supabase.from('goals').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Goal', failSilently: true });
  },

  getGoals: async (wsId?: string | null): Promise<Goal[]> => {
      if (!wsId) return OfflineService.getAll('goals');
      const query = supabase.from('goals').select('*').eq('workspace_id', wsId);
      const data = await secureCall(Promise.resolve(query), { opName: 'Get_Goals', failSilently: true });
      return (data || []).map(Transformers.toGoal);
  },
  
  saveMultipleTransactions: async (txs: Transaction[]) => {
      // Local Save
      for (const t of txs) {
          await OfflineService.saveItem('transactions', t);
      }

      // Remote Save
      const payload = txs.map(t => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.category,
          type: t.type,
          account_id: t.accountId,
          workspace_id: t.workspaceId
      }));
      
      const query = supabase.from('transactions').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Batch_Save_Tx', failSilently: true });
  },

  deleteTransaction: async (id: string) => {
      await OfflineService.deleteItem('transactions', id);
      const query = supabase.from('transactions').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Tx', failSilently: true });
  },

  deleteAccount: async (id: string) => {
      await OfflineService.deleteItem('accounts', id);
      const query = supabase.from('accounts').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Account', failSilently: true });
  },

  updateUserPreferences: async (currency: CurrencyCode, language: LanguageCode) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const query = supabase.from('profiles').update({ currency, language }).eq('id', user.id);
      await secureCall(Promise.resolve(query), { opName: 'Update_Prefs', failSilently: true });
  },

  // --- BUDGETS ---
  getBudgets: async (wsId?: string | null): Promise<Budget[]> => {
      try {
        const localData = await OfflineService.getAll<Budget>('budgets' as any);
        if (localData.length > 0 && !wsId) return localData;
        if (!wsId) return [];
        
        const query = supabase.from('budgets').select('*').eq('workspace_id', wsId);
        const data = await secureCall(Promise.resolve(query), { opName: 'Get_Budgets', failSilently: true });
        return (data || []).map(Transformers.toBudget);
      } catch { return []; }
  },

  saveBudget: async (b: Budget) => {
      await OfflineService.saveItem('budgets' as any, b);
      const payload = {
          id: b.id,
          category: b.category,
          amount: b.amount,
          alert_threshold: b.alertThreshold,
          workspace_id: b.workspaceId
      };
      const query = supabase.from('budgets').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Budget', failSilently: true });
  },

  deleteBudget: async (id: string) => {
      await OfflineService.deleteItem('budgets' as any, id);
      const query = supabase.from('budgets').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Budget', failSilently: true });
  },

  // --- SUBSCRIPTIONS ---
  getSubscriptions: async (wsId?: string | null): Promise<Subscription[]> => {
      try {
        const localData = await OfflineService.getAll<Subscription>('subscriptions' as any);
        if (localData.length > 0 && !wsId) return localData;
        if (!wsId) return [];

        const query = supabase.from('subscriptions').select('*').eq('workspace_id', wsId);
        const data = await secureCall(Promise.resolve(query), { opName: 'Get_Subs', failSilently: true });
        return (data || []).map(Transformers.toSubscription);
      } catch { return []; }
  },

  saveSubscription: async (s: Subscription) => {
      await OfflineService.saveItem('subscriptions' as any, s);
      const payload = {
          id: s.id,
          name: s.name,
          amount: s.amount,
          billing_cycle: s.billingCycle,
          next_payment_date: s.nextPaymentDate,
          category: s.category,
          icon: s.icon,
          color: s.color,
          active: s.active,
          workspace_id: s.workspaceId
      };
      const query = supabase.from('subscriptions').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Sub', failSilently: true });
  },

  deleteSubscription: async (id: string) => {
      await OfflineService.deleteItem('subscriptions' as any, id);
      const query = supabase.from('subscriptions').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Sub', failSilently: true });
  },

  // --- FIXED EXPENSES ---
  getFixedExpenses: async (wsId?: string | null): Promise<FixedExpense[]> => {
      try {
        const localData = await OfflineService.getAll<FixedExpense>('fixed_expenses' as any);
        if (localData.length > 0 && !wsId) return localData;
        if (!wsId) return [];

        const query = supabase.from('fixed_expenses').select('*').eq('workspace_id', wsId);
        const data = await secureCall(Promise.resolve(query), { opName: 'Get_Fixed', failSilently: true });
        return (data || []).map(Transformers.toFixedExpense);
      } catch { return []; }
  },

  saveFixedExpense: async (f: FixedExpense) => {
      await OfflineService.saveItem('fixed_expenses' as any, f);
      const payload = {
          id: f.id,
          description: f.description,
          amount: f.amount,
          day: f.day,
          category: f.category,
          workspace_id: f.workspaceId
      };
      const query = supabase.from('fixed_expenses').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Fixed', failSilently: true });
  },

  deleteFixedExpense: async (id: string) => {
      await OfflineService.deleteItem('fixed_expenses' as any, id);
      const query = supabase.from('fixed_expenses').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Fixed', failSilently: true });
  },

  // --- ASSETS ---
  getAssets: async (wsId?: string | null): Promise<Asset[]> => {
      try {
        const localData = await OfflineService.getAll<Asset>('assets' as any);
        if (localData.length > 0 && !wsId) return localData;
        if (!wsId) return [];

        const query = supabase.from('assets').select('*').eq('workspace_id', wsId);
        const data = await secureCall(Promise.resolve(query), { opName: 'Get_Assets', failSilently: true });
        return (data || []).map(Transformers.toAsset);
      } catch { return []; }
  },

  saveAsset: async (a: Asset) => {
      await OfflineService.saveItem('assets' as any, a);
      const payload = {
          id: a.id,
          name: a.name,
          type: a.type,
          value: a.value,
          currency: a.currency,
          icon: a.icon,
          workspace_id: a.workspaceId
      };
      const query = supabase.from('assets').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Asset', failSilently: true });
  },

  deleteAsset: async (id: string) => {
      await OfflineService.deleteItem('assets' as any, id);
      const query = supabase.from('assets').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Asset', failSilently: true });
  },

  // --- AUTOMATIONS ---
  getAutomations: async (wsId?: string | null): Promise<Automation[]> => {
      try {
        const localData = await OfflineService.getAll<Automation>('automations' as any);
        if (localData.length > 0 && !wsId) return localData;
        if (!wsId) return [];

        const query = supabase.from('automations').select('*').eq('workspace_id', wsId);
        const data = await secureCall(Promise.resolve(query), { opName: 'Get_Automations', failSilently: true });
        return (data || []).map(Transformers.toAutomation);
      } catch { return []; }
  },

  saveAutomation: async (a: Automation) => {
      await OfflineService.saveItem('automations' as any, a);
      const payload = {
          id: a.id,
          name: a.name,
          match_string: a.matchString,
          target_category: a.targetCategory,
          target_type: a.targetType,
          is_active: a.isActive,
          workspace_id: a.workspaceId
      };
      const query = supabase.from('automations').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Automation', failSilently: true });
  },

  deleteAutomation: async (id: string) => {
      await OfflineService.deleteItem('automations' as any, id);
      const query = supabase.from('automations').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Automation', failSilently: true });
  },

  // --- RECURRING TRANSACTIONS ---
  getRecurringTransactions: async (wsId?: string | null): Promise<RecurringTransaction[]> => {
      try {
        const localData = await OfflineService.getAll<RecurringTransaction>('recurring_transactions' as any);
        if (localData.length > 0 && !wsId) return localData;
        if (!wsId) return [];

        const query = supabase.from('recurring_transactions').select('*').eq('workspace_id', wsId);
        const data = await secureCall(Promise.resolve(query), { opName: 'Get_Recurring', failSilently: true });
        return (data || []).map(Transformers.toRecurring);
      } catch { return []; }
  },

  saveRecurringTransaction: async (r: RecurringTransaction) => {
      await OfflineService.saveItem('recurring_transactions' as any, r);
      const payload = {
          id: r.id,
          description: r.description,
          amount: r.amount,
          category: r.category,
          type: r.type,
          frequency: r.frequency,
          day_of_month: r.dayOfMonth,
          next_run: r.nextRun,
          active: r.active,
          workspace_id: r.workspaceId
      };
      const query = supabase.from('recurring_transactions').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Recurring', failSilently: true });
  },

  deleteRecurringTransaction: async (id: string) => {
      await OfflineService.deleteItem('recurring_transactions' as any, id);
      const query = supabase.from('recurring_transactions').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Recurring', failSilently: true });
  },

  // --- INVESTMENTS ---
  getInvestments: async (wsId?: string | null): Promise<Investment[]> => {
      try {
        const localData = await OfflineService.getAll<Investment>('investments' as any);
        if (localData.length > 0 && !wsId) return localData;
        if (!wsId) return [];

        const query = supabase.from('investments').select('*').eq('workspace_id', wsId);
        const data = await secureCall(Promise.resolve(query), { opName: 'Get_Investments', failSilently: true });
        return (data || []).map(Transformers.toInvestment);
      } catch { return []; }
  },

  saveInvestment: async (i: Investment) => {
      await OfflineService.saveItem('investments' as any, i);
      const payload = {
          id: i.id,
          name: i.name,
          type: i.type,
          initial_cost: i.initialCost,
          current_value: i.currentValue,
          quantity: i.quantity,
          purchase_date: i.purchaseDate,
          notes: i.notes,
          workspace_id: i.workspaceId
      };
      const query = supabase.from('investments').upsert(payload);
      await secureCall(Promise.resolve(query), { opName: 'Save_Investment', failSilently: true });
  },

  deleteInvestment: async (id: string) => {
      await OfflineService.deleteItem('investments' as any, id);
      const query = supabase.from('investments').delete().eq('id', id);
      await secureCall(Promise.resolve(query), { opName: 'Delete_Investment', failSilently: true });
  },

  // --- MISC ---
  updateUserPlan: async (plan: SubscriptionPlan) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const query = supabase.from('profiles').update({ plan }).eq('id', user.id);
      await secureCall(Promise.resolve(query), { opName: 'Update_Plan', failSilently: true });
  },

  // Placeholders
  getReports: async (workspaceId?: string | null) => { return []; }, 
  saveReport: async (report: MonthlyReport) => {},
  getDashboardLayout: async () => null,
  saveDashboardLayout: async (layout: any) => {},
  getWorkspaceMembers: async (id: string) => { return []; },
  removeMember: async (id: string) => {},
  updateMemberRole: async (id: string, role: WorkspaceRole) => {},
  inviteMember: async (wsId: string, email: string, role: WorkspaceRole) => {},
  revokeInvite: async (id: string) => {},
  getPendingInvites: async () => { return []; },
  getSentInvites: async (wsId: string) => { return []; },
  respondToInvite: async (id: string, accept: boolean) => {},
  importData: async () => {},
};