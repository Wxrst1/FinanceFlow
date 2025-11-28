
import { Transaction, FixedExpense, RecurringTransaction, ForecastPoint, ForecastSummary, BankAccount } from "../types";

export const ForecastService = {
    
    /**
     * Calcula a taxa média de "queima" diária (gastos variáveis)
     * Baseado nos últimos 90 dias de histórico
     */
    calculateBurnRate: (transactions: Transaction[]): number => {
        const now = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);

        const variableExpenses = transactions.filter(t => 
            t.type === 'expense' && 
            !t.isTransfer && 
            new Date(t.date) >= ninetyDaysAgo &&
            // Excluir categorias que geralmente são fixas ou grandes movimentos únicos
            !['Habitação', 'Investimentos', 'Housing', 'Investment'].includes(t.category) 
        );

        const totalVariable = variableExpenses.reduce((sum, t) => sum + t.amount, 0);
        return totalVariable / 90;
    },

    /**
     * Gera a projeção para os próximos 30 dias
     */
    generateForecast: (
        accounts: BankAccount[],
        fixedExpenses: FixedExpense[],
        recurringTransactions: RecurringTransaction[],
        burnRate: number
    ): { data: ForecastPoint[], summary: ForecastSummary } => {
        const today = new Date();
        let currentTotalBalance = accounts.filter(a => a.enabled).reduce((acc, a) => acc + a.balance, 0);
        
        const forecastData: ForecastPoint[] = [];
        let lowestBalance = currentTotalBalance;
        let lowestBalanceDate = today.toISOString();
        let daysUntilNegative: number | null = null;

        // Ponto inicial (Hoje)
        forecastData.push({
            date: today.toISOString(),
            balance: currentTotalBalance,
            isProjected: false
        });

        // Simular próximos 30 dias
        for (let i = 1; i <= 30; i++) {
            const simulationDate = new Date(today);
            simulationDate.setDate(today.getDate() + i);
            const dayOfMonth = simulationDate.getDate();
            let dailyChange = 0;
            let eventName = '';

            // 1. Subtrair Burn Rate (Gasto Variável Estimado)
            dailyChange -= burnRate;

            // 2. Processar Despesas Fixas
            fixedExpenses.forEach(exp => {
                if (exp.day === dayOfMonth) {
                    dailyChange -= exp.amount;
                    eventName = eventName ? `${eventName}, ${exp.description}` : exp.description;
                }
            });

            // 3. Processar Transações Recorrentes (ex: Salário)
            recurringTransactions.forEach(rec => {
                if (rec.active && rec.dayOfMonth === dayOfMonth) {
                    if (rec.type === 'income') {
                        dailyChange += rec.amount;
                        eventName = eventName ? `${eventName}, ${rec.description}` : rec.description;
                    } else {
                        dailyChange -= rec.amount;
                    }
                }
            });

            // Atualizar Saldo
            currentTotalBalance += dailyChange;

            // Rastrear Mínimos
            if (currentTotalBalance < lowestBalance) {
                lowestBalance = currentTotalBalance;
                lowestBalanceDate = simulationDate.toISOString();
            }

            // Rastrear Quebra de Caixa
            if (currentTotalBalance < 0 && daysUntilNegative === null) {
                daysUntilNegative = i;
            }

            forecastData.push({
                date: simulationDate.toISOString(),
                balance: currentTotalBalance,
                isProjected: true,
                cashflow: dailyChange,
                event: eventName || undefined
            });
        }

        // Determinar Status
        let status: ForecastSummary['status'] = 'safe';
        if (daysUntilNegative !== null && daysUntilNegative < 15) status = 'critical';
        else if (daysUntilNegative !== null || lowestBalance < (currentTotalBalance * 0.1)) status = 'warning';

        const summary: ForecastSummary = {
            monthEndBalance: forecastData[forecastData.length - 1].balance,
            lowestBalance,
            lowestBalanceDate,
            burnRate,
            status,
            daysUntilNegative
        };

        return { data: forecastData, summary };
    }
};
