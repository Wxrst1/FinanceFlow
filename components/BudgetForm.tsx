
import React, { useState, useEffect } from 'react';
import { Budget } from '../types';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';
import { Euro, Tag, Bell } from 'lucide-react';

interface BudgetFormProps {
  initialData?: Budget | null;
  onSubmit: (data: Omit<Budget, 'id'>) => void;
  onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { language } = useFinance();
  
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');

  // Predefined categories
  const categories = ['Global', 'Alimentação', 'Habitação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Shopping', 'Outros'];

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setAmount(initialData.amount.toString());
      setAlertThreshold(initialData.alertThreshold.toString());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category,
      amount: parseFloat(amount),
      alertThreshold: parseInt(alertThreshold)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('category', language)}</label>
        <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
            >
                <option value="" disabled>Selecione...</option>
                {categories.map(c => <option key={c} value={c}>{c === 'Global' ? t('budget_global', language) : c}</option>)}
            </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('value', language)}</label>
        <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
            />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
            <Bell size={14} /> {t('alert_threshold', language)} (%)
        </label>
        <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-text-muted">
            <span>50%</span>
            <span className="text-white font-bold">{alertThreshold}%</span>
            <span>100%</span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-text-muted hover:text-white transition-colors">
            {t('cancel', language)}
        </button>
        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
            {initialData ? t('save_changes', language) : t('create_budget', language)}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
