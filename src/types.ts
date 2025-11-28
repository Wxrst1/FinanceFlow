export type TransactionType = 'income' | 'expense';

export type SubscriptionPlan = 'starter' | 'free' | 'pro' | 'business';

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'BRL' | 'JPY';
export type LanguageCode = 'pt' | 'en';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type Permission = 'manage_workspace' | 'manage_members' | 'manage_billing' | 'create_data' | 'edit_data' | 'delete_data' | 'view_data';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  plan: SubscriptionPlan;
  role?: WorkspaceRole;
  createdAt?: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  role: WorkspaceRole;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  email: string;
  name?: string;
  role: WorkspaceRole;
  status: 'pending' | 'joined';
  avatar?: string;
  joinedAt?: string;
}

export interface ApiKey {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: string;
  type: TransactionType;
  tags?: string[];
  accountId: string;
  isTransfer?: boolean;
  transferId?: string;
  isPersisted?: boolean;
  workspaceId?: string | null;
  // Sync fields
  version?: number;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  workspaceId?: string | null;
  // Sync fields
  version?: number;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  alertThreshold: number;
  workspaceId?: string | null;
}

export interface BudgetAnalysis {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  projected: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextPaymentDate: string;
  category: string;
  icon: string;
  color: string;
  active: boolean;
  workspaceId?: string | null;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  plan?: SubscriptionPlan;
  currency?: CurrencyCode;
  language?: LanguageCode;
  dashboardLayout?: any;
}

export interface Automation {
  id: string;
  name: string;
  matchString: string;
  targetCategory: string;
  targetType: TransactionType;
  isActive: boolean;
  targetAccountId?: string;
  conditions?: any;
  actions?: any;
  triggerType?: string;
  workspaceId?: string | null;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  day: number;
  category: string;
  workspaceId?: string | null;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  frequency: 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  lastRun?: string;
  nextRun: string;
  active: boolean;
  accountId?: string;
  workspaceId?: string | null;
}

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  initialBalance: number;
  color: string;
  icon: string;
  enabled: boolean;
  workspaceId?: string | null;
  
  bankName?: string; 
  accountType?: string;
  lastSync?: string;
  connected?: boolean;
  providerAccountId?: string;
  accessToken?: string;
  // Sync fields
  version?: number;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type AssetType = 'real_estate' | 'vehicle' | 'investment' | 'crypto' | 'cash' | 'other' | 'liability';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  currency: string;
  icon?: string;
  workspaceId?: string | null;
}

export type InvestmentType = 'stock' | 'etf' | 'crypto' | 'real_estate' | 'gold' | 'ppr' | 'vehicle' | 'bond' | 'other';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  initialCost: number;
  currentValue: number;
  quantity?: number;
  purchaseDate?: string;
  notes?: string;
  workspaceId?: string | null;
}

export interface FinancialScore {
  score: number;
  label: 'Crítico' | 'Razoável' | 'Bom' | 'Excelente';
  breakdown: {
    savingsRate: { score: number; value: number; label: string };
    essentials: { score: number; value: number; label: string };
    emergencyFund: { score: number; value: number; label: string };
    growth: { score: number; value: number; label: string };
  };
  tips: string[];
}

export interface RiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  burnRate: number;
  daysUntilEmpty: number;
  projectedBalance: number;
}

export type InsightType = 'trend' | 'anomaly' | 'budget' | 'saving' | 'forecast' | 'good' | 'warning' | 'alert' | 'tip';

export interface AdvisorInsight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'positive';
  action?: string;
  relatedCategory?: string;
  icon?: any;
  color?: string;
}

export interface ReportData {
  month: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  topCategories: { name: string; amount: number; percentage: number }[];
  forecast: {
    predictedTotalExpense: number;
    remainingDays: number;
    dailyAverage: number;
  };
  variations: {
    incomeChange: number;
    expenseChange: number;
  };
}

export interface MonthlyReport {
  id: string;
  workspaceId: string | null;
  month: number;
  year: number;
  data: ReportData;
  narrative: {
    summary: string;
    trends: string[];
    tips: string[];
  };
  createdAt: string;
}

export type CoachingPhase = 'survival' | 'stability' | 'security' | 'freedom';

export interface CoachingAction {
  id: string;
  title: string;
  description: string;
  category: 'savings' | 'debt' | 'investing' | 'optimization';
  impact: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  targetAmount?: number;
}

export interface CoachingPlan {
  phase: CoachingPhase;
  focusArea: string;
  monthlySavingsTarget: number;
  emergencyFundTarget: number;
  steps: CoachingAction[];
  generatedAt: string;
}

export interface ForecastPoint {
  date: string;
  balance: number;
  isProjected: boolean;
  cashflow?: number;
  event?: string;
}

export interface ForecastSummary {
  monthEndBalance: number;
  lowestBalance: number;
  lowestBalanceDate: string;
  burnRate: number;
  status: 'safe' | 'warning' | 'critical';
  daysUntilNegative: number | null;
}

export type ScenarioType = 'expense_cut' | 'income_boost' | 'big_purchase' | 'recurring_expense';

export interface Scenario {
    id: string;
    type: ScenarioType;
    category?: string;
    percentage?: number;
    amount?: number;
    description: string;
    active: boolean;
    date?: string;
}

export interface SimulationResult {
    baseline: { balance: number, date: string }[];
    simulated: { balance: number, date: string }[];
    difference6Months: number;
    difference12Months: number;
    verdict: 'positive' | 'negative' | 'neutral';
}

export interface Achievement {
    id: string;
    titleKey: string;
    descKey: string;
    icon: string;
    isUnlocked: boolean;
    progress?: number;
}

export interface UserLevel {
    currentLevel: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
    nextLevel: 'Prata' | 'Ouro' | 'Platina' | 'Max';
    progress: number;
    score: number;
}

export type NotificationType = 'budget_exceeded' | 'subscription_renewal' | 'goal_reached' | 'negative_forecast' | 'monthly_report';

export interface NotificationSetting {
    id: string;
    type: NotificationType;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    threshold?: number;
}

export interface DashboardLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardLayout {
  lg: DashboardLayoutItem[];
  md: DashboardLayoutItem[];
  sm: DashboardLayoutItem[];
}

export interface Debt {
  id: string;
  name: string;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number;
  category?: string;
  workspaceId?: string | null;
  // Sync fields
  version?: number;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type DebtStrategy = 'snowball' | 'avalanche';

export interface PayoffProjection {
  debtFreeDate: Date;
  totalInterestPaid: number;
  monthsToPayoff: number;
  monthlyAmortization: {
    month: number;
    balance: number;
    interestPaid: number;
    principalPaid: number;
  }[];
}

export interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  user: User | null;
  isAuthenticated: boolean;
}