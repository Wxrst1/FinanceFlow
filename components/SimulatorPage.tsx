
import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { SimulationService } from '../services/simulationService';
import { Scenario } from '../types';
import { FlaskConical, Trash2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import ScenarioForm from './ScenarioForm';
import SimulatorGraph from './SimulatorGraph';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../utils';

const SimulatorPage = () => {
    const { transactions, accounts, fixedExpenses, recurringTransactions, formatMoney, language } = useFinance();
    const [scenarios, setScenarios] = useState<Scenario[]>([]);

    // Executar simulação sempre que os cenários mudam
    const result = useMemo(() => {
        return SimulationService.runSimulation(
            transactions,
            accounts,
            fixedExpenses,
            recurringTransactions,
            scenarios
        );
    }, [transactions, accounts, fixedExpenses, recurringTransactions, scenarios]);

    const addScenario = (s: Scenario) => {
        setScenarios(prev => [...prev, s]);
    };

    const removeScenario = (id: string) => {
        setScenarios(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="p-8 animate-fade-in max-w-6xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <FlaskConical className="text-blue-500" />
                    {t('simulator_title', language)}
                </h1>
                <p className="text-text-muted">
                    {t('simulator_desc', language)}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Controls & List */}
                <div className="space-y-6">
                    <ScenarioForm onAdd={addScenario} />

                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border bg-black/20">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">{t('active_scenarios', language)}</h3>
                        </div>
                        <div className="divide-y divide-border">
                            <AnimatePresence>
                                {scenarios.length === 0 && (
                                    <div className="p-6 text-center text-text-muted text-sm italic">
                                        {t('no_scenarios', language)}
                                    </div>
                                )}
                                {scenarios.map(s => (
                                    <motion.div 
                                        key={s.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <div>
                                            <p className="text-white font-medium text-sm">{s.description}</p>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {s.type === 'expense_cut' && `${t('scenario_expense_cut', language)} ${s.percentage}% - ${s.category}`}
                                                {s.type === 'income_boost' && `+${formatMoney(s.amount || 0)}/mês`}
                                                {s.type === 'big_purchase' && `-${formatMoney(s.amount || 0)}`}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => removeScenario(s.id)}
                                            className="text-zinc-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right: Graph & Results */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Impact Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-5 rounded-xl border ${result.difference6Months >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">{t('impact_6_months', language)}</p>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${result.difference6Months >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {result.difference6Months >= 0 ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                                {result.difference6Months >= 0 ? '+' : ''}{formatMoney(result.difference6Months)}
                            </div>
                        </div>
                        <div className={`p-5 rounded-xl border ${result.difference12Months >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">{t('impact_12_months', language)}</p>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${result.difference12Months >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {result.difference12Months >= 0 ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                                {result.difference12Months >= 0 ? '+' : ''}{formatMoney(result.difference12Months)}
                            </div>
                        </div>
                    </div>

                    <SimulatorGraph result={result} />

                    {result.verdict === 'positive' && scenarios.length > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <ArrowRight size={20} />
                            </div>
                            <p className="text-sm text-blue-200">
                                {t('scenario_positive_msg', language)} <strong>{formatMoney(result.difference12Months)}</strong> {t('scenario_extra_year', language)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimulatorPage;
