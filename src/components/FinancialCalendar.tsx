
import React from 'react';
import { Calendar } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const FinancialCalendar = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary" /> {t('calendar_title', language)}
            </h1>
            <div className="bg-surface border border-border p-12 rounded-xl text-center h-[500px] flex items-center justify-center">
                <p className="text-text-muted">Vista de calendário indisponível.</p>
            </div>
        </div>
    );
};
export default FinancialCalendar;
