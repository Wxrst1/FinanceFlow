
import React, { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, LineChart as LineChartIcon, AlertOctagon, Layout, Save, RotateCcw, X, Grip, PiggyBank, ArrowUpRight, ArrowDownRight, Minus, PieChart } from 'lucide-react';
import { MonthlyChart, CategoryChart, WeeklyChart, ExpenseHeatmap, AccountBalanceChart } from './Charts';
import Modal from './Modal';
import TransactionForm from './TransactionForm';
import { useFinance } from '../contexts/FinanceContext';
import { getPreviousMonthData, t } from '../utils';
import { useNotification } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import SmartInsights from './SmartInsights';
import AdvisorWidget from './AdvisorWidget';
import ForecastCard from './ForecastCard';
import LevelCard from './LevelCard';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardLayoutItem, LanguageCode } from '../types';
import _ from 'lodash';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Helper Components ---

// Generic Wrapper for consistent look
const WidgetWrapper = ({ children, titleKey, icon: Icon, language }: { children?: React.ReactNode, titleKey?: string, icon?: any, language: LanguageCode }) => (
    <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col overflow-hidden shadow-sm relative hover:border-border/80 transition-colors">
        {titleKey && (
            <div className="flex items-center gap-2 mb-4 text-text-muted">
                {Icon && <Icon size={16} />}
                <h3 className="text-sm font-semibold uppercase tracking-wider">{t(titleKey, language)}</h3>
            </div>
        )}
        <div className="flex-1 min-h-0 relative">{children}</div>
    </div>
);

// 1. Individual Stat Widgets
const StatWidget = ({ type }: { type: 'income' | 'expense' | 'balance' | 'savings' }) => {
    const { transactions, formatMoney, language } = useFinance();
    const { currentIncome, currentExpense, balance, prevIncome, prevExpense, prevBalance } = getPreviousMonthData(transactions);

    const getChange = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    let data = { label: '', value: '', change: 0, icon: Wallet, color: '', inverse: false };

    switch (type) {
        case 'income':
            data = { label: t('income', language), value: formatMoney(currentIncome), change: getChange(currentIncome, prevIncome), icon: TrendingUp, color: 'text-emerald-500', inverse: false };
            break;
        case 'expense':
            data = { label: t('expenses', language), value: formatMoney(currentExpense), change: getChange(currentExpense, prevExpense), icon: TrendingDown, color: 'text-red-500', inverse: true };
            break;
        case 'balance':
            data = { label: t('balance', language), value: formatMoney(balance), change: getChange(balance, prevBalance), icon: Wallet, color: 'text-blue-500', inverse: false };
            break;
        case 'savings':
            const rate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;
            const prevRate = prevIncome > 0 ? ((prevIncome - prevExpense) / prevIncome) * 100 : 0;
            data = { label: t('savings_rate', language), value: `${rate.toFixed(1)}%`, change: rate - prevRate, icon: PiggyBank, color: 'text-yellow-500', inverse: false };
            break;
    }

    const Icon = data.icon;
    const isPositive = data.change > 0;
    const isGood = data.inverse ? !isPositive : isPositive;
    const changeColor = data.change === 0 ? 'text-text-muted' : isGood ? 'text-emerald-500' : 'text-red-500';
    const ChangeIcon = data.change === 0 ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col justify-between hover:border-primary/20 transition-colors">
            <div className="flex justify-between items-start">
                <span className="text-text-muted font-medium text-sm">{data.label}</span>
                <div className={`p-2 rounded-lg bg-white/5 ${data.color}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">{data.value}</div>
                <div className={`flex items-center text-xs font-medium ${changeColor}`}>
                    <ChangeIcon size={14} className="mr-1" />
                    {Math.abs(data.change).toFixed(1)}{type === 'savings' ? '%' : '%'} <span className="text-text-muted ml-1 font-normal">{t('vs_prev_month', language)}</span>
                </div>
            </div>
        </div>
    );
};

// 3. Budget Bar Widget
function BudgetBar() {
    const { budget, transactions, formatMoney, language } = useFinance();
    if (!budget) return (
        <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col justify-center items-center text-center hover:border-border/80 transition-colors">
            <Wallet size={24} className="text-text-muted mb-2 opacity-50" />
            <span className="text-sm text-text-muted">Sem orçamento definido</span>
        </div>
    );

    const currentMonth = new Date().getMonth();
    const currentExpenses = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && t.type === 'expense' && !t.isTransfer;
    }).reduce((acc, t) => acc + t.amount, 0);
    
    const budgetPercentage = Math.min(100, (currentExpenses / budget) * 100);
    let budgetColor = 'bg-primary';
    if (budgetPercentage > 75) budgetColor = 'bg-yellow-500';
    if (budgetPercentage > 90) budgetColor = 'bg-red-500';

    return (
        <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col justify-center relative overflow-hidden hover:border-primary/20 transition-colors">
             <div className="flex justify-between items-end mb-3 relative z-10">
                <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">{t('monthly_budget', language)}</h3>
                    <div className="text-2xl font-bold text-white">{formatMoney(budget - currentExpenses)} <span className="text-sm font-normal text-text-muted">{t('remaining', language)}</span></div>
                </div>
                <div className={`p-2 rounded-lg ${budgetPercentage > 90 ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <Wallet size={20} />
                </div>
             </div>
             <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                  <div style={{ width: `${budgetPercentage}%` }} className={`h-full ${budgetColor} rounded-full relative transition-all duration-1000`}></div>
             </div>
             <div className="flex justify-between text-xs mt-2 text-text-muted">
                 <span>{formatMoney(currentExpenses)} {t('spent', language)}</span>
                 <span>{budgetPercentage.toFixed(0)}%</span>
             </div>
        </div>
    );
}

// 4. Net Worth Widget
function NetWorthWidget() {
    const { netWorth, formatMoney, language } = useFinance();
    return (
        <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col justify-center hover:border-primary/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-text-muted uppercase tracking-wider font-bold">{t('total_net_worth', language)}</span>
                <TrendingUp size={16} className="text-green-500" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{formatMoney(netWorth)}</div>
        </div>
    );
}

// --- WIDGET REGISTRY ---
const getWidgets = (language: LanguageCode) => ({
    summary_income: { component: () => <StatWidget type="income" /> },
    summary_expense: { component: () => <StatWidget type="expense" /> },
    summary_balance: { component: () => <StatWidget type="balance" /> },
    summary_savings: { component: () => <StatWidget type="savings" /> },
    forecast: { component: ForecastCard }, 
    advisor: { component: AdvisorWidget },
    insights: { component: SmartInsights },
    budget: { component: BudgetBar },
    networth: { component: NetWorthWidget },
    level_card: { component: LevelCard },
    chart_monthly: { component: () => <WidgetWrapper titleKey="monthly_flow" language={language}><MonthlyChart /></WidgetWrapper> },
    chart_category: { component: () => <WidgetWrapper titleKey="expenses_by_category" icon={PieChart} language={language}><CategoryChart /></WidgetWrapper> },
    chart_weekly: { component: () => <WidgetWrapper titleKey="weekly_spend" language={language}><WeeklyChart /></WidgetWrapper> },
    chart_heatmap: { component: () => <WidgetWrapper titleKey="daily_activity" language={language}><ExpenseHeatmap /></WidgetWrapper> },
    chart_account: { component: () => <WidgetWrapper titleKey="account_evolution" language={language}><AccountBalanceChart /></WidgetWrapper> },
});

// --- LAYOUT DEFINITIONS ---
const LAYOUTS = {
    lg: [
        // Row 1: Summary Cards
        { i: 'summary_income', x: 0, y: 0, w: 1, h: 2 },
        { i: 'summary_expense', x: 1, y: 0, w: 1, h: 2 },
        { i: 'summary_balance', x: 2, y: 0, w: 1, h: 2 },
        { i: 'summary_savings', x: 3, y: 0, w: 1, h: 2 },
        
        // Row 2: Main Charts + Forecast
        { i: 'chart_monthly', x: 0, y: 2, w: 2, h: 4 },
        { i: 'forecast', x: 2, y: 2, w: 2, h: 4 },

        // Row 3: Insights
        { i: 'insights', x: 0, y: 6, w: 2, h: 4 },
        { i: 'advisor', x: 2, y: 6, w: 1, h: 4 },
        { i: 'level_card', x: 3, y: 6, w: 1, h: 4 },

        // Row 4: Analysis
        { i: 'chart_account', x: 0, y: 10, w: 2, h: 8 },
        { i: 'chart_weekly', x: 2, y: 10, w: 2, h: 2 },
        { i: 'networth', x: 2, y: 12, w: 2, h: 2 },
        { i: 'chart_category', x: 2, y: 14, w: 2, h: 4 },
        
        // Row 5: Heatmap
        { i: 'chart_heatmap', x: 0, y: 18, w: 4, h: 3 },
        { i: 'budget', x: 0, y: 21, w: 4, h: 2 }
    ],
    md: [
        { i: 'summary_income', x: 0, y: 0, w: 1, h: 2 },
        { i: 'summary_expense', x: 1, y: 0, w: 1, h: 2 },
        { i: 'summary_balance', x: 0, y: 2, w: 1, h: 2 },
        { i: 'summary_savings', x: 1, y: 2, w: 1, h: 2 },
        { i: 'chart_monthly', x: 0, y: 4, w: 2, h: 4 },
        { i: 'forecast', x: 0, y: 8, w: 2, h: 4 },
        { i: 'insights', x: 0, y: 12, w: 2, h: 4 },
        { i: 'advisor', x: 0, y: 16, w: 1, h: 4 },
        { i: 'level_card', x: 1, y: 16, w: 1, h: 4 },
        { i: 'chart_account', x: 0, y: 20, w: 2, h: 4 },
        { i: 'chart_weekly', x: 0, y: 24, w: 1, h: 2 },
        { i: 'networth', x: 1, y: 24, w: 1, h: 2 },
        { i: 'chart_category', x: 0, y: 26, w: 2, h: 4 },
        { i: 'chart_heatmap', x: 0, y: 30, w: 2, h: 3 },
    ],
    sm: [
        { i: 'summary_balance', x: 0, y: 0, w: 1, h: 2 },
        { i: 'forecast', x: 0, y: 2, w: 1, h: 4 },
        { i: 'summary_income', x: 0, y: 6, w: 1, h: 2 },
        { i: 'summary_expense', x: 0, y: 8, w: 1, h: 2 },
        { i: 'level_card', x: 0, y: 10, w: 1, h: 3 },
        { i: 'chart_monthly', x: 0, y: 13, w: 1, h: 4 },
        { i: 'budget', x: 0, y: 17, w: 1, h: 2 },
        { i: 'advisor', x: 0, y: 19, w: 1, h: 4 },
        { i: 'insights', x: 0, y: 23, w: 1, h: 4 },
        { i: 'chart_account', x: 0, y: 27, w: 1, h: 4 },
        { i: 'chart_weekly', x: 0, y: 31, w: 1, h: 2 },
        { i: 'networth', x: 0, y: 33, w: 1, h: 2 },
        { i: 'chart_category', x: 0, y: 35, w: 1, h: 4 },
        { i: 'chart_heatmap', x: 0, y: 39, w: 1, h: 3 },
    ]
};

const Dashboard = () => {
  const { 
      budget, updateBudget, language, dashboardLayout, saveDashboardLayout, riskAnalysis, formatMoney
  } = useFinance();
  const { addNotification } = useNotification();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<any>(LAYOUTS);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState(budget?.toString() || '');

  const currentMonthName = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', { month: 'long', year: 'numeric' });
  const widgets = getWidgets(language);

  useEffect(() => {
      if (dashboardLayout && dashboardLayout.lg && dashboardLayout.lg.length > 0) {
          const hasForecast = dashboardLayout.lg.some((item: any) => item.i === 'forecast');
          const hasLevel = dashboardLayout.lg.some((item: any) => item.i === 'level_card');
          
          if (!hasForecast || !hasLevel) {
              setLayouts(LAYOUTS);
              saveDashboardLayout(LAYOUTS);
          } else {
              setLayouts(dashboardLayout);
          }
      } else {
          setLayouts(LAYOUTS);
      }
  }, [dashboardLayout, saveDashboardLayout]);

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
      setLayouts(allLayouts);
  };

  const saveCurrentLayout = () => {
      saveDashboardLayout(layouts);
      setIsEditMode(false);
      addNotification(t('preferences_updated', language), 'success');
  };

  const resetLayout = () => {
      setLayouts(LAYOUTS);
      saveDashboardLayout(LAYOUTS);
      addNotification(t('preferences_updated', language), 'info');
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudget(Number(newBudgetAmount));
    setIsBudgetModalOpen(false);
    addNotification(t('preferences_updated', language), 'success');
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in space-y-6 pb-32 max-w-[1600px] mx-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('dashboard', language)}</h1>
          <p className="text-text-muted capitalize">{currentMonthName}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
            {isEditMode ? (
                <>
                    <button onClick={saveCurrentLayout} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        <Save size={16} /> {t('save_changes', language)}
                    </button>
                    <button onClick={resetLayout} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button onClick={() => setIsEditMode(false)} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        <X size={16} /> {t('cancel', language)}
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 bg-surface border border-border hover:bg-zinc-800 text-text-muted hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm">
                        <Layout size={16} /> <span className="hidden sm:inline">{t('edit', language)}</span>
                    </button>
                    <button onClick={() => setIsBudgetModalOpen(true)} className="flex items-center gap-2 bg-surface border border-border hover:bg-zinc-800 text-text-muted hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm">
                        <Wallet size={16} /> <span className="hidden sm:inline">{t('budget', language)}</span>
                    </button>
                    <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20 text-sm">
                        <Plus size={18} /> <span className="hidden sm:inline">{t('new_transaction', language)}</span>
                    </button>
                </>
            )}
        </div>
      </div>

      {/* Risk Alert (Static, always top) */}
      {riskAnalysis.riskLevel === 'high' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-500"><AlertOctagon size={24} /></div>
              <div>
                  <h3 className="font-bold text-white text-lg">Risco Financeiro Elevado</h3>
                  <p className="text-red-200 text-sm">Taxa de queima: <strong>{formatMoney(riskAnalysis.burnRate)}/dia</strong>. Saldo esgota em {riskAnalysis.daysUntilEmpty.toFixed(0)} dias.</p>
              </div>
          </motion.div>
      )}

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 768, sm: 480 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        rowHeight={100}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".grid-drag-handle"
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
      >
        {layouts.lg.map((item: any) => {
            const WidgetConfig = widgets[item.i];
            if (!WidgetConfig) return null;
            const Component = WidgetConfig.component;

            return (
                <div key={item.i} className={`bg-transparent ${isEditMode ? 'border-2 border-dashed border-primary/50 rounded-xl relative z-50 bg-black/50' : ''}`}>
                    {isEditMode && (
                        <div className="grid-drag-handle absolute top-2 right-2 z-50 cursor-move p-1.5 bg-primary rounded-lg text-white hover:bg-primary-hover shadow-lg">
                            <Grip size={16} />
                        </div>
                    )}
                    <div className={`h-full ${isEditMode ? 'pointer-events-none opacity-60 blur-[1px]' : ''}`}>
                        <Component />
                    </div>
                </div>
            );
        })}
      </ResponsiveGridLayout>

      {/* Modals */}
      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={t('new_transaction', language)}>
        <TransactionForm onClose={() => setIsTransactionModalOpen(false)} />
      </Modal>

      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title={t('monthly_budget', language)}>
        <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('value', language)}</label>
                <input
                    type="number"
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-lg transition-colors">
                {t('confirm', language)}
            </button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
