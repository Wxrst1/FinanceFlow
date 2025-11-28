
import { BankAccount, Goal, Budget, Subscription, FixedExpense, Investment, Automation, Asset } from "@/types";

const getDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

export const DemoData = {
    accounts: [
        { id: 'acc_1', name: 'Santander', type: 'Conta à Ordem', balance: 2450.00, initialBalance: 2450.00, color: '#ef4444', icon: 'Building2', enabled: true, connected: false },
        { id: 'acc_2', name: 'Revolut', type: 'Carteira', balance: 150.50, initialBalance: 150.50, color: '#3b82f6', icon: 'Wallet', enabled: true, connected: false },
        { id: 'acc_3', name: 'Poupança', type: 'Investimento', balance: 5000.00, initialBalance: 5000.00, color: '#22c55e', icon: 'PiggyBank', enabled: true, connected: false }
    ] as BankAccount[],

    transactions: [
        { id: 'tx_1', description: 'Salário Mensal', amount: 1800.00, date: getDaysAgo(2), category: 'Salário', type: 'income', accountId: 'acc_1', tags: ['Trabalho'] },
        { id: 'tx_2', description: 'Continente Bom Dia', amount: 45.20, date: getDaysAgo(1), category: 'Alimentação', type: 'expense', accountId: 'acc_1', tags: ['Supermercado'] },
        { id: 'tx_3', description: 'Uber Trip', amount: 8.50, date: getDaysAgo(3), category: 'Transporte', type: 'expense', accountId: 'acc_2', tags: [] },
        { id: 'tx_4', description: 'Netflix', amount: 15.99, date: getDaysAgo(5), category: 'Assinaturas', type: 'expense', accountId: 'acc_2', tags: [] },
        { id: 'tx_5', description: 'Renda Casa', amount: 650.00, date: getDaysAgo(10), category: 'Habitação', type: 'expense', accountId: 'acc_1', tags: ['Fixo'] },
        { id: 'tx_6', description: 'Ginásio Fitness', amount: 35.00, date: getDaysAgo(12), category: 'Saúde', type: 'expense', accountId: 'acc_1', tags: ['Saúde'] },
        { id: 'tx_7', description: 'Jantar Fora', amount: 60.00, date: getDaysAgo(4), category: 'Lazer', type: 'expense', accountId: 'acc_2', tags: [] },
        { id: 'tx_8', description: 'Combustível', amount: 50.00, date: getDaysAgo(7), category: 'Transporte', type: 'expense', accountId: 'acc_1', tags: [] },
    ] as any[],

    goals: [
        { id: 'goal_1', name: 'Fundo de Emergência', targetAmount: 10000, currentAmount: 5000, color: '#22c55e' },
        { id: 'goal_2', name: 'Férias Verão', targetAmount: 2000, currentAmount: 450, color: '#3b82f6' }
    ] as Goal[],

    budgets: [
        { id: 'bud_1', category: 'Alimentação', amount: 400, alertThreshold: 80 },
        { id: 'bud_2', category: 'Lazer', amount: 150, alertThreshold: 90 },
        { id: 'bud_3', category: 'Transporte', amount: 200, alertThreshold: 80 }
    ] as Budget[],

    subscriptions: [
        { id: 'sub_1', name: 'Netflix', amount: 15.99, billingCycle: 'monthly', nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), category: 'Assinaturas', icon: 'CreditCard', color: '#ef4444', active: true },
        { id: 'sub_2', name: 'Spotify', amount: 7.99, billingCycle: 'monthly', nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), category: 'Assinaturas', icon: 'CreditCard', color: '#22c55e', active: true }
    ] as Subscription[],

    fixedExpenses: [
        { id: 'fix_1', description: 'Renda', amount: 650, day: 1, category: 'Habitação' },
        { id: 'fix_2', description: 'Internet', amount: 40, day: 5, category: 'Habitação' }
    ] as FixedExpense[],

    investments: [
        { id: 'inv_1', name: 'S&P 500 ETF', type: 'etf', initialCost: 1000, currentValue: 1200, quantity: 5, purchaseDate: getDaysAgo(180), workspaceId: null },
        { id: 'inv_2', name: 'Bitcoin', type: 'crypto', initialCost: 500, currentValue: 450, quantity: 0.01, purchaseDate: getDaysAgo(30), workspaceId: null }
    ] as Investment[],

    automations: [
        { id: 'auto_1', name: 'Classificar Uber', matchString: 'Uber', targetCategory: 'Transporte', targetType: 'expense', isActive: true },
        { id: 'auto_2', name: 'Classificar Netflix', matchString: 'Netflix', targetCategory: 'Assinaturas', targetType: 'expense', isActive: true }
    ] as Automation[],

    assets: [
        { id: 'asset_1', name: 'Carro', type: 'vehicle', value: 15000, currency: 'EUR', icon: 'Car', workspaceId: null },
        { id: 'asset_2', name: 'Casa', type: 'real_estate', value: 250000, currency: 'EUR', icon: 'Building', workspaceId: null }
    ] as Asset[]
};
