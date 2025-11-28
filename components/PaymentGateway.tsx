
import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, CheckCircle2, Loader2, ChevronLeft } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { motion } from 'framer-motion';

interface PaymentGatewayProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onBack: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ plan, onSuccess, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  
  const planDetails = {
    starter: { price: '0.00', name: 'Starter' },
    free: { price: '0.00', name: 'Free' },
    pro: { price: '9.00', name: 'Pro' },
    business: { price: '29.00', name: 'Business' }
  };
  
  const currentPlan = planDetails[plan];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('processing');
    
    // Simulate payment processing delay
    setTimeout(() => {
      setStep('success');
      setIsLoading(false);
      // Auto redirect after success
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
          <p className="text-text-muted mb-6">A sua subscrição {currentPlan.name} está agora ativa.</p>
          <div className="animate-pulse text-sm text-primary">A redirecionar para o dashboard...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-surface border border-border rounded-2xl shadow-2xl max-w-4xl w-full grid md:grid-cols-2 overflow-hidden"
      >
        {/* Summary Sidebar */}
        <div className="bg-zinc-900/50 p-8 border-r border-border flex flex-col">
          <button onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-white mb-8 text-sm transition-colors w-fit">
            <ChevronLeft size={16} />
            Voltar
          </button>

          <h2 className="text-xl font-bold text-white mb-6">Resumo do Pedido</h2>
          
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <p className="font-medium text-white">Plano {currentPlan.name}</p>
              <p className="text-sm text-text-muted">Faturação Mensal</p>
            </div>
            <p className="font-bold text-white">€{currentPlan.price}</p>
          </div>
          
          <div className="flex items-center justify-between py-4">
            <p className="text-text-muted">Total a pagar hoje</p>
            <p className="text-2xl font-bold text-primary">€{currentPlan.price}</p>
          </div>

          <div className="mt-auto pt-8">
            <div className="flex items-center gap-3 text-sm text-text-muted bg-white/5 p-4 rounded-lg">
              <ShieldCheck className="text-green-500 shrink-0" size={20} />
              <p>Pagamento processado de forma segura com encriptação 256-bit SSL.</p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/20 rounded text-primary">
              <CreditCard size={24} />
            </div>
            <h1 className="text-xl font-bold text-white">Detalhes do Pagamento</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Nome no Cartão</label>
              <input 
                type="text"
                required
                placeholder="João Silva"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Número do Cartão</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="text"
                  required
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-background border border-border rounded-lg pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Validade</label>
                <input 
                  type="text"
                  required
                  placeholder="MM/AA"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">CVC</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input 
                    type="text"
                    required
                    placeholder="123"
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none text-center"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={step === 'processing'}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-70 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
            >
              {step === 'processing' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processando...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Pagar €{currentPlan.price}
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGateway;
