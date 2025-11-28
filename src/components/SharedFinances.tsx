
import React from 'react';
import { Users } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const SharedFinances = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="text-purple-500" /> {t('shared_finances', language)}
            </h1>
            <div className="bg-surface border border-border p-12 rounded-xl text-center">
                <p className="text-text-muted">Funcionalidade de equipas disponível no plano Business.</p>
            </div>
        </div>
    );
};
export default SharedFinances;
