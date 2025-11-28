
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { CalendarClock, Plus, Trash2, CalendarDays } from 'lucide-react';
import { t } from '../utils';
import Modal from './Modal';

const FixedExpenses = () => {
  const { fixedExpenses, addFixedExpense, deleteFixedExpense, formatMoney, language } = useFinance();
  const { addNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !day || !category) return;

    addFixedExpense({
        description,
        amount: Number(amount),
        day: Number(day),
        category
    });

    addNotification('Despesa fixa adicionada!', 'success');
    setIsModalOpen(false);
    
    // Reset
    setDescription('');
    setAmount('');
    setDay('');
    setCategory('');
  };

  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <CalendarClock className="text-purple-500" />
            {t('fixed_expenses_title', language)}
          </h1>
          <p className="text-text-muted">{t('fixed_expenses_desc', language)}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
        >
          <Plus size={20} />
          <span>{t('add_fixed_expense', language)}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border p-6 rounded-xl md:col-span-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{t('monthly_fixed_total', language)}</h3>
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                    <CalendarDays size={20} />
                </div>
            </div>
            <div className="text-3xl font-bold text-white">{formatMoney(totalFixed)}</div>
            <p className="text-sm text-text-muted mt-2">
                {t('fixed_expenses_note', language)}
            </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {fixedExpenses.length === 0 ? (
            <div className="p-12 text-center text-text-muted flex flex-col items-center">
                <CalendarClock size={48} className="mb-4 opacity-50" />
                <p>{t('no_fixed_expenses', language)}</p>
            </div>
        ) : (
            <div className="divide-y divide-border">
                {fixedExpenses.sort((a,b) => a.day - b.day).map(expense => (
                    <div key={expense.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold border border-border">
                                {expense.day}
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{expense.description}</h4>
                                <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded">
                                    {expense.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                            <span className="font-bold text-white text-lg">{formatMoney(expense.amount)}</span>
                            <button
                                onClick={() => {
                                    if(window.confirm(t('confirm_delete', language))) {
                                        deleteFixedExpense(expense.id);
                                        addNotification('Despesa removida', 'info');
                                    }
                                }}
                                className="text-text-muted hover:text-red-500 p-2 rounded hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('create_fixed_expense', language)}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('description', language)}</label>
                <input 
                    type="text" 
                    required
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Ex: Renda da Casa"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">{t('value', language)}</label>
                    <input 
                        type="number" 
                        required
                        step="0.01"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="800.00"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">{t('day_of_month', language)}</label>
                    <input 
                        type="number" 
                        required
                        min="1"
                        max="31"
                        value={day} 
                        onChange={e => setDay(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="1"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('category', language)}</label>
                <input 
                    type="text" 
                    required
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Ex: Habitação"
                />
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-lg mt-4">
                {t('create_fixed_expense', language)}
            </button>
        </form>
      </Modal>
    </div>
  );
};

export default FixedExpenses;
