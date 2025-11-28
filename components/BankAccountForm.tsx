
import React, { useState, useEffect } from 'react';
import { BankAccount } from '../types';
import { Building2, CreditCard, Wallet, Euro, PiggyBank } from 'lucide-react';

interface BankAccountFormProps {
  initialData?: BankAccount | null;
  onSubmit: (data: Omit<BankAccount, 'id' | 'balance' | 'enabled'>) => void;
  onCancel: () => void;
}

const COLORS = [
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#ef4444', // Red
    '#eab308', // Yellow
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#ec4899', // Pink
    '#64748b', // Slate
];

const BankAccountForm: React.FC<BankAccountFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Conta à Ordem');
  const [initialBalance, setInitialBalance] = useState('');
  const [icon, setIcon] = useState('Building2');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setInitialBalance(initialData.initialBalance.toString());
      setIcon(initialData.icon || 'Building2');
      setColor(initialData.color || COLORS[0]);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      initialBalance: parseFloat(initialBalance) || 0,
      icon,
      color
    });
  };

  const icons = [
    { id: 'Building2', component: Building2, label: 'Banco' },
    { id: 'Wallet', component: Wallet, label: 'Carteira' },
    { id: 'CreditCard', component: CreditCard, label: 'Cartão' },
    { id: 'PiggyBank', component: PiggyBank, label: 'Poupança' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Nome da Conta</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ex: Carteira Principal, Nubank..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="Conta à Ordem">Conta à Ordem</option>
          <option value="Carteira">Carteira / Dinheiro</option>
          <option value="Poupança">Conta Poupança</option>
          <option value="Cartão Crédito">Cartão de Crédito</option>
          <option value="Investimento">Investimento</option>
          <option value="PayPal">PayPal / Digital</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Saldo Inicial</label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="number"
            step="0.01"
            required
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="0.00"
          />
        </div>
        <p className="text-xs text-text-muted">Valor que tem atualmente nesta conta.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Ícone</label>
            <div className="flex gap-2">
              {icons.map((item) => {
                const Icon = item.component;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`p-2.5 rounded-lg border transition-all ${
                      icon === item.id
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface border-border text-text-muted hover:bg-white/5'
                    }`}
                    title={item.label}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Cor</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
              ))}
            </div>
          </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-text-muted hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
        >
          {initialData ? 'Guardar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default BankAccountForm;
