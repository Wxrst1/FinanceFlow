
import React from 'react';
import { CreditCard } from 'lucide-react';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';

const SubscriptionsPage = () => {
    const { language, subscriptions, formatMoney } = useFinance();
    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="text-pink-500" /> {t('subscriptions_title', language)}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptions.map(sub => (
                    <div key={sub.id} className="bg-surface border border-border p-6 rounded-xl">
                        <h3 className="text-white font-bold">{sub.name}</h3>
                        <p className="text-white font-mono mt-2">{formatMoney(sub.amount)} / {sub.billingCycle}</p>
                    </div>
                ))}
                {subscriptions.length === 0 && <p className="text-text-muted col-span-3">Nenhuma subscrição ativa.</p>}
            </div>
        </div>
    );
};
export default SubscriptionsPage;
