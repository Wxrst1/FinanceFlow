
import React, { useState } from 'react';
import Modal from './Modal';
import { Check, Star, Zap, Shield } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { SubscriptionPlan } from '../types';
import PaymentGateway from './PaymentGateway';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { upgradePlan } = useFinance();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
      setSelectedPlan(plan);
  };

  const handlePaymentSuccess = async () => {
      if (selectedPlan) {
          await upgradePlan(selectedPlan);
          setSelectedPlan(null);
          onClose();
      }
  };

  if (selectedPlan) {
      return (
          <div className="fixed inset-0 z-50 bg-background">
               <PaymentGateway 
                  plan={selectedPlan} 
                  onSuccess={handlePaymentSuccess} 
                  onBack={() => setSelectedPlan(null)}
               />
          </div>
      );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atualize o seu Plano">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-2">
            <Star size={32} fill="currentColor" />
          </div>
          <h3 className="text-xl font-bold text-white">Desbloqueie todo o potencial</h3>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            Atingiu o limite do seu plano atual. Faça upgrade para remover restrições.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-surface border-2 border-primary/50 p-5 rounded-xl relative overflow-hidden hover:bg-surface/80 transition-colors cursor-pointer group" onClick={() => handleSelectPlan('pro')}>
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
              RECOMENDADO
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Pro</h4>
            <div className="text-2xl font-bold text-white mb-4">€9<span className="text-sm text-text-muted font-normal">/mês</span></div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Check size={16} className="text-primary" /> Contas Bancárias Ilimitadas
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Check size={16} className="text-primary" /> Sincronização Automática
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Check size={16} className="text-primary" /> Automações Ilimitadas
              </li>
            </ul>

            <button className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">
              Escolher Pro
            </button>
          </div>

          <div className="bg-surface border border-border p-5 rounded-xl relative overflow-hidden hover:border-white/20 transition-colors cursor-pointer" onClick={() => handleSelectPlan('business')}>
            <h4 className="text-lg font-bold text-white mb-1">Business</h4>
            <div className="text-2xl font-bold text-white mb-4">€29<span className="text-sm text-text-muted font-normal">/mês</span></div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Check size={16} className="text-white" /> Múltiplos Utilizadores
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Check size={16} className="text-white" /> Gestão de Recibos
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Check size={16} className="text-white" /> API de Exportação
              </li>
            </ul>

            <button className="w-full py-2 bg-surface border border-border hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors">
              Escolher Business
            </button>
          </div>
        </div>
        
        <p className="text-xs text-center text-text-muted">
          Cancelamento gratuito a qualquer momento. Pagamento seguro.
        </p>
      </div>
    </Modal>
  );
};

export default UpgradeModal;
