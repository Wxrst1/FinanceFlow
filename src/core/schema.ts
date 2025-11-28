
import { z } from 'zod';

// --- Enums ---
export const TransactionTypeSchema = z.enum(['income', 'expense']);
export const SubscriptionPlanSchema = z.enum(['starter', 'free', 'pro', 'business']);
export const DebtStrategySchema = z.enum(['snowball', 'avalanche']);

// --- Base Schema for Sync ---
const SyncableSchema = z.object({
  version: z.number().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
});

// --- Schemas ---

export const TransactionSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.number().positive("O valor deve ser positivo"),
  date: z.string(), // ISO String
  category: z.string(),
  type: TransactionTypeSchema,
  tags: z.array(z.string()).optional().default([]),
  accountId: z.string(),
  isTransfer: z.boolean().optional(),
  transferId: z.string().optional(),
  workspaceId: z.string().nullable().optional(),
  isPersisted: z.boolean().optional(),
}).merge(SyncableSchema);

export type Transaction = z.infer<typeof TransactionSchema>;

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.string(),
  balance: z.number(),
  initialBalance: z.number(),
  color: z.string(),
  icon: z.string(),
  enabled: z.boolean(),
  workspaceId: z.string().nullable().optional(),
  
  // Campos bancários opcionais
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  lastSync: z.string().optional(),
  connected: z.boolean().optional(),
  providerAccountId: z.string().optional(),
  accessToken: z.string().optional(),
}).merge(SyncableSchema);

export type BankAccount = z.infer<typeof AccountSchema>;

export const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  deadline: z.string().optional(),
  color: z.string(),
  workspaceId: z.string().nullable().optional(),
}).merge(SyncableSchema);

export type Goal = z.infer<typeof GoalSchema>;

export const RiskAnalysisSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high']),
  burnRate: z.number(),
  daysUntilEmpty: z.number(),
  projectedBalance: z.number(),
});

export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>;

export const DebtSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome da dívida obrigatória"),
  currentBalance: z.number().positive("O saldo devedor deve ser positivo"),
  interestRate: z.number().min(0, "A taxa de juro não pode ser negativa"), // Taxa anual (APR)
  minimumPayment: z.number().positive("Pagamento mínimo obrigatório"),
  dueDate: z.number().min(1).max(31), // Dia do mês
  category: z.string().optional(),
  workspaceId: z.string().nullable().optional(),
}).merge(SyncableSchema);

export type Debt = z.infer<typeof DebtSchema>;
export type DebtStrategy = z.infer<typeof DebtStrategySchema>;

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