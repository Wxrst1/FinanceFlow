
import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { CoachingService } from '../services/coachingService';
import { CoachingPlan } from '../types';
import { t } from '../utils';
import { Sparkles, Target, Shield, TrendingUp, Loader2, Zap, Lock } from 'lucide-react';
import CoachingCard from './CoachingCard';
import UpgradeModal from './UpgradeModal';
import { motion } from 'framer-motion';

const CoachingPage = () => {
  const { transactions, accounts, fixedExpenses, assets, user, language, checkAccess } = useFinance();
  const [plan, setPlan] = useState<CoachingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const isPro = checkAccess('automations'); // Using automations tier as proxy for Pro features

  useEffect(() => {
      // Try to load cached plan from local storage to avoid API calls on every render
      const savedPlan = localStorage.getItem('financeflow_coaching_plan');
      if (savedPlan) {
          setPlan(JSON.parse(savedPlan));
      }
  }, []);

  const handleGeneratePlan = async () => {
      if (!isPro) {
          setIsUpgradeModalOpen(true);
          return;
      }

      setIsLoading(true);
      try {
          const newPlan = await CoachingService.generateCoachingPlan(
              transactions,
              accounts,
              fixedExpenses,
              assets,
              language
          );
          setPlan(newPlan);
          localStorage.setItem('financeflow_coaching_plan', JSON.stringify(newPlan));
      } catch (error) {
          console.error("Failed to generate plan", error);
      } finally {
          setIsLoading(false);
      }
  };

  const toggleStep = (id: string) => {
      if (!plan) return;
      const updatedSteps = plan.steps.map(s => 
          s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
      );
      const updatedPlan = { ...plan, steps: updatedSteps };
      setPlan(updatedPlan);
      localStorage.setItem('financeflow_coaching_plan', JSON.stringify(updatedPlan));
  };

  const getPhaseInfo = (phase: string) => {
      switch(phase) {
          case 'survival': return { label: t('phase_survival', language), color: 'text-red-500', bg: 'bg-red-500/10', desc: t('phase_survival_desc', language) || 'Foco em cobrir despesas básicas e parar de criar dívida.' };
          case 'stability': return { label: t('phase_stability', language), color: 'text-yellow-500', bg: 'bg-yellow-500/10', desc: t('phase_stability_desc', language) || 'Construção de fundo de emergência inicial.' };
          case 'security': return { label: t('phase_security', language), color: 'text-blue-500', bg: 'bg-blue-500/10', desc: t('phase_security_desc', language) || 'Pagamento de dívidas e aumento da poupança.' };
          default: return { label: t('phase_freedom', language), color: 'text-green-500', bg: 'bg-green-500/10', desc: t('phase_freedom_desc', language) || 'Maximização de investimentos e riqueza.' };
      }
  };

  const phaseInfo = plan ? getPhaseInfo(plan.phase) : null;
  const progress = plan ? (plan.steps.filter(s => s.isCompleted).length / plan.steps.length) * 100 : 0;

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-yellow-500" fill="currentColor" fillOpacity={0.2} />
            {t('coach_ai_title', language)}
          </h1>
          <p className="text-text-muted max-w-xl">
            {t('coach_ai_desc', language)}
          </p>
        </div>
        
        <button
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg
                ${isPro 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white shadow-yellow-900/20' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }
            `}
        >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : isPro ? <Zap size={20} /> : <Lock size={20} />}
            <span>{isLoading ? t('analyzing', language) : t('generate_new_plan', language)}</span>
        </button>
      </div>

      {!plan && !isLoading && (
          <div className="text-center py-24 bg-surface border border-border rounded-2xl border-dashed">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
                  <Target size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('no_active_plan', language)}</h3>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                  {t('click_generate', language)}
              </p>
          </div>
      )}

      {plan && phaseInfo && (
          <div className="space-y-8">
              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Phase Card */}
                  <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden">
                      <div className={`absolute top-0 right-0 p-3 opacity-10 ${phaseInfo.color}`}>
                          <Target size={80} />
                      </div>
                      <div className="relative z-10">
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{t('current_phase', language)}</p>
                          <h2 className={`text-2xl font-bold mb-1 ${phaseInfo.color}`}>{phaseInfo.label}</h2>
                          <p className="text-xs text-zinc-400">{phaseInfo.desc}</p>
                      </div>
                  </div>

                  {/* Focus Card */}
                  <div className="bg-surface border border-border p-6 rounded-xl md:col-span-2 relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{t('main_focus', language)}</p>
                      <h2 className="text-2xl font-bold text-white mb-1">"{plan.focusArea}"</h2>
                      
                      <div className="mt-4 flex gap-6 text-sm">
                          <div>
                              <span className="text-zinc-500 block text-xs">{t('savings_goal', language)}</span>
                              <span className="font-mono text-green-400 font-bold">€{plan.monthlySavingsTarget}</span>
                          </div>
                          <div>
                              <span className="text-zinc-500 block text-xs">{t('emergency_fund_ideal', language)}</span>
                              <span className="font-mono text-blue-400 font-bold">€{plan.emergencyFundTarget}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-surface border border-border px-6 py-4 rounded-xl flex items-center gap-4">
                  <span className="text-sm font-bold text-white whitespace-nowrap">{t('plan_progress', language)}</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                  </div>
                  <span className="text-sm font-mono text-primary">{progress.toFixed(0)}%</span>
              </div>

              {/* Steps List */}
              <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Shield size={18} className="text-primary" />
                      {t('concrete_steps', language)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.steps.map(step => (
                          <CoachingCard key={step.id} action={step} onToggle={toggleStep} />
                      ))}
                  </div>
              </div>
          </div>
      )}

      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
};

export default CoachingPage;
