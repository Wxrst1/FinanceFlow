

import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { t } from '../utils';
import { Plus, Trash2, Target, TrendingUp, AlertCircle, Lock } from 'lucide-react';
import Modal from './Modal';
import UpgradeModal from './UpgradeModal';
import { motion } from 'framer-motion';

const Goals = () => {
  const { goals, addGoal, deleteGoal, updateGoal, getPlanLimits, user, formatMoney, language } = useFinance();
  const { addNotification } = useNotification();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', currentAmount: '' });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const limits = getPlanLimits();
  const isLimitReached = goals.length >= limits.maxGoals;

  const handleCreateClick = () => {
      if (isLimitReached) {
          setIsUpgradeModalOpen(true);
      } else {
          setIsCreateModalOpen(true);
      }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({
      name: newGoal.name,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount) || 0,
      color: '#22c55e'
    });
    addNotification(t('new_goal', language), 'success');
    setIsCreateModalOpen(false);
    setNewGoal({ name: '', targetAmount: '', currentAmount: '' });
  };

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
        deleteGoal(itemToDelete);
        addNotification('Meta removida.', 'info');
        setItemToDelete(null);
    }
  };

  const openUpdateModal = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedGoalId(id);
      setAmountToAdd('');
      setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedGoalId && amountToAdd) {
          const goal = goals.find(g => g.id === selectedGoalId);
          if (goal) {
              const newAmount = goal.currentAmount + Number(amountToAdd);
              updateGoal(selectedGoalId, newAmount);
              addNotification('Valor adicionado com sucesso!', 'success');
              setIsUpdateModalOpen(false);
          }
      }
  };

  return (
    <div className="p-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Target className="text-primary" />
            {t('goals_title', language)}
          </h1>
          <p className="text-text-muted">{t('goals_desc', language)}</p>
        </div>
        <button
          onClick={handleCreateClick}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
            isLimitReached 
                ? 'bg-zinc-800 text-text-muted hover:bg-zinc-700 cursor-pointer'
                : 'bg-primary hover:bg-primary-hover text-white shadow-green-900/20'
          }`}
        >
          {isLimitReached ? <Lock size={18} className="text-yellow-500" /> : <Plus size={20} />}
          <span className="hidden sm:inline">{isLimitReached ? t('goal_limit_reached', language) : t('new_goal', language)}</span>
        </button>
      </div>
      
      {limits.maxGoals !== Infinity && (
         <div className="mb-6 bg-surface border border-border p-4 rounded-lg flex justify-between items-center">
             <div className="text-sm text-text-muted">
                 <span className="text-white font-bold">{t('plan', language)} {user?.plan || 'Starter'}</span>: {goals.length} {t('of', language)} {limits.maxGoals} metas.
             </div>
             {isLimitReached && (
                 <button onClick={() => setIsUpgradeModalOpen(true)} className="text-xs text-primary hover:underline">
                     {t('upgrade', language)}
                 </button>
             )}
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const target = Math.max(goal.targetAmount, 0.01); 
          const current = Math.max(goal.currentAmount, 0);
          const percentage = Math.min(100, (current / target) * 100);
          
          return (
            <motion.div 
              key={goal.id} 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-surface border border-border p-6 rounded-xl relative group hover:border-border/80 transition-all"
            >
              <button 
                type="button"
                onClick={(e) => requestDelete(e, goal.id)}
                className="absolute top-4 right-4 text-text-muted hover:text-red-500 p-2 rounded hover:bg-red-500/10 transition-all z-10 cursor-pointer"
                title="Remover Meta"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Target size={24} />
                </div>
                <div className="pr-12">
                    <h3 className="font-semibold text-white text-lg truncate">{goal.name}</h3>
                    <span className="text-xs text-text-muted">{t('target_val', language)}: {formatMoney(goal.targetAmount)}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t('progress', language)}</span>
                  <span className="font-bold text-white">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-background rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                 <div className="text-sm text-text-muted">
                    {t('current', language)}: <span className="text-white font-medium block">{formatMoney(goal.currentAmount)}</span>
                 </div>
                 <button 
                    type="button"
                    onClick={(e) => openUpdateModal(e, goal.id)}
                    className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded transition-colors border border-white/5 hover:border-white/10 cursor-pointer z-10"
                 >
                    <TrendingUp size={14} />
                    {t('add_savings', language)}
                 </button>
              </div>
            </motion.div>
          );
        })}
        
        {goals.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl text-text-muted">
                <Target size={48} className="mb-4 opacity-50" />
                <p>{t('no_goals', language)}</p>
            </div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('new_goal', language)}>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">{t('goal_name', language)}</label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
              value={newGoal.name}
              onChange={e => setNewGoal({...newGoal, name: e.target.value})}
              placeholder="Ex: Comprar Carro"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('target_amount', language)}</label>
                <input
                type="number"
                required
                step="0.01"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                value={newGoal.targetAmount}
                onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                placeholder="5000"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('initial_amount', language)}</label>
                <input
                type="number"
                step="0.01"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                value={newGoal.currentAmount}
                onChange={e => setNewGoal({...newGoal, currentAmount: e.target.value})}
                placeholder="0"
                />
            </div>
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg mt-4">
            {t('create_goal', language)}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title={t('add_funds_title', language)}>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <p className="text-text-muted text-sm">
                {t('add_funds_desc', language)}
            </p>
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('amount_to_add', language)}</label>
                <input
                    type="number"
                    required
                    step="0.01"
                    autoFocus
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    value={amountToAdd}
                    onChange={e => setAmountToAdd(e.target.value)}
                    placeholder="Ex: 100"
                />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg mt-2">
                {t('confirm_deposit', language)}
            </button>
        </form>
      </Modal>

       <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={t('remove_goal_title', language)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertCircle size={24} />
            <p className="text-sm font-medium">{t('warning', language)}</p>
          </div>
          <p className="text-text-muted">
            {t('remove_goal_msg', language)}
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setItemToDelete(null)}
              className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg text-white hover:bg-zinc-800 transition-colors"
            >
              {t('cancel', language)}
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {t('confirm', language)}
            </button>
          </div>
        </div>
      </Modal>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default Goals;