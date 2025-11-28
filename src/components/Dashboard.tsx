
import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Minus, PieChart, LineChart } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useUIStore } from '@/stores/ui.store';
import { MonthlyChart, CategoryChart, WeeklyChart, ExpenseHeatmap, AccountBalanceChart } from '@/components/Charts';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';
import { t, formatCurrency, getPreviousMonthData } from '@/utils';
import ForecastCard from '@/components/ForecastCard';
import SmartInsights from '@/components/SmartInsights';
import AdvisorWidget from '@/components/AdvisorWidget';
import LevelCard from '@/components/LevelCard';

const StatWidget = ({ label, value, change, icon: Icon, color, inverse }: any) => {
    const isPositive = change > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const changeColor = change === 0 ? 'text-text-muted' : isGood ? 'text-emerald-500' : 'text-red-500';
    const ChangeIcon = change === 0 ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="bg-surface border border-border p-6 rounded-xl h-full flex flex-col justify-between hover:border-primary/20 transition-colors shadow-sm">
            <div className="flex justify-between items-start">
                <span className="text-text-muted font-medium text-sm">{label}</span>
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">{value}</div>
                <div className={`flex items-center text-xs font-medium ${changeColor}`}>
                    <ChangeIcon size={14} className="mr-1" />
                    {Math.abs(change).toFixed(1)}% <span className="text-text-muted ml-1 font-normal">vs mês anterior</span>
                </div>
            </div>
        </div>
    );
};

// Simple Wrapper for Charts
const Widget = ({ title, icon: Icon, children, className }: any) => (
    <div className={`bg-surface border border-border p-6 rounded-xl flex flex-col shadow-sm ${className}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            {Icon && <Icon size={18} className="text-text-muted" />}
            {title}
        </h3>
        <div className="flex-1 min-h-0 relative">
            {children}
        </div>
    </div>
);

const Dashboard = () => {
  const { user, transactions } = useFinance();
  const { language, currency } = useUIStore();
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const currentMonthName = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', { month: 'long', year: 'numeric' });

  // Calculate stats directly from Context Data
  const { currentIncome, currentExpense, balance, prevIncome, prevExpense, prevBalance } = getPreviousMonthData(transactions);
  const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;
  const prevSavingsRate = prevIncome > 0 ? ((prevIncome - prevExpense) / prevIncome) * 100 : 0;

  const getChange = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

  return (
    <div className="p-4 md:p-8 animate-fade-in space-y-6 pb-32 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('dashboard', language)}</h1>
          <p className="text-text-muted capitalize">{currentMonthName} • {user?.name || 'Convidado'}</p>
        </div>
        
        <button 
            onClick={() => setIsTransactionModalOpen(true)} 
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-medium shadow-lg shadow-green-900/20 text-sm transition-all"
        >
            <Plus size={18} /> {t('new_transaction', language)}
        </button>
      </div>

      {/* Main Grid Layout (CSS Grid - Stable & Robust) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Row 1: KPI Cards */}
          <StatWidget label={t('income', language)} value={formatCurrency(currentIncome, currency, language)} change={getChange(currentIncome, prevIncome)} icon={TrendingUp} color="text-emerald-500" />
          <StatWidget label={t('expenses', language)} value={formatCurrency(currentExpense, currency, language)} change={getChange(currentExpense, prevExpense)} icon={TrendingDown} color="text-red-500" inverse />
          <StatWidget label={t('balance', language)} value={formatCurrency(balance, currency, language)} change={getChange(balance, prevBalance)} icon={Wallet} color="text-blue-500" />
          <StatWidget label={t('savings_rate', language)} value={`${savingsRate.toFixed(1)}%`} change={savingsRate - prevSavingsRate} icon={PiggyBank} color="text-yellow-500" />

          {/* Row 2: Charts (Spanning) */}
          <div className="md:col-span-2 lg:col-span-2 min-h-[400px]">
             <Widget title="Fluxo Mensal" icon={LineChart} className="h-full">
                <MonthlyChart />
             </Widget>
          </div>
          <div className="md:col-span-2 lg:col-span-2 min-h-[400px]">
             <ForecastCard />
          </div>

          {/* Row 3: Insights & Education */}
          <div className="md:col-span-2 min-h-[350px]">
            <SmartInsights />
          </div>
          <div className="min-h-[350px]">
            <AdvisorWidget />
          </div>
          <div className="min-h-[350px]">
            <LevelCard />
          </div>

          {/* Row 4: Secondary Charts */}
          <div className="md:col-span-2 min-h-[400px]">
             <Widget title="Evolução Patrimonial" icon={TrendingUp} className="h-full">
                <AccountBalanceChart />
             </Widget>
          </div>
          <div className="md:col-span-1 min-h-[400px]">
             <Widget title="Gasto Semanal" className="h-full">
                <WeeklyChart />
             </Widget>
          </div>
          <div className="md:col-span-1 min-h-[400px]">
             <Widget title="Categorias" icon={PieChart} className="h-full">
                <CategoryChart />
             </Widget>
          </div>

          {/* Row 5: Heatmap */}
          <div className="col-span-full min-h-[250px]">
             <Widget title="Mapa de Atividade" className="h-full">
                <ExpenseHeatmap />
             </Widget>
          </div>
      </div>

      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={t('new_transaction', language)}>
        <TransactionForm onClose={() => setIsTransactionModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;
