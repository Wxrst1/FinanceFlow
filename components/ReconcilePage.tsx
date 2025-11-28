
import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { ReconcileService } from '../services/reconcileService';
import { Scale, CheckCircle2, AlertTriangle, ArrowRight, Calculator, Wallet, RefreshCw } from 'lucide-react';
import { t } from '../utils';
import { motion } from 'framer-motion';

const ReconcilePage = () => {
    const { accounts, formatMoney, addTransaction, language, currency } = useFinance();
    const { addNotification } = useNotification();

    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [actualBalanceInput, setActualBalanceInput] = useState<string>('');
    const [difference, setDifference] = useState<number>(0);
    
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    // Initialize selection
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accounts]);

    // Calculate on input change
    useEffect(() => {
        if (selectedAccount) {
            const actual = parseFloat(actualBalanceInput);
            if (!isNaN(actual)) {
                const res = ReconcileService.calculateDiscrepancy(selectedAccount.balance, actual);
                setDifference(res.difference);
            } else {
                setDifference(0);
            }
        }
    }, [actualBalanceInput, selectedAccount]);

    const handleAutoFix = () => {
        if (!selectedAccount || difference === 0) return;

        const transaction = ReconcileService.createAdjustmentTransaction(selectedAccount, difference);
        addTransaction(transaction);
        
        addNotification(t('reconcile_success', language), 'success');
        
        // Reset logic basically done by context update, but we can clear input or sync it
        // setActualBalanceInput(''); // Optional: keep it to show match
    };

    const isMatch = Math.abs(difference) < 0.01;
    const isValidInput = !isNaN(parseFloat(actualBalanceInput));

    return (
        <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Scale className="text-blue-500" />
                    {t('reconcile_title', language)}
                </h1>
                <p className="text-text-muted">
                    {t('reconcile_desc', language)}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Input Area */}
                <div className="space-y-6">
                    {/* Account Selector */}
                    <div className="bg-surface border border-border p-6 rounded-xl">
                        <label className="text-sm font-medium text-text-muted mb-2 block">{t('select_account', language)}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {accounts.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => {
                                        setSelectedAccountId(acc.id);
                                        setActualBalanceInput('');
                                        setDifference(0);
                                    }}
                                    className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                                        selectedAccountId === acc.id 
                                            ? 'bg-primary/10 border-primary' 
                                            : 'bg-black/20 border-border hover:bg-white/5'
                                    }`}
                                >
                                    <span className={`text-xs font-bold uppercase tracking-wider ${selectedAccountId === acc.id ? 'text-primary' : 'text-text-muted'}`}>
                                        {acc.type}
                                    </span>
                                    <span className="font-bold text-white truncate w-full">{acc.name}</span>
                                    <span className="text-sm text-text-muted font-mono">{formatMoney(acc.balance)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    {selectedAccount && (
                        <div className="bg-surface border border-border p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Calculator size={20} className="text-zinc-400" />
                                {t('input_actual_balance', language)}
                            </h3>
                            
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xl">
                                    {currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'BRL' ? 'R$' : '€'}
                                </span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    autoFocus
                                    value={actualBalanceInput}
                                    onChange={(e) => setActualBalanceInput(e.target.value)}
                                    className="w-full bg-black/30 border border-border rounded-xl pl-12 pr-4 py-6 text-3xl font-bold text-white focus:outline-none focus:border-primary transition-colors font-mono"
                                    placeholder={selectedAccount.balance.toFixed(2)}
                                />
                            </div>
                            <p className="text-sm text-text-muted mt-3">
                                {t('input_help', language)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Analysis & Action */}
                <div>
                    {!selectedAccount ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border rounded-xl p-12">
                            <Wallet size={48} className="mb-4 opacity-50" />
                            <p>{t('select_account_start', language)}</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                                h-full rounded-xl border p-8 flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors duration-500
                                ${isValidInput && isMatch 
                                    ? 'bg-green-500/10 border-green-500/30' 
                                    : isValidInput 
                                        ? 'bg-red-500/10 border-red-500/30' 
                                        : 'bg-surface border-border'}
                            `}
                        >
                            {!isValidInput ? (
                                <>
                                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                        <Scale size={40} className="text-zinc-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{t('waiting_input', language)}</h3>
                                </>
                            ) : isMatch ? (
                                <>
                                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                        <CheckCircle2 size={48} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{t('balances_match', language)}!</h3>
                                    <p className="text-green-200">{t('system_synced', language)}</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-500">
                                        <AlertTriangle size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t('discrepancy_detected', language)}</h3>
                                    
                                    <div className="bg-black/40 rounded-xl p-4 w-full max-w-xs mb-6 border border-white/5">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-zinc-400">{t('system_balance', language)}:</span>
                                            <span className="text-white font-mono">{formatMoney(selectedAccount.balance)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="text-zinc-400">{t('real_balance', language)}:</span>
                                            <span className="text-white font-mono">{formatMoney(parseFloat(actualBalanceInput))}</span>
                                        </div>
                                        <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg">
                                            <span className="text-red-400">{t('difference', language)}:</span>
                                            <span className="text-red-400">{difference > 0 ? '+' : ''}{formatMoney(difference)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAutoFix}
                                        className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
                                    >
                                        <RefreshCw size={20} />
                                        {t('auto_fix_balance', language)}
                                    </button>
                                    <p className="text-xs text-red-300/60 mt-4 max-w-xs">
                                        {t('auto_fix_desc', language)}
                                    </p>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReconcilePage;
