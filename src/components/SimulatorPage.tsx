
import React from 'react';
import { FlaskConical } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const SimulatorPage = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <FlaskConical className="text-blue-500" /> {t('simulator_title', language)}
            </h1>
            <div className="bg-surface border border-border p-12 rounded-xl text-center">
                <p className="text-text-muted">Simulador de cenários financeiros (FIRE, Compra de Casa).</p>
            </div>
        </div>
    );
};
export default SimulatorPage;
