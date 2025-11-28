
import React from 'react';
import { Wallet } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const BudgetsPage = () => {
    const { language, budgets, formatMoney } = useFinance();
    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Wallet className="text-green-500" /> {t('budgets_title', language)}
            </h1>
            <div className="space-y-4">
                {budgets.map(b => (
                    <div key={b.id} className="bg-surface border border-border p-6 rounded-xl flex justify-between items-center">
                        <span className="text-white font-bold">{b.category}</span>
                        <span className="text-white font-mono">{formatMoney(b.amount)}</span>
                    </div>
                ))}
                {budgets.length === 0 && <p className="text-text-muted">Sem orçamentos definidos.</p>}
            </div>
        </div>
    );
};
export default BudgetsPage;
