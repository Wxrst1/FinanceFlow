
import React, { useState, useEffect } from 'react';
import { Subscription } from '../types';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';
import { Euro, Calendar, Tag, CreditCard } from 'lucide-react';

interface SubscriptionFormProps {
  initialData?: Subscription | null;
  onSubmit: (data: Omit<Subscription, 'id' | 'active'>) => void;
  onCancel: () => void;
}

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#8b5cf6', '#f97316', '#ec4899', '#64748b'];

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { language } = useFinance();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(initialData.amount.toString());
      setBillingCycle(initialData.billingCycle);
      setNextPaymentDate(new Date(initialData.nextPaymentDate).toISOString().split('T')[0]);
      setCategory(initialData.category);
      setColor(initialData.color);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      amount: parseFloat(amount),
      billingCycle,
      nextPaymentDate: new Date(nextPaymentDate).toISOString(),
      category: category || 'Assinaturas',
      icon: 'CreditCard',
      color
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Nome do Serviço</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ex: Netflix, Spotify, Ginásio"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            <label className="text-sm font-medium text-text-muted">{t('billing_cycle', language)}</label>
            <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <option value="monthly">{t('billing_monthly', language)}</option>
                <option value="yearly">{t('billing_yearly', language)}</option>
            </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('next_payment', language)}</label>
        <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
                type="date"
                required
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('category', language)}</label>
        <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ex: Streaming, Software"
            />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Cor</label>
        <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
                <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-text-muted hover:text-white transition-colors">
            {t('cancel', language)}
        </button>
        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
            {initialData ? t('save_changes', language) : t('create_subscription', language)}
        </button>
      </div>
    </form>
  );
};

export default SubscriptionForm;