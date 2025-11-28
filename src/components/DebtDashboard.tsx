import React, { useState, useMemo } from 'react';
import { useDebts } from '@/hooks/useDebts';
import { DebtEngine } from '@/core/debt-engine';
import { DebtStrategy } from '@/types';
import { ShieldAlert, TrendingDown, Calendar, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '@/components/Modal';
import { useFinance } from '@/contexts/FinanceContext';

const DebtDashboard = () => {
  const { debts, addDebt, removeDebt, isLoading } = useDebts();
  const { currency, language } = useFinance();
  
  const [strategy, setStrategy] = useState<DebtStrategy>('avalanche');
  const [extraPayment, setExtraPayment] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Projection Memoization
  const projection = useMemo(() => {
    return DebtEngine.calculatePayoff(debts, extraPayment, strategy);
  }, [debts, extraPayment, strategy]);

  const totalDebt = debts.reduce((acc, d) => acc + d.currentBalance, 0);
  const totalMinPayment = debts.reduce((acc, d) => acc + d.minimumPayment, 0);

  // Form State
  const [newDebt, setNewDebt] = useState({
    name: '', currentBalance: '', interestRate: '', minimumPayment: '', dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDebt({
      name: newDebt.name,
      currentBalance: Number(newDebt.currentBalance),
      interestRate: Number(newDebt.interestRate),
      minimumPayment: Number(newDebt.minimumPayment),
      dueDate: Number(newDebt.dueDate),
      category: 'Crédito'
    });
    setIsModalOpen(false);
    setNewDebt({ name: '', currentBalance: '', interestRate: '', minimumPayment: '', dueDate: '' });
  };

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            Gestão de Dívidas
          </h1>
          <p className="text-text-muted">Plano estratégico para liberdade financeira.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <Plus size={20} /> Adicionar Dívida
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border p-6 rounded-xl">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Dívida Total</p>
          <div className="text-3xl font-bold text-white mt-1">{formatCurrency(totalDebt, currency, language)}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Livre em</p>
          <div className="text-3xl font-bold text-green-500 mt-1">
            {projection.monthsToPayoff} <span className="text-sm text-zinc-400">meses</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Data: {projection.debtFreeDate.toLocaleDateString()}</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Juros Totais Previstos</p>
          <div className="text-3xl font-bold text-red-400 mt-1">{formatCurrency(projection.totalInterestPaid, currency, language)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls & List */}
        <div className="space-y-6">
          {/* Strategy Control */}
          <div className="bg-surface border border-border p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">Estratégia</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted mb-2 block">Pagamento Extra Mensal</label>
                <input 
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="50" 
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value))}
                  className="w-full accent-red-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs mt-2 text-zinc-400">
                  <span>€0</span>
                  <span className="text-white font-bold text-lg">€{extraPayment}</span>
                  <span>€2000</span>
                </div>
              </div>

              <div className="flex bg-black/30 p-1 rounded-lg">
                <button
                  onClick={() => setStrategy('avalanche')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${strategy === 'avalanche' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-white'}`}
                >
                  Avalanche (Juros %)
                </button>
                <button
                  onClick={() => setStrategy('snowball')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${strategy === 'snowball' ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-white'}`}
                >
                  Snowball (Saldo €)
                </button>
              </div>
            </div>
          </div>

          {/* Debt List */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-black/20">
              <h3 className="font-bold text-white text-sm">Suas Dívidas</h3>
            </div>
            <div className="divide-y divide-border">
              {debts.map(debt => (
                <div key={debt.id} className="p-4 hover:bg-white/5 transition-colors flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-white">{debt.name}</h4>
                    <div className="flex gap-3 text-xs text-text-muted mt-1">
                      <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">{debt.interestRate}% APR</span>
                      <span>Min: {formatCurrency(debt.minimumPayment, currency, language)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{formatCurrency(debt.currentBalance, currency, language)}</div>
                    <button onClick={() => removeDebt(debt.id)} className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1 justify-end ml-auto">
                      <Trash2 size={12} /> Remover
                    </button>
                  </div>
                </div>
              ))}
              {debts.length === 0 && <div className="p-6 text-center text-zinc-500 text-sm">Nenhuma dívida registada.</div>}
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-xl h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingDown className="text-green-500" />
            Curva de Amortização
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection.monthlyAmortization}>
                <defs>
                  <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickFormatter={(val) => `Mês ${val}`} />
                <YAxis stroke="#52525b" fontSize={10} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  formatter={(val: number) => formatCurrency(val, currency, language)}
                  labelFormatter={(label) => `Mês ${label}`}
                />
                <Area type="monotone" dataKey="balance" stroke="#ef4444" fillOpacity={1} fill="url(#colorDebt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Dívida">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Nome</label>
            <input type="text" required value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" placeholder="Ex: Cartão Visa" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Saldo Devedor</label>
              <input type="number" required value={newDebt.currentBalance} onChange={e => setNewDebt({...newDebt, currentBalance: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" placeholder="1500.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Taxa Juro Anual (%)</label>
              <input type="number" required value={newDebt.interestRate} onChange={e => setNewDebt({...newDebt, interestRate: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" placeholder="18.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Pagamento Mínimo</label>
              <input type="number" required value={newDebt.minimumPayment} onChange={e => setNewDebt({...newDebt, minimumPayment: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" placeholder="50.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Dia Vencimento</label>
              <input type="number" required max="31" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" placeholder="5" />
            </div>
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors">Confirmar</button>
        </form>
      </Modal>
    </div>
  );
};

export default DebtDashboard;
