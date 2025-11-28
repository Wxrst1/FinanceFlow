
import React, { useState } from 'react';
import { BankAccount } from '../types';
import { ArrowRight, Euro } from 'lucide-react';

interface TransferModalProps {
  onClose: () => void;
  onSubmit: (sourceId: string, destId: string, amount: number, date: string) => void;
  accounts: BankAccount[];
}

const TransferModal: React.FC<TransferModalProps> = ({ onClose, onSubmit, accounts }) => {
  const [sourceId, setSourceId] = useState(accounts[0]?.id || '');
  const [destId, setDestId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId && destId && amount && sourceId !== destId) {
        onSubmit(sourceId, destId, parseFloat(amount), new Date(date).toISOString());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-text-muted">De (Origem)</label>
                <select 
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
            </div>
            <div className="pt-6 text-text-muted">
                <ArrowRight size={20} />
            </div>
            <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-text-muted">Para (Destino)</label>
                <select 
                    value={destId}
                    onChange={(e) => setDestId(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id} disabled={acc.id === sourceId}>{acc.name}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Valor</label>
            <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                    type="number" 
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Data</label>
            <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
        </div>

        <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-text-muted hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!amount || !sourceId || !destId || sourceId === destId}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Confirmar
            </button>
        </div>
    </form>
  );
};

export default TransferModal;
