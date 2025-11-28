import { z } from 'zod';

// --- Enums ---
export const TransactionTypeSchema = z.enum(['income', 'expense']);
export const SubscriptionPlanSchema = z.enum(['starter', 'free', 'pro', 'business']);

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
});

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
});

export type BankAccount = z.infer<typeof AccountSchema>;

export const RiskAnalysisSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high']),
  burnRate: z.number(),
  daysUntilEmpty: z.number(),
  projectedBalance: z.number(),
});

export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>;
