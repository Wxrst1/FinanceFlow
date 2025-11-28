
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const Settings = () => {
    const { language, user } = useFinance();
    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <SettingsIcon className="text-primary" /> {t('settings_title', language)}
            </h1>
            <div className="bg-surface border border-border p-6 rounded-xl">
                <h3 className="text-white font-bold mb-2">Perfil</h3>
                <p className="text-text-muted">Email: {user?.email}</p>
                <p className="text-text-muted">Plano: {user?.plan}</p>
            </div>
        </div>
    );
};
export default Settings;
