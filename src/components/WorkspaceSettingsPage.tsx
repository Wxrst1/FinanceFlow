
import React from 'react';
import { Briefcase } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const WorkspaceSettingsPage = () => {
    const { language, currentWorkspace } = useFinance();
    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Briefcase className="text-purple-500" /> {t('workspace_settings', language)}
            </h1>
            <div className="bg-surface border border-border p-6 rounded-xl">
                <h3 className="text-white font-bold mb-2">Espaço Atual: {currentWorkspace?.name || 'Pessoal'}</h3>
            </div>
        </div>
    );
};
export default WorkspaceSettingsPage;
