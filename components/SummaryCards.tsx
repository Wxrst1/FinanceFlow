
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { getPreviousMonthData, t } from '../utils';

const SummaryCards = () => {
  const { transactions, formatMoney, language } = useFinance();
  
  const { 
    currentIncome, 
    currentExpense, 
    balance, 
    prevIncome, 
    prevExpense 
  } = getPreviousMonthData(transactions);

  const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;

  // Helper to calculate percentage change
  const getPercentageChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
  };

  const incomeChange = getPercentageChange(currentIncome, prevIncome);
  const expenseChange = getPercentageChange(currentExpense, prevExpense);

  const cards = [
    {
      label: t('income', language),
      value: formatMoney(currentIncome),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      change: incomeChange,
      inverse: false // Higher is better
    },
    {
      label: t('expenses', language),
      value: formatMoney(currentExpense),
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      change: expenseChange,
      inverse: true // Lower is better
    },
    {
      label: t('balance', language),
      value: formatMoney(balance),
      icon: Wallet,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: t('savings_rate', language),
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  const renderChange = (change?: number, inverse?: boolean) => {
      if (change === undefined) return null;
      if (change === 0) return <span className="text-text-muted text-xs flex items-center"><Minus size={12} className="mr-1"/> 0% {t('vs_prev_month', language)}</span>;
      
      const isPositive = change > 0;
      const isGood = inverse ? !isPositive : isPositive;
      const colorClass = isGood ? 'text-green-500' : 'text-red-500';
      const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

      return (
          <span className={`${colorClass} text-xs flex items-center font-medium`}>
              <Icon size={14} className="mr-1" />
              {Math.abs(change).toFixed(1)}% {t('vs_prev_month', language)}
          </span>
      );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-surface border border-border p-6 rounded-xl hover:border-border/80 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-muted font-medium text-sm">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon size={20} className={card.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight mb-1">
              {card.value}
            </div>
            {renderChange(card.change, card.inverse)}
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
