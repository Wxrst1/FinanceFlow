
import React from 'react';
import { Trophy } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const BadgesPage = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> {t('achievements', language)}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface border border-border p-6 rounded-xl text-center opacity-50">
                    <Trophy className="mx-auto mb-2 text-zinc-500" />
                    <span className="text-sm text-zinc-400">Primeiro Passo</span>
                </div>
            </div>
        </div>
    );
};
export default BadgesPage;
