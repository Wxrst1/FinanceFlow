
import React, { useMemo, useEffect, useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { TrendingUp, AlertTriangle, Trophy, Activity, Lightbulb, ArrowRight, ChevronRight } from 'lucide-react';
import { t } from '../utils';
import { motion } from 'framer-motion';

interface Insight {
  id: string;
  type: 'tip' | 'warning' | 'alert' | 'good';
  title: string;
  message: string;
  icon: React.ElementType;
  color: string;
}

const SmartInsights = () => {
  const { transactions, budget, financialScore, formatMoney, language } = useFinance();
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score number on mount or change
  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(financialScore.score), 100);
    return () => clearTimeout(timer);
  }, [financialScore.score]);

  // Generate textual insights
  const insights = useMemo(() => {
    const result: Insight[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const categoryMap = new Map<string, number>();
    currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    let topCategory = '';
    let topCategoryAmount = 0;
    categoryMap.forEach((amount, cat) => {
      if (amount > topCategoryAmount) {
        topCategoryAmount = amount;
        topCategory = cat;
      }
    });

    if (expenses > 0 && (topCategoryAmount / expenses) > 0.4) {
      result.push({
        id: 'cat-dominance',
        type: 'warning',
        title: t('warning', language),
        message: `A categoria "${topCategory}" representa ${(topCategoryAmount / expenses * 100).toFixed(0)}% das suas despesas.`,
        icon: AlertTriangle,
        color: 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      });
    }

    const highValueThreshold = budget ? budget * 0.2 : 200;
    const largeTransaction = currentMonthTransactions.find(t => t.type === 'expense' && t.amount > highValueThreshold && t.category !== 'Habitação');
    
    if (largeTransaction) {
      result.push({
        id: 'unusual-spend',
        type: 'alert',
        title: t('warning', language),
        message: `Transação de ${formatMoney(largeTransaction.amount)} em "${largeTransaction.description}" pode impactar metas.`,
        icon: TrendingUp,
        color: 'text-red-400 bg-red-400/10 border-red-400/20'
      });
    }

    if (result.length === 0) {
        result.push({
            id: 'generic-good',
            type: 'good',
            title: t('achievement', language),
            message: 'Os seus hábitos de consumo estão estáveis.',
            icon: Trophy,
            color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
        });
    }
    
    return result.slice(0, 2);
  }, [transactions, budget, formatMoney, financialScore, language]);

  // Visual Helpers
  const getGradientId = (score: number) => {
      if (score >= 80) return "gradGreen";
      if (score >= 60) return "gradBlue";
      if (score >= 40) return "gradYellow";
      return "gradRed";
  };
  
  const getColorHex = (score: number) => {
      if (score >= 80) return "#22c55e"; // green-500
      if (score >= 60) return "#3b82f6"; // blue-500
      if (score >= 40) return "#eab308"; // yellow-500
      return "#ef4444"; // red-500
  };

  const activeColor = getColorHex(financialScore.score);

  // Translation for label
  const getScoreLabelKey = (label: string) => {
      if (label === 'Excelente') return 'score_label_excellent';
      if (label === 'Bom') return 'score_label_good';
      if (label === 'Razoável') return 'score_label_reasonable';
      return 'score_label_critical';
  };

  // Gauge Math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((financialScore.score / 100) * (circumference / 2));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Score Card */}
        <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden flex flex-col h-full group hover:border-primary/20 transition-all shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/5 rounded-lg text-white">
                        <Activity size={18} />
                    </div>
                    <h3 className="text-base font-semibold text-white">{t('financial_score', language)}</h3>
                </div>
                <div className="text-xs font-mono text-text-muted bg-white/5 px-2 py-1 rounded border border-white/5">
                    v2.0
                </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-2 relative z-10 w-full">
                {/* SVG Gauge */}
                <div className="relative w-40 h-24 overflow-visible flex justify-center">
                    {/* Background Glow */}
                    <div 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-20 blur-3xl transition-colors duration-1000"
                        style={{ backgroundColor: activeColor }}
                    />

                    <svg className="w-40 h-40 transform origin-center rotate-[180deg]" viewBox="0 0 100 100">
                         <defs>
                             <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                 <stop offset="100%" stopColor="#22c55e" />
                             </linearGradient>
                             <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                 <stop offset="100%" stopColor="#3b82f6" />
                             </linearGradient>
                             <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor="#eab308" stopOpacity="0.2" />
                                 <stop offset="100%" stopColor="#eab308" />
                             </linearGradient>
                             <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                                 <stop offset="100%" stopColor="#ef4444" />
                             </linearGradient>
                         </defs>
                         
                         <circle 
                            cx="50" cy="50" r={radius} 
                            fill="none" 
                            stroke="#27272a" 
                            strokeWidth="6" 
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference / 2}
                            strokeLinecap="round"
                         />
                         
                         <motion.circle 
                            cx="50" cy="50" r={radius} 
                            fill="none" 
                            stroke={`url(#${getGradientId(financialScore.score)})`}
                            strokeWidth="6" 
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }}
                         />
                    </svg>

                    {/* Central Number */}
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                        <div className="text-3xl font-bold text-white tracking-tighter flex items-center justify-center">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {displayScore}
                            </motion.span>
                        </div>
                    </div>
                </div>
                
                <div className="w-full text-center -mt-2">
                    <div 
                        className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/5"
                        style={{ color: activeColor }}
                    >
                        {t(getScoreLabelKey(financialScore.label), language)}
                    </div>
                </div>
            </div>
            
            {/* Breakdown Bars */}
            <div className="mt-4 space-y-3 text-xs border-t border-white/5 pt-4 relative z-10">
                {financialScore.breakdown && Object.entries(financialScore.breakdown).map(([key, item]: [string, any]) => (
                    <div key={key} className="space-y-1">
                        <div className="flex justify-between text-text-muted text-[10px] uppercase tracking-wider">
                            <span>{item.label}</span>
                            <span className={item.score >= 70 ? 'text-green-400' : item.score >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                                {key === 'essentials' ? item.value.toFixed(0) + '%' : 
                                 key === 'savingsRate' ? item.value.toFixed(0) + '%' : 
                                 key === 'emergencyFund' ? item.value.toFixed(1) + 'x' :
                                 formatMoney(item.value)}
                            </span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${item.score >= 70 ? 'bg-green-500' : item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.max(5, Math.min(100, item.score))}%` }} 
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Insights / Tips List */}
        <div className="md:col-span-2 flex flex-col gap-4 h-full">
            
            {/* Primary Tip (Based on lowest score) */}
            {financialScore.tips && financialScore.tips.length > 0 && (
                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-1">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm mb-1">{t('score_diagnosis', language)}</h4>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            {financialScore.tips[0]}
                        </p>
                    </div>
                </div>
            )}

            {/* Standard Insights */}
            <div className="flex flex-col gap-3 flex-1">
                {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className={`
                                flex-1 p-4 rounded-xl border flex items-start gap-4 
                                ${insight.color} 
                                relative overflow-hidden transition-all hover:scale-[1.01]
                            `}
                        >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-black/20 backdrop-blur-sm shrink-0">
                                <Icon size={18} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 bg-black/20 px-2 py-0.5 rounded">
                                        {insight.title}
                                    </span>
                                </div>
                                <p className="text-xs opacity-90 leading-relaxed max-w-xl">
                                    {insight.message}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default SmartInsights;
