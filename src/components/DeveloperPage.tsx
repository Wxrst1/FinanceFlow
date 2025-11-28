
import React from 'react';
import { Terminal } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const DeveloperPage = () => {
    const { language } = useFinance();
    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Terminal className="text-green-500" /> {t('developer_title', language)}
            </h1>
            <div className="bg-black/50 border border-border p-6 rounded-xl font-mono text-sm text-zinc-300">
                <p>// API Access Tokens</p>
                <p className="mt-2 text-green-400">sk_live_51Mx...</p>
            </div>
        </div>
    );
};
export default DeveloperPage;
