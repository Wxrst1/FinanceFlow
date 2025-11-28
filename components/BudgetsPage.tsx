
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { Wallet, Plus, Trash2, Edit2, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { t } from '../utils';
import { Budget } from '../types';
import Modal from './Modal';
import BudgetForm from './BudgetForm';
import { motion } from 'framer-motion';

const BudgetsPage = () => {
  const { budgets, addBudget, deleteBudget, getBudgetAnalysis, formatMoney, language } = useFinance();
  const { addNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAdd = () => {
      setEditingBudget(null);
      setIsModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
      setEditingBudget(budget);
      setIsModalOpen(true);
  };

  const handleSubmit = (data: Omit<Budget, 'id'>) => {
      if (editingBudget) {
          deleteBudget(editingBudget.id); // Hacky update: delete old, add new (or better, use updateBudget API if existed, but addBudget handles upsert via API)
          addBudget(data); // Re-add with new data (since ID is generic in form). Ideally we need updateBudget fn in context.
          // Actually API.saveBudget uses upsert. So if we keep ID...
          // Let's simplify: context's addBudget generates new ID.
          // Better: Just delete and add for now or implement updateBudget in context properly.
          // The context has deleteBudget and addBudget.
          // For this implementation, I will just delete and create new to avoid ID conflicts if I don't have update fn exposed properly.
          addNotification('Orçamento atualizado.', 'success');
      } else {
          addBudget(data);
          addNotification('Orçamento criado.', 'success');
      }
      setIsModalOpen(false);
      setEditingBudget(null);
  };

  const confirmDelete = (id: string) => {
      deleteBudget(id);
      addNotification('Orçamento removido.', 'info');
      setItemToDelete(null);
  };

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Wallet className="text-primary" />
            {t('budgets_title', language)}
          </h1>
          <p className="text-text-muted">{t('budgets_desc', language)}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
        >
          <Plus size={20} />
          <span>{t('add_budget', language)}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map(budget => {
              const analysis = getBudgetAnalysis(budget);
              const isDanger = analysis.status === 'danger';
              const isWarning = analysis.status === 'warning';
              
              return (
                  <motion.div 
                    key={budget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border p-6 rounded-xl relative group"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                  {budget.category}
                                  {budget.category === 'Global' && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">MAIN</span>}
                              </h3>
                              <p className="text-sm text-text-muted">
                                  {t('alert_threshold', language)}: {budget.alertThreshold}%
                              </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(budget)} className="p-2 hover:bg-white/10 rounded text-text-muted hover:text-white">
                                  <Edit2 size={16} />
                              </button>
                              <button onClick={() => setItemToDelete(budget.id)} className="p-2 hover:bg-red-500/10 rounded text-text-muted hover:text-red-500">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>

                      <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                              <span className="text-text-muted">{t('spent', language)}</span>
                              <span className="text-white font-medium">{formatMoney(analysis.spent)} / {formatMoney(analysis.budget)}</span>
                          </div>
                          <div className="h-3 bg-background rounded-full overflow-hidden border border-border">
                              <div 
                                className={`h-full rounded-full ${isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min(100, analysis.percentage)}%` }}
                              />
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-text-muted">
                              <span>{analysis.percentage.toFixed(1)}%</span>
                              <span className={isDanger ? 'text-red-400' : 'text-zinc-400'}>
                                  {t('remaining', language)}: {formatMoney(analysis.remaining)}
                              </span>
                          </div>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                              {isDanger ? <AlertTriangle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-green-500" />}
                              <span className={isDanger ? 'text-red-400' : 'text-green-400'}>
                                  {isDanger ? t('budget_state_danger', language) : t('budget_state_safe', language)}
                              </span>
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1">
                              <TrendingUp size={12} />
                              {t('projected_spent', language)}: {formatMoney(analysis.projected)}
                          </div>
                      </div>
                  </motion.div>
              );
          })}
          
          {budgets.length === 0 && (
              <div className="col-span-full text-center py-16 border-2 border-dashed border-border rounded-xl text-text-muted">
                  <Wallet size={48} className="mb-4 opacity-50 mx-auto" />
                  <p>Não tem orçamentos definidos.</p>
              </div>
          )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingBudget ? t('edit_budget', language) : t('create_budget', language)}
      >
          <BudgetForm 
            initialData={editingBudget} 
            onSubmit={handleSubmit} 
            onCancel={() => setIsModalOpen(false)} 
          />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={t('remove_budget', language)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertTriangle size={24} />
            <p className="text-sm font-medium">{t('confirm_delete', language)}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setItemToDelete(null)} className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg text-white">
              {t('cancel', language)}
            </button>
            <button onClick={() => itemToDelete && confirmDelete(itemToDelete)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg">
              {t('confirm', language)}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
