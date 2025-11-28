
import React from 'react';
import { GraduationCap } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const CoachingPage = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <GraduationCap className="text-yellow-500" /> {t('coaching_title', language)}
            </h1>
            <div className="bg-surface border border-border p-8 rounded-xl text-center">
                <h3 className="text-xl text-white font-bold mb-2">Plano Financeiro Personalizado</h3>
                <p className="text-text-muted">A IA está a analisar os seus dados para gerar o próximo passo.</p>
            </div>
        </div>
    );
};
export default CoachingPage;
