
import { Transaction } from "../types";
import { generateId } from "../utils";

// Helpers to generate realistic dates
const getDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

interface BankSeedData {
    initialBalance: number;
    transactions: Omit<Transaction, 'id'>[];
}

export const BANK_DATA: Record<string, BankSeedData> = {
    'santander': {
        initialBalance: 1450.25,
        transactions: [
            { description: 'Continente Bom Dia', amount: 45.20, date: getDaysAgo(1), category: 'Alimentação', type: 'expense', tags: ['Supermercado'], accountId: 'demo_account' },
            { description: 'Galp Energia', amount: 65.00, date: getDaysAgo(3), category: 'Transporte', type: 'expense', tags: ['Combustível'], accountId: 'demo_account' },
            { description: 'Salário Mensal', amount: 1800.00, date: getDaysAgo(5), category: 'Salário', type: 'income', tags: ['Trabalho'], accountId: 'demo_account' },
            { description: 'Netflix Assinatura', amount: 15.99, date: getDaysAgo(8), category: 'Assinaturas', type: 'expense', accountId: 'demo_account' },
            { description: 'EDP Comercial', amount: 85.40, date: getDaysAgo(12), category: 'Habitação', type: 'expense', tags: ['Contas'], accountId: 'demo_account' },
            { description: 'Restaurante O Pescador', amount: 34.50, date: getDaysAgo(15), category: 'Lazer', type: 'expense', accountId: 'demo_account' },
            { description: 'Levantamento MB', amount: 20.00, date: getDaysAgo(18), category: 'Outros', type: 'expense', accountId: 'demo_account' },
        ]
    },
    'revolut': {
        initialBalance: 230.50,
        transactions: [
            { description: 'Uber Trip', amount: 7.45, date: getDaysAgo(0), category: 'Transporte', type: 'expense', tags: ['Viagem'], accountId: 'demo_account' },
            { description: 'Spotify Premium', amount: 7.99, date: getDaysAgo(2), category: 'Assinaturas', type: 'expense', accountId: 'demo_account' },
            { description: 'Starbucks Coffee', amount: 4.20, date: getDaysAgo(2), category: 'Alimentação', type: 'expense', accountId: 'demo_account' },
            { description: 'Transferência Recebida', amount: 50.00, date: getDaysAgo(4), category: 'Outros', type: 'income', accountId: 'demo_account' },
            { description: 'Amazon Prime', amount: 4.99, date: getDaysAgo(10), category: 'Assinaturas', type: 'expense', accountId: 'demo_account' },
            { description: 'Bolt Ride', amount: 5.60, date: getDaysAgo(11), category: 'Transporte', type: 'expense', accountId: 'demo_account' },
        ]
    },
    'cgd': {
        initialBalance: 5420.00,
        transactions: [
            { description: 'Crédito Habitação', amount: 650.00, date: getDaysAgo(2), category: 'Habitação', type: 'expense', tags: ['Casa'], accountId: 'demo_account' },
            { description: 'Seguro Automóvel', amount: 320.00, date: getDaysAgo(15), category: 'Transporte', type: 'expense', accountId: 'demo_account' },
            { description: 'Pingo Doce', amount: 88.12, date: getDaysAgo(4), category: 'Alimentação', type: 'expense', accountId: 'demo_account' },
            { description: 'Salário', amount: 2100.00, date: getDaysAgo(25), category: 'Salário', type: 'income', accountId: 'demo_account' }
        ]
    },
    'millennium': {
        initialBalance: 890.00,
        transactions: [
            { description: 'Zara Moda', amount: 45.90, date: getDaysAgo(1), category: 'Lazer', type: 'expense', tags: ['Shopping'], accountId: 'demo_account' },
            { description: 'Cinema NOS', amount: 14.00, date: getDaysAgo(3), category: 'Lazer', type: 'expense', accountId: 'demo_account' },
            { description: 'Ginásio Fitness', amount: 39.90, date: getDaysAgo(5), category: 'Saúde', type: 'expense', accountId: 'demo_account' },
            { description: 'Celeiro Dieta', amount: 23.50, date: getDaysAgo(6), category: 'Saúde', type: 'expense', accountId: 'demo_account' }
        ]
    },
    'default': {
        initialBalance: 500.00,
        transactions: [
            { description: 'Café da Manhã', amount: 3.50, date: getDaysAgo(0), category: 'Alimentação', type: 'expense', accountId: 'demo_account' },
            { description: 'Pagamento Serviços', amount: 45.00, date: getDaysAgo(5), category: 'Habitação', type: 'expense', accountId: 'demo_account' }
        ]
    }
};