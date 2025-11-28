
import { Transaction, Budget, FixedExpense, AdvisorInsight, LanguageCode } from "../types";
import { t, generateId } from "../utils";

export const AiAdvisor = {
    analyze: (
        transactions: Transaction[],
        budgets: Budget[],
        fixedExpenses: FixedExpense[],
        currentBalance: number,
        language: LanguageCode = 'pt'
    ): AdvisorInsight[] => {
        const insights: AdvisorInsight[] = [];
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Filter Data
        const activeTransactions = transactions.filter(t => !t.isTransfer);
        const currentMonthTx = activeTransactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const expenses = currentMonthTx.filter(t => t.type === 'expense');
        
        // 1. TREND DETECTION (Comparing to 3-month average)
        // Calculate category totals for current month
        const categoryTotals: Record<string, number> = {};
        expenses.forEach(tx => {
            categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        });

        // Calculate averages
        const pastTransactions = activeTransactions.filter(tx => {
            const d = new Date(tx.date);
            const isPast = d < new Date(currentYear, currentMonth, 1);
            const isRecent = d > new Date(currentYear, currentMonth - 3, 1);
            return isPast && isRecent && tx.type === 'expense';
        });

        const pastCategoryTotals: Record<string, number> = {};
        pastTransactions.forEach(tx => {
            pastCategoryTotals[tx.category] = (pastCategoryTotals[tx.category] || 0) + tx.amount;
        });

        // Check for spikes (> 20% increase)
        Object.keys(categoryTotals).forEach(cat => {
            const current = categoryTotals[cat];
            const avg = (pastCategoryTotals[cat] || 0) / 3; // Approximate 3 month avg
            
            if (avg > 50 && current > avg * 1.2) {
                const percent = ((current - avg) / avg) * 100;
                insights.push({
                    id: generateId(),
                    type: 'trend',
                    title: t('advisor_trend_title', language),
                    message: t('advisor_trend_msg', language)
                        .replace('{category}', cat)
                        .replace('{percent}', percent.toFixed(0)),
                    severity: 'warning',
                    relatedCategory: cat
                });
            }
        });

        // 2. ANOMALY DETECTION (Single large transaction)
        // Identify transactions > 30% of total monthly spend so far (if total > 500)
        const totalSpent = expenses.reduce((sum, tx) => sum + tx.amount, 0);
        if (totalSpent > 500) {
            expenses.forEach(tx => {
                if (tx.amount > totalSpent * 0.4 && tx.category !== 'Habitação' && tx.category !== 'Investimentos') {
                    insights.push({
                        id: generateId(),
                        type: 'anomaly',
                        title: t('advisor_anomaly_title', language),
                        message: t('advisor_anomaly_msg', language)
                            .replace('{amount}', tx.amount.toFixed(2))
                            .replace('{description}', tx.description),
                        severity: 'info'
                    });
                }
            });
        }

        // 3. FORECAST / RISK
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dayOfMonth = today.getDate();
        const dailyAvg = totalSpent / dayOfMonth;
        const projectedSpend = totalSpent + (dailyAvg * (daysInMonth - dayOfMonth));
        
        // Pending Fixed Expenses
        const pendingFixed = fixedExpenses
            .filter(f => f.day > dayOfMonth)
            .reduce((sum, f) => sum + f.amount, 0);

        const finalBalance = currentBalance - (projectedSpend - totalSpent) - pendingFixed;

        if (finalBalance < 0) {
            insights.push({
                id: generateId(),
                type: 'forecast',
                title: t('advisor_risk_title', language),
                message: t('advisor_risk_msg', language),
                severity: 'critical',
                action: 'Review Budget'
            });
        } else if (finalBalance < 200) {
             insights.push({
                id: generateId(),
                type: 'forecast',
                title: t('advisor_low_balance_title', language),
                message: t('advisor_low_balance_msg', language),
                severity: 'warning'
            });
        }

        // 4. SAVINGS OPPORTUNITY
        // If Subscriptions > 10% of total expenses
        const subTotal = categoryTotals['Assinaturas'] || categoryTotals['Subscriptions'] || 0;
        if (totalSpent > 0 && (subTotal / totalSpent) > 0.15) {
             insights.push({
                id: generateId(),
                type: 'saving',
                title: t('advisor_saving_title', language),
                message: t('advisor_saving_sub_msg', language),
                severity: 'info'
            });
        }

        // Generic good news if no issues
        if (insights.length === 0) {
            insights.push({
                id: generateId(),
                type: 'trend',
                title: t('advisor_good_title', language),
                message: t('advisor_good_msg', language),
                severity: 'positive'
            });
        }

        return insights.slice(0, 4); // Limit to top 4 insights
    }
};