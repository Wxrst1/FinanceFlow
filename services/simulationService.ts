
import { Transaction, FixedExpense, RecurringTransaction, BankAccount, Scenario, SimulationResult } from "../types";

export const SimulationService = {
    
    /**
     * Calcula o gasto médio diário de uma categoria específica nos últimos 90 dias
     */
    calculateCategoryBurnRate: (transactions: Transaction[], category: string): number => {
        const now = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);

        const categoryExpenses = transactions.filter(t => 
            t.type === 'expense' && 
            !t.isTransfer && 
            t.category === category &&
            new Date(t.date) >= ninetyDaysAgo
        );

        const total = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
        return total / 90;
    },

    calculateGlobalBurnRate: (transactions: Transaction[]): number => {
        const now = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);

        const variableExpenses = transactions.filter(t => 
            t.type === 'expense' && 
            !t.isTransfer && 
            new Date(t.date) >= ninetyDaysAgo &&
            !['Habitação', 'Investimentos', 'Housing', 'Investment'].includes(t.category) 
        );

        const total = variableExpenses.reduce((sum, t) => sum + t.amount, 0);
        return total / 90;
    },

    runSimulation: (
        transactions: Transaction[],
        accounts: BankAccount[],
        fixedExpenses: FixedExpense[],
        recurringTransactions: RecurringTransaction[],
        scenarios: Scenario[]
    ): SimulationResult => {
        const globalBurnRate = SimulationService.calculateGlobalBurnRate(transactions);
        const initialBalance = accounts.filter(a => a.enabled).reduce((acc, a) => acc + a.balance, 0);
        const today = new Date();

        const baselineData: { balance: number, date: string }[] = [];
        const simulatedData: { balance: number, date: string }[] = [];

        let currentBaseline = initialBalance;
        let currentSimulated = initialBalance;

        // Simular 365 dias (1 ano)
        for (let i = 0; i <= 365; i++) {
            const simulationDate = new Date(today);
            simulationDate.setDate(today.getDate() + i);
            const dayOfMonth = simulationDate.getDate();
            const dateStr = simulationDate.toISOString();

            // --- BASELINE CALC ---
            let baselineChange = -globalBurnRate;
            
            // Fixos e Recorrentes Baseline
            fixedExpenses.forEach(f => { if (f.day === dayOfMonth) baselineChange -= f.amount; });
            recurringTransactions.forEach(r => {
                if (r.active && r.dayOfMonth === dayOfMonth) {
                    if (r.type === 'income') baselineChange += r.amount;
                    else baselineChange -= r.amount;
                }
            });

            currentBaseline += baselineChange;
            baselineData.push({ date: dateStr, balance: currentBaseline });

            // --- SIMULATED CALC ---
            let simulatedChange = baselineChange; // Começa igual ao baseline

            // Aplicar Cenários
            scenarios.filter(s => s.active).forEach(scenario => {
                // 1. Cortes de Categoria (Afeta Burn Rate Diário)
                if (scenario.type === 'expense_cut' && scenario.category && scenario.percentage) {
                    const catBurn = SimulationService.calculateCategoryBurnRate(transactions, scenario.category);
                    const saving = catBurn * (scenario.percentage / 100);
                    simulatedChange += saving; // Adiciona o valor poupado
                }

                // 2. Aumento de Rendimento (Mensal)
                if (scenario.type === 'income_boost' && scenario.amount) {
                    // Simular que entra no dia 1 de cada mês (ou hoje se for hoje)
                    if (dayOfMonth === 1 || (i === 0 && dayOfMonth !== 1)) { 
                        simulatedChange += scenario.amount; // Aplica apenas 1x por mês logicamente no dia 1
                        // Nota: para ser mais preciso, devíamos dividir por 30 ou adicionar num dia fixo. 
                        // Vamos assumir dia 1 do mês simulado.
                    }
                }

                // 3. Despesa Recorrente Nova (Mensal)
                if (scenario.type === 'recurring_expense' && scenario.amount) {
                    if (dayOfMonth === 1) {
                        simulatedChange -= scenario.amount;
                    }
                }

                // 4. Compra Única
                if (scenario.type === 'big_purchase' && scenario.amount && scenario.date) {
                    const purchaseDate = new Date(scenario.date);
                    // Verifica se é o dia exato (ignorando hora)
                    if (purchaseDate.getDate() === simulationDate.getDate() && 
                        purchaseDate.getMonth() === simulationDate.getMonth() &&
                        purchaseDate.getFullYear() === simulationDate.getFullYear()) {
                        simulatedChange -= scenario.amount;
                    }
                }
            });

            currentSimulated += simulatedChange;
            simulatedData.push({ date: dateStr, balance: currentSimulated });
        }

        // Calcular Diferenças
        const diff6Months = simulatedData[180].balance - baselineData[180].balance;
        const diff12Months = simulatedData[365].balance - baselineData[365].balance;

        return {
            baseline: baselineData,
            simulated: simulatedData,
            difference6Months: diff6Months,
            difference12Months: diff12Months,
            verdict: diff12Months > 0 ? 'positive' : diff12Months < 0 ? 'negative' : 'neutral'
        };
    }
};
