
import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { CalendarService, CalendarDayData } from '../services/calendarService';
import { t, formatCurrency } from '../utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';

const FinancialCalendar = () => {
    const { 
        transactions, 
        fixedExpenses, 
        subscriptions, 
        recurringTransactions, 
        language, 
        currency 
    } = useFinance();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarData = useMemo(() => {
        return CalendarService.getMonthData(
            year,
            month,
            transactions,
            fixedExpenses,
            subscriptions,
            recurringTransactions
        );
    }, [year, month, transactions, fixedExpenses, subscriptions, recurringTransactions]);

    const monthName = currentDate.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { month: 'long', year: 'numeric' });

    // Navigation
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Stats for the view
    const totalIncome = calendarData.filter(d => !d.isPadding).reduce((acc, d) => acc + d.income, 0);
    const totalExpense = calendarData.filter(d => !d.isPadding).reduce((acc, d) => acc + d.expense, 0);
    const projectedBalance = totalIncome - totalExpense;

    const weekDays = language === 'pt' 
        ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <CalendarIcon className="text-primary" />
                        {t('calendar_title', language)}
                    </h1>
                    <p className="text-text-muted">{t('calendar_desc', language)}</p>
                </div>

                <div className="flex items-center gap-4 bg-surface border border-border p-1 rounded-xl">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-white font-bold min-w-[140px] text-center capitalize select-none">
                        {monthName}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                    <button onClick={goToToday} className="px-3 py-1 text-xs font-bold uppercase bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors ml-2">
                        {t('today', language)}
                    </button>
                </div>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
                    <span className="text-text-muted text-sm font-medium">Entradas Previstas</span>
                    <span className="text-green-500 font-bold font-mono">{formatCurrency(totalIncome, currency, language)}</span>
                </div>
                <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
                    <span className="text-text-muted text-sm font-medium">Saídas Previstas</span>
                    <span className="text-red-500 font-bold font-mono">{formatCurrency(totalExpense, currency, language)}</span>
                </div>
                <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
                    <span className="text-text-muted text-sm font-medium">Saldo Mensal</span>
                    <span className={`font-bold font-mono ${projectedBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {formatCurrency(projectedBalance, currency, language)}
                    </span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-border bg-black/20">
                    {weekDays.map((day, i) => (
                        <div key={i} className="py-3 text-center text-xs font-bold uppercase text-text-muted tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)] divide-x divide-y divide-border border-l border-t border-border">
                    {calendarData.map((day, i) => (
                        <div 
                            key={i}
                            onClick={() => setSelectedDay(day)}
                            className={`
                                relative p-2 transition-all cursor-pointer group hover:bg-white/5
                                ${day.isPadding ? 'bg-black/40 text-zinc-700' : ''}
                                ${day.isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/50' : ''}
                            `}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`
                                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                    ${day.isToday ? 'bg-primary text-white' : day.isPadding ? 'text-zinc-600' : 'text-zinc-400'}
                                `}>
                                    {day.day}
                                </span>
                                {day.balance < 0 && Math.abs(day.balance) > 100 && !day.isPadding && (
                                    <div className="bg-red-500/20 text-red-500 p-1 rounded-full" title="Dia de Gasto Elevado">
                                        <AlertCircle size={10} />
                                    </div>
                                )}
                            </div>

                            {/* Transaction Indicators */}
                            <div className="space-y-1">
                                {day.income > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded truncate">
                                        <TrendingUp size={10} />
                                        {formatCurrency(day.income, currency, language)}
                                    </div>
                                )}
                                {day.expense > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded truncate">
                                        <TrendingDown size={10} />
                                        {formatCurrency(day.expense, currency, language)}
                                    </div>
                                )}
                            </div>

                            {/* Future Indicator */}
                            {day.isFuture && !day.isPadding && day.transactions.some(t => t.isProjected) && (
                                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full opacity-50" title="Previsão" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Modal */}
            <Modal 
                isOpen={!!selectedDay} 
                onClose={() => setSelectedDay(null)} 
                title={selectedDay ? selectedDay.date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
            >
                {selectedDay && (
                    <div className="space-y-4">
                        <div className="flex gap-4 mb-4 bg-black/20 p-3 rounded-lg">
                            <div className="flex-1 text-center border-r border-white/10">
                                <p className="text-xs text-text-muted uppercase">Entradas</p>
                                <p className="text-green-500 font-bold">{formatCurrency(selectedDay.income, currency, language)}</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-xs text-text-muted uppercase">Saídas</p>
                                <p className="text-red-500 font-bold">{formatCurrency(selectedDay.expense, currency, language)}</p>
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                            {selectedDay.transactions.length === 0 ? (
                                <p className="text-center text-text-muted text-sm py-4">Sem transações para este dia.</p>
                            ) : (
                                selectedDay.transactions.map((tx, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${tx.isProjected ? 'border-blue-500/30 bg-blue-500/5 border-dashed' : 'border-border bg-surface'}`}>
                                        <div>
                                            <p className="text-sm font-medium text-white">{tx.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-text-muted">{tx.category}</span>
                                                {tx.isProjected && <span className="text-[10px] text-blue-400 uppercase font-bold">Previsto</span>}
                                            </div>
                                        </div>
                                        <span className={`font-mono font-bold text-sm ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency, language)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FinancialCalendar;
