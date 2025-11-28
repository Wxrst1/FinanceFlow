
import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '../types';
import { t } from '../utils';
import { useFinance } from '../contexts/FinanceContext';
import { Euro, Building, Car, TrendingUp, Bitcoin, Coins, CreditCard, FileText } from 'lucide-react';

interface AssetFormProps {
  initialData?: Asset | null;
  onSubmit: (data: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { language } = useFinance();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('real_estate');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setValue(initialData.value.toString());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      value: parseFloat(value),
      currency: 'EUR'
    });
  };

  const assetTypes: { id: AssetType, label: string, icon: any }[] = [
      { id: 'real_estate', label: t('asset_real_estate', language), icon: Building },
      { id: 'vehicle', label: t('asset_vehicle', language), icon: Car },
      { id: 'investment', label: t('asset_investment', language), icon: TrendingUp },
      { id: 'crypto', label: t('asset_crypto', language), icon: Bitcoin },
      { id: 'cash', label: t('asset_cash', language), icon: Coins },
      { id: 'other', label: t('asset_other', language), icon: FileText },
      { id: 'liability', label: t('asset_liability', language), icon: CreditCard },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('asset_name', language)}</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ex: Casa Própria, Tesla Model 3"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-muted">{t('asset_type', language)}</label>
        <div className="grid grid-cols-2 gap-2">
            {assetTypes.map((at) => {
                const Icon = at.icon;
                return (
                    <button
                        key={at.id}
                        type="button"
                        onClick={() => setType(at.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-sm ${
                            type === at.id 
                                ? at.id === 'liability' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-primary/20 border-primary text-primary' 
                                : 'bg-surface border-border text-text-muted hover:bg-white/5'
                        }`}
                    >
                        <Icon size={16} />
                        <span>{at.label}</span>
                    </button>
                )
            })}
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
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
            />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-text-muted hover:text-white transition-colors">
            {t('cancel', language)}
        </button>
        <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
            {initialData ? t('save_changes', language) : t('create_asset', language)}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
