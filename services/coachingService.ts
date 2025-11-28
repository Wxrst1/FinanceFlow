
import { Transaction, BankAccount, FixedExpense, CoachingPlan, CoachingAction, Asset, LanguageCode } from "../types";
import { generateId } from "../utils";

// MOCK SERVICE: IA desativada temporariamente para resolver erro de importação.
// A lógica abaixo simula uma análise inteligente baseada em regras matemáticas simples.

export const CoachingService = {

    /**
     * Gera um plano de coaching financeiro baseado nos dados do utilizador (VERSÃO MOCK).
     */
    generateCoachingPlan: async (
        transactions: Transaction[],
        accounts: BankAccount[],
        fixedExpenses: FixedExpense[],
        assets: Asset[],
        language: LanguageCode = 'pt'
    ): Promise<CoachingPlan> => {
        
        // Simular delay de rede (para parecer que a IA está a pensar)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Análise Matemática Básica
        const totalLiquidity = accounts.reduce((acc, a) => acc + a.balance, 0);
        const totalDebt = assets.filter(a => a.type === 'liability').reduce((acc, a) => acc + a.value, 0);
        const monthlyFixedCosts = fixedExpenses.reduce((acc, f) => acc + f.amount, 0);
        
        // Calcular média de rendimento e despesa
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        
        const recentExpenses = transactions
            .filter(t => t.type === 'expense' && !t.isTransfer && new Date(t.date) >= threeMonthsAgo)
            .reduce((acc, t) => acc + t.amount, 0);
        
        const recentIncome = transactions
            .filter(t => t.type === 'income' && !t.isTransfer && new Date(t.date) >= threeMonthsAgo)
            .reduce((acc, t) => acc + t.amount, 0);

        const monthlyBurnRate = (recentExpenses / 3) + monthlyFixedCosts;
        const monthlyIncomeAvg = recentIncome / 3;
        const savingsRate = monthlyIncomeAvg > 0 ? (monthlyIncomeAvg - monthlyBurnRate) / monthlyIncomeAvg : 0;

        // 2. Determinação de Fase e Passos (Lógica Heurística Local)
        let phase: 'survival' | 'stability' | 'security' | 'freedom' = 'survival';
        let focusArea = "";
        let steps: CoachingAction[] = [];
        let emergencyTarget = monthlyBurnRate * 6;
        let savingsTarget = 0;

        // Regras de Negócio Simplificadas (Mock Inteligente)
        if (monthlyIncomeAvg < monthlyBurnRate) {
            // Fase Sobrevivência
            phase = 'survival';
            focusArea = language === 'pt' ? "Estancar Gastos e Equilibrar Contas" : "Stop Bleeding and Balance Books";
            savingsTarget = 50; // Meta simbólica
            
            steps = [
                {
                    id: generateId(),
                    title: language === 'pt' ? "Cortar Despesas Supérfluas" : "Cut Non-Essential Spending",
                    description: language === 'pt' ? "Revise as suas subscrições e gastos com lazer. Tente reduzir 15% este mês." : "Review subscriptions and leisure. Try to cut 15% this month.",
                    category: 'optimization',
                    impact: 'high',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Renegociar Contratos Fixos" : "Renegotiate Fixed Contracts",
                    description: language === 'pt' ? "Contacte fornecedores de energia e telecomunicações para baixar faturas." : "Contact utility providers to lower bills.",
                    category: 'savings',
                    impact: 'medium',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Vender Itens Não Usados" : "Sell Unused Items",
                    description: language === 'pt' ? "Gere liquidez imediata vendendo coisas que não precisa." : "Generate quick cash by selling things you don't need.",
                    category: 'debt',
                    impact: 'medium',
                    isCompleted: false
                }
            ];

        } else if (totalLiquidity < monthlyBurnRate * 3) {
            // Fase Estabilidade (Construir Fundo)
            phase = 'stability';
            focusArea = language === 'pt' ? "Construção de Fundo de Emergência" : "Building Emergency Fund";
            savingsTarget = (monthlyIncomeAvg - monthlyBurnRate) * 0.5; // 50% do excedente
            
            steps = [
                {
                    id: generateId(),
                    title: language === 'pt' ? "Automatizar Poupança" : "Automate Savings",
                    description: language === 'pt' ? `Configure uma transferência automática de ${Math.round(savingsTarget)} assim que receber o salário.` : `Set up an auto-transfer of ${Math.round(savingsTarget)} on payday.`,
                    category: 'savings',
                    impact: 'high',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Auditoria de Pequenos Gastos" : "Small Expenses Audit",
                    description: language === 'pt' ? "O 'fator café'. Identifique pequenos gastos diários que somam muito." : "The latte factor. Identify small daily spends.",
                    category: 'optimization',
                    impact: 'low',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Definir Teto Semanal" : "Set Weekly Cap",
                    description: language === 'pt' ? "Estabeleça um limite máximo de gastos para o supermercado." : "Set a hard cap for grocery shopping.",
                    category: 'optimization',
                    impact: 'medium',
                    isCompleted: false
                }
            ];

        } else if (totalDebt > totalLiquidity * 0.5) {
            // Fase Segurança (Pagar Dívida)
            phase = 'security';
            focusArea = language === 'pt' ? "Eliminação de Dívida" : "Debt Elimination";
            savingsTarget = (monthlyIncomeAvg - monthlyBurnRate) * 0.8; // 80% do excedente para dívida
            
            steps = [
                {
                    id: generateId(),
                    title: language === 'pt' ? "Método Avalanche" : "Avalanche Method",
                    description: language === 'pt' ? "Liste as suas dívidas por taxa de juro e abata a mais alta primeiro." : "List debts by interest rate and kill the highest one first.",
                    category: 'debt',
                    impact: 'high',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Consolidar Créditos" : "Consolidate Credits",
                    description: language === 'pt' ? "Verifique se pode juntar créditos para obter uma taxa menor." : "Check if you can consolidate loans for a lower rate.",
                    category: 'debt',
                    impact: 'high',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Congelar Novos Gastos" : "Freeze New Spending",
                    description: language === 'pt' ? "Evite novas compras a crédito nos próximos 30 dias." : "Avoid new credit purchases for 30 days.",
                    category: 'optimization',
                    impact: 'medium',
                    isCompleted: false
                }
            ];

        } else {
            // Fase Liberdade (Investir)
            phase = 'freedom';
            focusArea = language === 'pt' ? "Maximização de Património" : "Wealth Maximization";
            savingsTarget = (monthlyIncomeAvg - monthlyBurnRate);
            
            steps = [
                {
                    id: generateId(),
                    title: language === 'pt' ? "Diversificar Investimentos" : "Diversify Investments",
                    description: language === 'pt' ? "Analise a sua alocação de ativos (ETFs, Ações, Imobiliário)." : "Analyze your asset allocation.",
                    category: 'investing',
                    impact: 'high',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Aumentar Fontes de Rendimento" : "Increase Income Streams",
                    description: language === 'pt' ? "Explore side-hustles ou rendimentos passivos." : "Explore side-hustles or passive income.",
                    category: 'investing',
                    impact: 'medium',
                    isCompleted: false
                },
                {
                    id: generateId(),
                    title: language === 'pt' ? "Otimização Fiscal" : "Tax Optimization",
                    description: language === 'pt' ? "Consulte um contabilista para otimizar os seus impostos." : "Consult a CPA to optimize taxes.",
                    category: 'optimization',
                    impact: 'medium',
                    isCompleted: false
                }
            ];
        }

        // Retornar o plano simulado
        return {
            phase,
            focusArea: `${focusArea} (Plano Gerado)`,
            monthlySavingsTarget: Math.max(0, savingsTarget),
            emergencyFundTarget: Math.max(1000, emergencyTarget),
            steps,
            generatedAt: new Date().toISOString()
        };
    }
};
