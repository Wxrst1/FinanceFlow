
import React from 'react';
import { Scale } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const ReconcilePage = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Scale className="text-orange-500" /> {t('reconcile_title', language)}
            </h1>
            <div className="bg-surface border border-border p-12 rounded-xl text-center">
                <p className="text-text-muted">Ferramenta de ajuste de saldo manual vs real.</p>
            </div>
        </div>
    );
};
export default ReconcilePage;
