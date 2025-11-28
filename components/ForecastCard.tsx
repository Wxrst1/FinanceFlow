
import React, { useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { ForecastService } from '../services/forecastService';
import { TrendingUp, AlertTriangle, CalendarClock, TrendingDown, LineChart } from 'lucide-react';
import ForecastGraph from './ForecastGraph';
import { t } from '../utils';

const ForecastCard = () => {
    const { transactions, accounts, fixedExpenses, recurringTransactions, formatMoney, language } = useFinance();

    const { data, summary } = useMemo(() => {
        const burnRate = ForecastService.calculateBurnRate(transactions);
        return ForecastService.generateForecast(accounts, fixedExpenses, recurringTransactions, burnRate);
    }, [transactions, accounts, fixedExpenses, recurringTransactions]);

    const isCritical = summary.status === 'critical';
    const isWarning = summary.status === 'warning';

    return (
        <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500/20 text-red-500' : isWarning ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        <LineChart size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Previsão 30 Dias</h3>
                        <p className="text-xs text-text-muted">Simulação baseada no histórico e fixos</p>
                    </div>
                </div>
                {summary.daysUntilNegative !== null && (
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={12} />
                        Risco em {summary.daysUntilNegative} dias
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Fim do Mês</span>
                    <span className={`font-mono font-bold ${summary.monthEndBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                        {formatMoney(summary.monthEndBalance)}
                    </span>
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Mínimo</span>
                    <span className="font-mono font-bold text-yellow-500">
                        {formatMoney(summary.lowestBalance)}
                    </span>
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Gasto Diário</span>
                    <span className="font-mono font-bold text-zinc-400">
                        -{formatMoney(summary.burnRate)}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 border-t border-white/5 pt-4">
                <ForecastGraph data={data} />
            </div>
        </div>
    );
};

export default ForecastCard;
