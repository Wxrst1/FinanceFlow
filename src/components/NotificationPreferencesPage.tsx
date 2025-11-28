
import React from 'react';
import { Bell } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const NotificationPreferencesPage = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="text-primary" /> {t('notifications_prefs', language)}
            </h1>
            <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-white">Alertas de Orçamento</span>
                    <div className="w-10 h-6 bg-primary rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                </div>
            </div>
        </div>
    );
};
export default NotificationPreferencesPage;
