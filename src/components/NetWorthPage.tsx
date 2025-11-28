
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const NetWorthPage = () => {
    const { language, netWorth, formatMoney } = useFinance();
    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-green-500" /> {t('net_worth_title', language)}
            </h1>
            <div className="bg-surface border border-border p-8 rounded-xl text-center">
                <p className="text-sm text-text-muted uppercase font-bold">Património Líquido Total</p>
                <h2 className="text-4xl font-bold text-white mt-2">{formatMoney(netWorth)}</h2>
            </div>
        </div>
    );
};
export default NetWorthPage;
