

import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { Zap, Plus, Trash2, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { TransactionType } from '../types';
import { t } from '../utils';
import Modal from './Modal';
import UpgradeModal from './UpgradeModal';

const Automations = () => {
  const { automations, addAutomation, deleteAutomation, checkAccess, language } = useFinance();
  const { addNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [matchString, setMatchString] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<TransactionType>('expense');

  const canAccess = checkAccess('automations');

  const handleAddClick = () => {
      if (canAccess) {
          setIsModalOpen(true);
      } else {
          setIsUpgradeModalOpen(true);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAutomation({
        name,
        matchString,
        targetCategory: category,
        targetType: type,
        isActive: true
    });
    addNotification('Automação criada com sucesso!', 'success');
    setIsModalOpen(false);
    // Reset form
    setName('');
    setMatchString('');
    setCategory('');
  };

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Zap className="text-yellow-500" />
            {t('automations_title', language)}
          </h1>
          <p className="text-text-muted">{t('automations_desc', language)}</p>
        </div>
        <button
          onClick={handleAddClick}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
            !canAccess 
              ? 'bg-zinc-800 text-text-muted cursor-pointer hover:bg-zinc-700 border border-border'
              : 'bg-primary hover:bg-primary-hover text-white shadow-green-900/20'
          }`}
        >
          {!canAccess ? <Lock size={18} className="text-yellow-500" /> : <Plus size={20} />}
          <span>{t('new_rule', language)}</span>
        </button>
      </div>

      {!canAccess && (
         <div className="mb-8 bg-surface border border-yellow-500/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-500/5 z-0" />
            <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">{t('pro_feature', language)}</h3>
                    <p className="text-text-muted text-sm">{t('pro_feature_desc', language)}</p>
                </div>
            </div>
            <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="relative z-10 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full transition-colors whitespace-nowrap"
            >
                {t('unlock_now', language)}
            </button>
         </div>
      )}

      <div className={`grid gap-4 ${!canAccess ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        {automations.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-xl border-dashed">
                <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-2">{t('no_automations', language)}</h3>
                <p className="text-text-muted max-w-md mx-auto">
                    Crie regras como "Se a descrição contém 'Netflix', categorizar como 'Lazer'".
                </p>
            </div>
        ) : (
            automations.map(auto => (
                <div key={auto.id} className="bg-surface border border-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500 mt-1">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{auto.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mt-1">
                                <span>{t('if_contains_label', language)}</span>
                                <span className="bg-background px-2 py-0.5 rounded text-white font-mono border border-border">"{auto.matchString}"</span>
                                <ArrowRight size={14} />
                                <span>{t('set_as_label', language)}</span>
                                <span className={`px-2 py-0.5 rounded font-medium ${auto.targetType === 'expense' ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
                                    {auto.targetCategory}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if(window.confirm(t('confirm_delete', language))) {
                                deleteAutomation(auto.id);
                                addNotification('Automação removida', 'info');
                            }
                        }}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors self-end md:self-center"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('create_automation', language)}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('rule_name', language)}</label>
                <input 
                    type="text" 
                    required
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Ex: Categorizar Streaming"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('if_contains', language)}</label>
                <input 
                    type="text" 
                    required
                    value={matchString} 
                    onChange={e => setMatchString(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Ex: Netflix"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">{t('category', language)}</label>
                    <select 
                        value={type}
                        onChange={e => setType(e.target.value as TransactionType)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="expense">{t('type_expense', language)}</option>
                        <option value="income">{t('type_income', language)}</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">{t('apply_category', language)}</label>
                    <input 
                        type="text" 
                        required
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Ex: Lazer"
                    />
                </div>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-lg mt-4">
                {t('create_rule', language)}
            </button>
        </form>
      </Modal>

      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
};

export default Automations;