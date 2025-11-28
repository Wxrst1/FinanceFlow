import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { TrendingUp, Plus, PieChart, AlertCircle, LineChart } from 'lucide-react';
import { t } from '../utils';
import { Investment } from '../types';
import Modal from './Modal';
import InvestmentForm from './InvestmentForm';
import InvestmentCard from './InvestmentCard';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const InvestmentsPage = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment, formatMoney, language } = useFinance();
  const { addNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Stats
  const totalInvested = investments.reduce((acc, i) => acc + i.initialCost, 0);
  const currentValue = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalProfit = currentValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // Chart Data
  const chartData = useMemo(() => {
      const map = new Map<string, number>();
      investments.forEach(i => {
          map.set(i.type, (map.get(i.type) || 0) + i.currentValue);
      });
      return Array.from(map.entries()).map(([name, value]) => ({ 
          name: t(`inv_${name}`, language), 
          value 
      })).sort((a, b) => b.value - a.value);
  }, [investments, language]);

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6'];

  const handleAdd = () => {
      setEditingInv(null);
      setIsModalOpen(true);
  };

  const handleEdit = (inv: Investment) => {
      setEditingInv(inv);
      setIsModalOpen(true);
  };

  const handleSubmit = (data: Omit<Investment, 'id'>) => {
      if (editingInv) {
          updateInvestment(editingInv.id, data);
          addNotification('Investimento atualizado.', 'success');
      } else {
          addInvestment(data);
          addNotification('Investimento criado.', 'success');
      }
      setIsModalOpen(false);
      setEditingInv(null);
  };

  const handleDeleteConfirm = () => {
      if (itemToDelete) {
          deleteInvestment(itemToDelete);
          addNotification('Investimento removido.', 'info');
          setItemToDelete(null);
      }
  };

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <LineChart className="text-blue-500" />
            {t('investments_title', language)}
          </h1>
          <p className="text-text-muted">{t('investments_desc', language)}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
        >
          <Plus size={20} />
          <span>{t('add_investment', language)}</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-border p-5 rounded-xl">
              <p className="text-xs text-text-muted uppercase mb-1 font-bold">{t('current_value', language)}</p>
              <div className="text-2xl font-bold text-white">{formatMoney(currentValue)}</div>
          </div>
          <div className="bg-surface border border-border p-5 rounded-xl">
              <p className="text-xs text-text-muted uppercase mb-1 font-bold">{t('initial_cost', language)}</p>
              <div className="text-2xl font-bold text-zinc-400">{formatMoney(totalInvested)}</div>
          </div>
          <div className="bg-surface border border-border p-5 rounded-xl">
              <p className="text-xs text-text-muted uppercase mb-1 font-bold">{t('profit_loss', language)}</p>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalProfit >= 0 ? '+' : ''}{formatMoney(totalProfit)}
              </div>
          </div>
          <div className="bg-surface border border-border p-5 rounded-xl">
              <p className="text-xs text-text-muted uppercase mb-1 font-bold">{t('roi', language)}</p>
              <div className={`text-2xl font-bold ${totalProfitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalProfitPercent.toFixed(2)}%
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Investment List */}
          <div className="lg:col-span-2">
              {investments.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-surface/30">
                      <TrendingUp size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
                      <h3 className="text-xl font-bold text-white mb-2">Sem investimentos</h3>
                      <p className="text-text-muted mb-6">Adicione ações, cripto ou imóveis para acompanhar a sua carteira.</p>
                      <button onClick={handleAdd} className="text-primary hover:underline">Começar Agora</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {investments.map(inv => (
                          <InvestmentCard 
                              key={inv.id} 
                              investment={inv} 
                              onEdit={handleEdit} 
                              onDelete={(id) => setItemToDelete(id)} 
                          />
                      ))}
                  </div>
              )}
          </div>

          {/* Right: Allocation Chart */}
          <div className="bg-surface border border-border p-6 rounded-xl h-fit">
              <div className="flex items-center gap-2 mb-6">
                  <PieChart size={20} className="text-purple-500" />
                  <h3 className="font-bold text-white">{t('allocation', language)}</h3>
              </div>
              
              {investments.length > 0 ? (
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                              <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                              >
                                  {chartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip 
                                  formatter={(value: number) => formatMoney(value)}
                                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                              />
                              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                          </RechartsPie>
                      </ResponsiveContainer>
                  </div>
              ) : (
                  <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
                      Sem dados para exibir.
                  </div>
              )}
          </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingInv ? 'Editar Investimento' : t('add_investment', language)}
      >
          <InvestmentForm 
            initialData={editingInv} 
            onSubmit={handleSubmit} 
            onCancel={() => setIsModalOpen(false)} 
          />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Remover Investimento"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertCircle size={24} />
            <p className="text-sm font-medium">{t('warning', language)}</p>
          </div>
          <p className="text-text-muted">
            Tem certeza que deseja remover este ativo do seu portfólio?
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setItemToDelete(null)}
              className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg text-white hover:bg-zinc-800 transition-colors"
            >
              {t('cancel', language)}
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {t('confirm', language)}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvestmentsPage;