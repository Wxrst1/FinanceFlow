

import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { ArrowDownCircle, ArrowUpCircle, Save, Plus, Calendar, Tag, Wallet } from 'lucide-react';
import { Transaction } from '../types';
import { t } from '../utils';

interface TransactionFormProps {
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, transactionToEdit }) => {
  const { addTransaction, editTransaction, language, accounts } = useFinance();
  const { addNotification } = useNotification();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [accountId, setAccountId] = useState('');
  
  const [day, setDay] = useState('');
  const [monthYear, setMonthYear] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setTagsInput(transactionToEdit.tags ? transactionToEdit.tags.join(', ') : '');
      setAccountId(transactionToEdit.accountId || '');
      
      const d = new Date(transactionToEdit.date);
      setDay(String(d.getDate()).padStart(2, '0'));
      setMonthYear(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory('');
      setTagsInput('');
      if (accounts.length > 0) setAccountId(accounts[0].id);
      
      const d = new Date();
      setDay(String(d.getDate()).padStart(2, '0'));
      setMonthYear(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [transactionToEdit, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !day || !monthYear || !accountId) {
        addNotification('Por favor preencha todos os campos obrigatórios.', 'error');
        return;
    }

    const paddedDay = day.padStart(2, '0');
    const dateString = `${monthYear}-${paddedDay}`;
    const dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime()) || dateObj.getDate() !== parseInt(day)) {
        addNotification('Data inválida. Verifique o dia selecionado.', 'error');
        return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    if (transactionToEdit) {
      editTransaction({
        id: transactionToEdit.id,
        description,
        amount: parseFloat(amount),
        category,
        date: dateObj.toISOString(),
        type,
        tags,
        accountId
      });
      addNotification('Transação atualizada com sucesso!', 'success');
    } else {
      addTransaction({
        description,
        amount: parseFloat(amount),
        category,
        date: dateObj.toISOString(),
        type,
        tags,
        accountId
      });
      addNotification('Transação adicionada com sucesso!', 'success');
    }
    
    onClose();
  };

  const categoryKeys = type === 'income' 
    ? ['cat_salary', 'cat_freelance', 'cat_investments', 'cat_others'] 
    : ['cat_food', 'cat_housing', 'cat_transport', 'cat_leisure', 'cat_health', 'cat_education', 'cat_subscriptions', 'cat_others'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            type === 'income' 
              ? 'bg-green-500/10 border-green-500 text-green-500' 
              : 'bg-surface border-border text-text-muted hover:bg-zinc-800'
          }`}
        >
          <ArrowUpCircle size={20} />
          <span>{t('type_income', language)}</span>
        </button>
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            type === 'expense' 
              ? 'bg-red-500/10 border-red-500 text-red-500' 
              : 'bg-surface border-border text-text-muted hover:bg-zinc-800'
          }`}
        >
          <ArrowDownCircle size={20} />
          <span>{t('type_expense', language)}</span>
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Conta</label>
        <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                required
            >
                <option value="" disabled>Selecione a conta...</option>
                {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                ))}
            </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('description', language)}</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="Ex: Supermercado"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('value', language)}</label>
        <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="0.00"
            required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-2">
            <label className="text-sm font-medium text-text-muted">{t('day_label', language)}</label>
            <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-center"
                placeholder="DD"
                required
            />
        </div>
        <div className="col-span-2 space-y-2">
            <label className="text-sm font-medium text-text-muted">{t('month_year_label', language)}</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                    type="month"
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                />
            </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('category', language)}</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          required
        >
          <option value="" disabled>{t('select_category', language)}</option>
          {categoryKeys.map(key => (
            <option key={key} value={t(key, language)}>{t(key, language)}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('tags_label', language)}</label>
        <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder={t('tags_placeholder', language)}
            />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {transactionToEdit ? <Save size={20} /> : <Plus size={20} />}
          {transactionToEdit ? t('save_changes', language) : t('add_transaction', language)}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;