import React, { useState, useEffect } from 'react';
import { Investment, InvestmentType } from '../types';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';
import { Euro, TrendingUp, Bitcoin, Building, Briefcase, Car, Coins, FileText } from 'lucide-react';

interface InvestmentFormProps {
  initialData?: Investment | null;
  onSubmit: (data: Omit<Investment, 'id'>) => void;
  onCancel: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { language } = useFinance();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('stock');
  const [initialCost, setInitialCost] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setInitialCost(initialData.initialCost.toString());
      setCurrentValue(initialData.currentValue.toString());
      if (initialData.purchaseDate) {
          setPurchaseDate(new Date(initialData.purchaseDate).toISOString().split('T')[0]);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      initialCost: parseFloat(initialCost) || 0,
      currentValue: parseFloat(currentValue) || 0,
      purchaseDate: new Date(purchaseDate).toISOString()
    });
  };

  const types: { id: InvestmentType, label: string, icon: any }[] = [
      { id: 'stock', label: t('inv_stock', language), icon: TrendingUp },
      { id: 'etf', label: t('inv_etf', language), icon: Briefcase },
      { id: 'crypto', label: t('inv_crypto', language), icon: Bitcoin },
      { id: 'real_estate', label: t('inv_real_estate', language), icon: Building },
      { id: 'gold', label: t('inv_gold', language), icon: Coins },
      { id: 'vehicle', label: t('inv_vehicle', language), icon: Car },
      { id: 'other', label: t('inv_other', language), icon: FileText },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Nome do Ativo</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ex: Apple Inc., Bitcoin, ETF S&P 500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">Tipo</label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
            {types.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-sm ${
                            type === item.id 
                                ? 'bg-primary/20 border-primary text-primary' 
                                : 'bg-surface border-border text-text-muted hover:bg-white/5'
                        }`}
                    >
                        <Icon size={16} />
                        <span>{item.label}</span>
                    </button>
                )
            })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">{t('initial_cost', language)}</label>
            <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                    type="number"
                    step="0.01"
                    required
                    value={initialCost}
                    onChange={(e) => setInitialCost(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">{t('current_value', language)}</label>
            <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                    type="number"
                    step="0.01"
                    required
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                />
            </div>
          </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('purchase_date', language)}</label>
        <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-text-muted hover:text-white transition-colors">
            {t('cancel', language)}
        </button>
        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
            {initialData ? t('save_changes', language) : t('add_investment', language)}
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;