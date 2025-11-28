
import React from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { t } from '@/utils';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdvisorWidget = () => {
  const { advisorInsights, language } = useFinance();

  const getIcon = (type: string) => {
      switch(type) {
          case 'trend': return TrendingUp;
          case 'anomaly': return AlertTriangle;
          case 'forecast': return AlertTriangle;
          case 'saving': return Lightbulb;
          case 'budget': return ArrowUpRight;
          case 'good': return CheckCircle2;
          default: return Sparkles;
      }
  };

  const getColor = (severity: string) => {
      switch(severity) {
          case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
          case 'warning': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
          case 'positive': return 'bg-green-500/10 text-green-500 border-green-500/20';
          default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      }
  };

  return (
    <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Sparkles size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white">{t('advisor_title', language)}</h3>
                <p className="text-xs text-text-muted">{t('advisor_desc', language)}</p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        <AnimatePresence>
            {advisorInsights.map((insight, index) => {
                const Icon = getIcon(insight.type);
                const colorClass = getColor(insight.severity);
                
                return (
                    <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border flex gap-3 ${colorClass}`}
                    >
                        <div className="mt-0.5 shrink-0">
                            <Icon size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold mb-1 opacity-90">{insight.title}</h4>
                            <p className="text-xs opacity-80 leading-relaxed">{insight.message}</p>
                            {insight.action && (
                                <button className="mt-2 text-xs font-bold underline opacity-90 hover:opacity-100">
                                    {insight.action}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </AnimatePresence>
        
        {advisorInsights.length === 0 && (
            <div className="text-center py-10 text-text-muted">
                <p>A analisar dados...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorWidget;
