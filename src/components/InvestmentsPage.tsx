
import React from 'react';
import { LineChart } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const InvestmentsPage = () => {
    const { language, investments } = useFinance();
    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <LineChart className="text-blue-500" /> {t('investments_title', language)}
            </h1>
            <div className="bg-surface border border-border p-12 rounded-xl text-center">
                <p className="text-text-muted">{investments.length === 0 ? 'Nenhum investimento registado.' : `${investments.length} ativos monitorizados.`}</p>
            </div>
        </div>
    );
};
export default InvestmentsPage;
