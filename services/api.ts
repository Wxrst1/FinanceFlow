
import { Transaction, Goal, Automation, User, BankAccount, SubscriptionPlan, FixedExpense, CurrencyCode, LanguageCode, Budget, Subscription, RecurringTransaction, Asset, Workspace, MonthlyReport, Investment, WorkspaceInvite, WorkspaceMember, WorkspaceRole } from "../types";
import { supabase, isSupabaseConfigured } from "./supabase";
import { generateId } from "../utils";
import { OfflineService } from "./offlineService";

const KEYS = {
  USER: 'financeflow_user',
  WORKSPACES: 'financeflow_workspaces',
  WORKSPACE_MEMBERS: 'financeflow_workspace_members',
  LAYOUT: 'financeflow_dashboard_layout',
  REPORTS: 'financeflow_monthly_reports',
  INVITES: 'financeflow_invites'
};

// Helper for legacy LocalStorage reads
const getLocal = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const setLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const ApiService = {
  auth: {
    signUp: async (email: string, password: string, name: string, plan: SubscriptionPlan = 'starter') => {
      if (!isSupabaseConfigured) throw new Error("Supabase não configurado");
      const { data, error } = await supabase!.auth.signUp({
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
      if (!isSupabaseConfigured) throw new Error("Supabase não configurado");
      const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    signInWithOAuth: async (provider: 'google' | 'github') => {
      if (!isSupabaseConfigured) throw new Error("Supabase não configurado");
      const { data, error } = await supabase!.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
      return data;
    },
    signOut: async () => {
      if (isSupabaseConfigured) await supabase!.auth.signOut();
      localStorage.removeItem(KEYS.USER);
    },
    getCurrentUser: async (): Promise<User | null> => {
      if (isSupabaseConfigured) {
        try {
            const { data: { session }, error: sessionError } = await supabase!.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) return null;

            const { data: { user }, error } = await supabase!.auth.getUser();
            if (error) throw error;
            
            if (user) {
              let dbProfile: any = {};
              try {
                const { data } = await supabase!.from('profiles').select('*').eq('id', user.id).single();
                if (data) dbProfile = data;
              } catch (e) { }
              return {
                id: user.id,
                email: user.email!,
                name: user.user_metadata.name || 'Utilizador',
                plan: dbProfile.plan || user.user_metadata.plan || 'starter',
                currency: dbProfile.currency || 'EUR',
                language: dbProfile.language || 'pt',
                dashboardLayout: dbProfile.dashboard_layout || null
              };
            }
        } catch(e) { return null; }
      }
      return null;
    }
  },

  deleteUserAccount: async () => {
      if (isSupabaseConfigured) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (user) {
              try {
                  await supabase!.functions.invoke('delete-user');
              } catch(e) {
                  console.error("Error deleting user data:", e);
              }
          }
          await supabase!.auth.signOut();
      }
      await OfflineService.clearDatabase();
      localStorage.clear();
  },

  // --- TRANSACTIONS (Offline-First) ---
  getTransactions: async (workspaceId?: string | null) => {
      try {
          let localData = await OfflineService.getAll<Transaction>('transactions');
          if (workspaceId) {
              localData = localData.filter(t => t.workspaceId === workspaceId);
          }
          return localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (e) {
          console.warn("Fetch transactions failed, returning empty", e);
          return [];
      }
  },

  saveTransaction: async (t: Transaction) => {
      await OfflineService.saveItem('transactions', t);
      await OfflineService.addToQueue('transactions', 'create', t);
  },

  saveMultipleTransactions: async (txs: Transaction[]) => {
      for (const t of txs) {
          await OfflineService.saveItem('transactions', t);
          await OfflineService.addToQueue('transactions', 'create', t);
      }
  },

  updateTransaction: async (t: Transaction) => {
      await OfflineService.saveItem('transactions', t);
      await OfflineService.addToQueue('transactions', 'update', t);
  },

  deleteTransaction: async (id: string) => {
      await OfflineService.deleteItem('transactions', id);
      await OfflineService.addToQueue('transactions', 'delete', { id });
  },

  // --- ACCOUNTS (Offline-First) ---
  getAccounts: async (wsId?: string | null) => {
      try {
          let accounts = await OfflineService.getAll<BankAccount>('accounts');
          if (wsId) accounts = accounts.filter(a => a.workspaceId === wsId);
          return accounts;
      } catch (e) {
          console.warn("Fetch accounts failed", e);
          return [];
      }
  },

  saveAccount: async (a: BankAccount) => {
      await OfflineService.saveItem('accounts', a);
      await OfflineService.addToQueue('accounts', 'update', a); 
  },

  deleteAccount: async (id: string) => {
      await OfflineService.deleteItem('accounts', id);
      await OfflineService.addToQueue('accounts', 'delete', { id });
  },

  // --- GOALS (Offline-First) ---
  getGoals: async (wsId?: string | null) => {
      try {
          let goals = await OfflineService.getAll<Goal>('goals');
          if (wsId) goals = goals.filter(g => g.workspaceId === wsId);
          return goals;
      } catch (e) {
          return [];
      }
  },

  saveGoal: async (g: Goal) => {
      await OfflineService.saveItem('goals', g);
      await OfflineService.addToQueue('goals', 'update', g);
  },

  deleteGoal: async (id: string) => {
      await OfflineService.deleteItem('goals', id);
      await OfflineService.addToQueue('goals', 'delete', { id });
  },

  // --- Non-Critical Data (LocalStorage Fallback / Supabase Direct) ---
  
  getReports: async (workspaceId?: string | null): Promise<MonthlyReport[]> => getLocal(KEYS.REPORTS),
  saveReport: async (report: MonthlyReport) => {
      const current = getLocal<MonthlyReport>(KEYS.REPORTS);
      setLocal(KEYS.REPORTS, [report, ...current]);
  },

  getDashboardLayout: async () => {
      return JSON.parse(localStorage.getItem(KEYS.LAYOUT) || 'null');
  },
  saveDashboardLayout: async (layout: any) => {
      localStorage.setItem(KEYS.LAYOUT, JSON.stringify(layout));
      if (isSupabaseConfigured) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (user) await supabase!.from('profiles').update({ dashboard_layout: layout }).eq('id', user.id);
      }
  },

  // --- WORKSPACE MANAGEMENT (REAL MULTI-TENANT) ---
  
  getWorkspaces: async (): Promise<Workspace[]> => {
      if (isSupabaseConfigured) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user) return [];

          try {
              // Join query to get workspaces where user is a member
              const { data, error } = await supabase!
                  .from('workspace_members')
                  .select('role, workspace:workspaces(*)')
                  .eq('user_id', user.id);

              if (!error && data) {
                  return data.map((item: any) => ({
                      ...item.workspace,
                      role: item.role // Attach the role to the workspace object for context
                  }));
              }
          } catch (e) {
              console.warn("RLS or Network error fetching workspaces", e);
          }
          return [];
      }

      // Fallback to Mock
      const user = await ApiService.auth.getCurrentUser();
      if (!user) return [];
      const allWorkspaces = getLocal<Workspace>(KEYS.WORKSPACES);
      const allMembers = getLocal<WorkspaceMember>(KEYS.WORKSPACE_MEMBERS);
      return allWorkspaces.filter(ws => {
          const isOwner = ws.ownerId === user.id;
          const memberRec = allMembers.find(m => m.workspaceId === ws.id && m.userId === user.id && m.status === 'joined');
          if (isOwner) {
              ws.role = 'owner';
              return true;
          }
          if (memberRec) {
              ws.role = memberRec.role;
              return true;
          }
          return false;
      });
  },
  
  createWorkspace: async (name: string): Promise<Workspace> => {
      if (isSupabaseConfigured) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user) throw new Error("User not found");

          // 1. Create Workspace
          const { data: wsData, error: wsError } = await supabase!
              .from('workspaces')
              .insert({ name, owner_id: user.id, plan: 'starter' })
              .select()
              .single();
          
          if (wsError) throw wsError;

          // 2. Add Creator as Owner in Members
          await supabase!.from('workspace_members').insert({
              workspace_id: wsData.id,
              user_id: user.id,
              role: 'owner',
              status: 'joined'
          });

          return { ...wsData, role: 'owner' };
      }

      // Mock Creation
      const user = await ApiService.auth.getCurrentUser();
      if (!user) throw new Error("User not found");

      const ws: Workspace = { 
          id: generateId(), 
          name, 
          ownerId: user.id, 
          role: 'owner',
          plan: 'starter',
          createdAt: new Date().toISOString()
      };
      
      const list = getLocal<Workspace>(KEYS.WORKSPACES);
      setLocal(KEYS.WORKSPACES, [...list, ws]);

      const members = getLocal<WorkspaceMember>(KEYS.WORKSPACE_MEMBERS);
      const ownerMember: WorkspaceMember = {
          id: generateId(),
          userId: user.id,
          workspaceId: ws.id,
          email: user.email,
          role: 'owner',
          status: 'joined',
          joinedAt: new Date().toISOString()
      };
      setLocal(KEYS.WORKSPACE_MEMBERS, [...members, ownerMember]);

      return ws;
  },

  getWorkspaceMembers: async (id: string): Promise<WorkspaceMember[]> => {
      if (isSupabaseConfigured) {
          try {
              const { data, error } = await supabase!
                  .from('workspace_members')
                  .select('*, user:profiles(name, email, avatar_url)')
                  .eq('workspace_id', id);
              
              if (!error && data) {
                  return data.map((m: any) => ({
                      id: m.id,
                      userId: m.user_id,
                      workspaceId: m.workspace_id,
                      role: m.role,
                      status: m.status,
                      joinedAt: m.created_at,
                      email: m.user?.email || 'N/A',
                      name: m.user?.name,
                      avatar: m.user?.avatar_url
                  }));
              }
          } catch (e) { console.warn("Error fetching workspace members", e); }
          return [];
      }

      // Mock
      const allMembers = getLocal<WorkspaceMember>(KEYS.WORKSPACE_MEMBERS);
      return allMembers.filter(m => m.workspaceId === id);
  },

  removeMember: async (memberId: string) => {
      if (isSupabaseConfigured) {
          await supabase!.from('workspace_members').delete().eq('id', memberId);
      } else {
          const members = getLocal<WorkspaceMember>(KEYS.WORKSPACE_MEMBERS);
          const filtered = members.filter(m => m.id !== memberId);
          setLocal(KEYS.WORKSPACE_MEMBERS, filtered);
      }
  },

  updateMemberRole: async (memberId: string, role: WorkspaceRole) => {
      if (isSupabaseConfigured) {
          await supabase!.from('workspace_members').update({ role }).eq('id', memberId);
      } else {
          const members = getLocal<WorkspaceMember>(KEYS.WORKSPACE_MEMBERS);
          const updated = members.map(m => m.id === memberId ? { ...m, role } : m);
          setLocal(KEYS.WORKSPACE_MEMBERS, updated);
      }
  },

  inviteMember: async (wsId: string, email: string, role: WorkspaceRole) => {
      const targetEmail = email.toLowerCase().trim();
      
      if (isSupabaseConfigured) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          // Check duplicates
          const { data: existing } = await supabase!
              .from('workspace_invites')
              .select('id')
              .eq('workspace_id', wsId)
              .eq('email', targetEmail)
              .eq('status', 'pending');
          
          if (existing && existing.length > 0) throw new Error("Convite já enviado.");

          await supabase!.from('workspace_invites').insert({
              workspace_id: wsId,
              email: targetEmail,
              role,
              inviter_id: user.id,
              status: 'pending'
          });
          // Here we would trigger an Edge Function to send the actual email
          return;
      }

      // Mock
      const user = await ApiService.auth.getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      const wsList = getLocal<Workspace>(KEYS.WORKSPACES);
      const ws = wsList.find(w => w.id === wsId);
      
      const invites = getLocal<WorkspaceInvite>(KEYS.INVITES);
      if (invites.some(i => i.workspaceId === wsId && i.email === targetEmail && i.status === 'pending')) {
          throw new Error("Utilizador já convidado.");
      }

      const newInvite: WorkspaceInvite = {
          id: generateId(),
          workspaceId: wsId,
          workspaceName: ws?.name || 'Workspace',
          inviterName: user.name || user.email,
          role,
          email: targetEmail,
          status: 'pending',
          createdAt: new Date().toISOString()
      };
      setLocal(KEYS.INVITES, [...invites, newInvite]);
  },

  revokeInvite: async (inviteId: string) => {
      if (isSupabaseConfigured) {
          await supabase!.from('workspace_invites').delete().eq('id', inviteId);
      } else {
          const invites = getLocal<WorkspaceInvite>(KEYS.INVITES);
          const filtered = invites.filter(i => i.id !== inviteId);
          setLocal(KEYS.INVITES, filtered);
      }
  },

  getPendingInvites: async (): Promise<WorkspaceInvite[]> => {
      if (isSupabaseConfigured) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user || !user.email) return [];

          try {
              const { data, error } = await supabase!
                  .from('workspace_invites')
                  .select('*, workspace:workspaces(name), inviter:profiles(name)')
                  .eq('email', user.email)
                  .eq('status', 'pending');

              if (!error && data) {
                  return data.map((i: any) => ({
                      id: i.id,
                      workspaceId: i.workspace_id,
                      workspaceName: i.workspace?.name || 'Workspace',
                      inviterName: i.inviter?.name || 'Alguém',
                      role: i.role,
                      email: i.email,
                      status: i.status,
                      createdAt: i.created_at
                  }));
              }
          } catch(e) { console.warn("Error fetching invites", e); }
          return [];
      }

      // Mock
      const user = await ApiService.auth.getCurrentUser();
      if (!user || !user.email) return [];
      const invites = getLocal<WorkspaceInvite>(KEYS.INVITES);
      const userEmail = user.email.toLowerCase().trim();
      return invites.filter(i => i.status === 'pending' && i.email.toLowerCase().trim() === userEmail); 
  },

  getSentInvites: async (workspaceId: string): Promise<WorkspaceInvite[]> => {
      if (isSupabaseConfigured) {
          try {
              const { data, error } = await supabase!
                  .from('workspace_invites')
                  .select('*')
                  .eq('workspace_id', workspaceId)
                  .eq('status', 'pending');
              
              if (!error && data) {
                  return data.map((i: any) => ({
                      id: i.id,
                      workspaceId: i.workspace_id,
                      workspaceName: 'Current',
                      inviterName: 'You',
                      role: i.role,
                      email: i.email,
                      status: i.status,
                      createdAt: i.created_at
                  }));
              }
          } catch (e) { console.warn("Error fetching sent invites", e); }
          return [];
      }

      // Mock
      const invites = getLocal<WorkspaceInvite>(KEYS.INVITES);
      return invites.filter(i => i.workspaceId === workspaceId && i.status === 'pending');
  },

  respondToInvite: async (inviteId: string, accept: boolean) => {
      if (isSupabaseConfigured) {
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user) return;

          if (accept) {
              // 1. Get Invite Details
              const { data: invite } = await supabase!.from('workspace_invites').select('*').eq('id', inviteId).single();
              if (invite) {
                  // 2. Add to Members
                  await supabase!.from('workspace_members').insert({
                      workspace_id: invite.workspace_id,
                      user_id: user.id,
                      role: invite.role,
                      status: 'joined'
                  });
                  // 3. Update Invite Status
                  await supabase!.from('workspace_invites').update({ status: 'accepted' }).eq('id', inviteId);
              }
          } else {
              await supabase!.from('workspace_invites').update({ status: 'rejected' }).eq('id', inviteId);
          }
          return;
      }

      // Mock
      const user = await ApiService.auth.getCurrentUser();
      if (!user || !user.email) return;
      const invites = getLocal<WorkspaceInvite>(KEYS.INVITES);
      let targetInvite: WorkspaceInvite | undefined;
      const updatedInvites = invites.map(inv => {
          if (inv.id === inviteId) {
              targetInvite = inv;
              return { ...inv, status: accept ? 'accepted' : 'rejected' };
          }
          return inv;
      });
      setLocal(KEYS.INVITES, updatedInvites as WorkspaceInvite[]); 
      if (accept && targetInvite) {
          const members = getLocal<WorkspaceMember>(KEYS.WORKSPACE_MEMBERS);
          if (!members.some(m => m.workspaceId === targetInvite!.workspaceId && m.userId === user.id)) {
              const newMember: WorkspaceMember = {
                  id: generateId(),
                  userId: user.id,
                  workspaceId: targetInvite.workspaceId,
                  email: user.email,
                  role: targetInvite.role,
                  status: 'joined'
              };
              setLocal(KEYS.WORKSPACE_MEMBERS, [...members, newMember]);
          }
      }
  },

  // --- Generic Fallback ---
  getAutomations: async () => [],
  saveAutomation: async (a: Automation) => {},
  deleteAutomation: async (id: string) => {},
  getBudgets: async (wsId?: string | null) => [],
  saveBudget: async (b: Budget) => {},
  deleteBudget: async (id: string) => {},
  getSubscriptions: async (wsId?: string | null) => [],
  saveSubscription: async (s: Subscription) => {},
  deleteSubscription: async (id: string) => {},
  getFixedExpenses: async (wsId?: string | null) => [],
  saveFixedExpense: async (f: FixedExpense) => {},
  deleteFixedExpense: async (id: string) => {},
  getRecurringTransactions: async (wsId?: string | null) => [],
  saveRecurringTransaction: async (r: RecurringTransaction) => {},
  deleteRecurringTransaction: async (id: string) => {},
  getAssets: async (wsId?: string | null) => [],
  saveAsset: async (a: Asset) => {},
  deleteAsset: async (id: string) => {},
  getInvestments: async (wsId?: string | null) => [],
  saveInvestment: async (i: Investment) => {},
  deleteInvestment: async (id: string) => {},
  updateUserPreferences: async (currency: CurrencyCode, language: LanguageCode) => {},
  updateUserPlan: async (plan: SubscriptionPlan) => {}
};
