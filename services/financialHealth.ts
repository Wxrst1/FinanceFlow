
import { Transaction, BankAccount, FixedExpense, FinancialScore, LanguageCode } from "../types";
import { t } from "../utils";

export const FinancialHealthService = {
    calculateScore: (
        transactions: Transaction[],
        accounts: BankAccount[],
        fixedExpenses: FixedExpense[],
        language: LanguageCode = 'pt'
    ): FinancialScore => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter Transactions (Current Month)
        const currentTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && !t.isTransfer;
        });

        // Filter Transactions (Previous Month for Growth)
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear && !t.isTransfer;
        });

        // Totals
        const income = currentTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = currentTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const prevIncome = prevTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const prevExpenses = prevTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const totalLiquidity = accounts.reduce((acc, a) => acc + a.balance, 0);
        const totalFixed = fixedExpenses.reduce((acc, f) => acc + f.amount, 0);

        // 1. Savings Rate (Weight 40%)
        let savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        let savingsScore = 0;
        if (savingsRate >= 20) savingsScore = 100;
        else if (savingsRate >= 10) savingsScore = 70;
        else if (savingsRate > 0) savingsScore = 50;
        else savingsScore = 0;

        // 2. Essential Ratio (Weight 30%) - 50/30/20 Rule
        // Heuristic: Essential = Housing, Food, Health, Education, Transport
        const essentialCats = ['Habitação', 'Housing', 'Alimentação', 'Food', 'Saúde', 'Health', 'Educação', 'Education', 'Transporte', 'Transport', 'Fixed', 'Fixas'];
        const essentialExpenses = currentTxs
            .filter(t => t.type === 'expense' && essentialCats.some(c => t.category.includes(c)))
            .reduce((acc, t) => acc + t.amount, 0);
        
        let essentialRatio = income > 0 ? (essentialExpenses / income) * 100 : 0;
        let essentialScore = 0;
        if (essentialRatio <= 50) essentialScore = 100;
        else if (essentialRatio <= 60) essentialScore = 80;
        else if (essentialRatio <= 70) essentialScore = 60;
        else if (essentialRatio <= 90) essentialScore = 30;
        else essentialScore = 0;

        // 3. Emergency Fund / Solvency (Weight 20%)
        // Target: 6 months of fixed expenses
        let monthsCovered = totalFixed > 0 ? totalLiquidity / totalFixed : 0;
        let fundScore = 0;
        if (monthsCovered >= 6) fundScore = 100;
        else if (monthsCovered >= 3) fundScore = 70;
        else if (monthsCovered >= 1) fundScore = 40;
        else fundScore = 10;

        // 4. Growth / Consistency (Weight 10%)
        // Current Balance vs Previous Month Balance (Net)
        const currentNet = income - expenses;
        const prevNet = prevIncome - prevExpenses;
        let growthScore = 0;
        if (currentNet > prevNet) growthScore = 100;
        else if (currentNet > 0) growthScore = 70;
        else growthScore = 20;

        // Final Weighted Score
        const finalScore = Math.round(
            (savingsScore * 0.4) +
            (essentialScore * 0.3) +
            (fundScore * 0.2) +
            (growthScore * 0.1)
        );

        let label: FinancialScore['label'] = 'Razoável';
        if (finalScore >= 80) label = 'Excelente';
        else if (finalScore >= 60) label = 'Bom';
        else if (finalScore < 40) label = 'Crítico';

        // Generate Tips
        const tips: string[] = [];
        const lowestMetric = Math.min(savingsScore, essentialScore, fundScore, growthScore);

        if (savingsScore === lowestMetric) tips.push(t('score_tip_savings', language));
        if (essentialScore === lowestMetric) tips.push(t('score_tip_essentials', language));
        if (fundScore === lowestMetric) tips.push(t('score_tip_fund', language));
        if (growthScore === lowestMetric) tips.push(t('score_tip_growth', language));

        // Fallback tip if they are all good but not perfect
        if (tips.length === 0 && finalScore < 100) {
            tips.push(t('advisor_good_msg', language));
        }

        return {
            score: finalScore,
            label,
            breakdown: {
                savingsRate: { score: savingsScore, value: savingsRate, label: t('score_breakdown_savings', language) },
                essentials: { score: essentialScore, value: essentialRatio, label: t('score_breakdown_essentials', language) },
                emergencyFund: { score: fundScore, value: monthsCovered, label: t('score_breakdown_fund', language) },
                growth: { score: growthScore, value: currentNet, label: t('score_breakdown_growth', language) }
            },
            tips
        };
    }
};
