
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { CreditCard, Plus, Trash2, Edit2, Calendar, AlertCircle, Zap } from 'lucide-react';
import { t, formatDate } from '../utils';
import { Subscription } from '../types';
import Modal from './Modal';
import SubscriptionForm from './SubscriptionForm';
import { motion } from 'framer-motion';

const SubscriptionsPage = () => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, formatMoney, language } = useFinance();
  const { addNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Calculations
  const monthlyTotal = subscriptions.reduce((acc, sub) => {
      if (sub.billingCycle === 'monthly') return acc + sub.amount;
      return acc + (sub.amount / 12);
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const handleAdd = () => {
      setEditingSub(null);
      setIsModalOpen(true);
  };

  const handleEdit = (sub: Subscription) => {
      setEditingSub(sub);
      setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (itemToDelete) {
          deleteSubscription(itemToDelete);
          addNotification('Subscrição removida.', 'info');
          setItemToDelete(null);
      }
  };

  const handleSubmit = (data: Omit<Subscription, 'id' | 'active'>) => {
      if (editingSub) {
          updateSubscription(editingSub.id, data);
          addNotification('Subscrição atualizada.', 'success');
      } else {
          addSubscription({
              ...data,
              active: true
          });
          addNotification('Subscrição criada.', 'success');
      }
      setIsModalOpen(false);
      setEditingSub(null);
  };

  const getDaysUntilRenewal = (dateStr: string) => {
      const renewal = new Date(dateStr);
      const today = new Date();
      
      // Normalize times
      renewal.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      
      const diffTime = renewal.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
  };

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <CreditCard className="text-pink-500" />
            {t('subscriptions_title', language)}
          </h1>
          <p className="text-text-muted">{t('subscriptions_desc', language)}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
        >
          <Plus size={20} />
          <span>{t('add_subscription', language)}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface border border-border p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-text-muted font-medium">{t('monthly_cost', language)}</h3>
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                      <Calendar size={20} />
                  </div>
              </div>
              <div className="text-3xl font-bold text-white">{formatMoney(monthlyTotal)}</div>
              <p className="text-xs text-text-muted mt-1">{t('subs_total_impact', language)}</p>
          </div>
          <div className="bg-surface border border-border p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-text-muted font-medium">{t('yearly_cost', language)}</h3>
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                      <Zap size={20} />
                  </div>
              </div>
              <div className="text-3xl font-bold text-white">{formatMoney(yearlyTotal)}</div>
              <p className="text-xs text-text-muted mt-1">Custo total anual estimado</p>
          </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map(sub => {
              const daysLeft = getDaysUntilRenewal(sub.nextPaymentDate);
              const isUrgent = daysLeft <= 3 && daysLeft >= 0;
              
              return (
                  <motion.div 
                    key={sub.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface border border-border p-6 rounded-xl relative group hover:border-white/20 transition-all"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                            style={{ backgroundColor: sub.color }}
                          >
                              {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button onClick={() => handleEdit(sub)} className="p-2 hover:bg-white/10 rounded text-text-muted hover:text-white">
                                  <Edit2 size={16} />
                              </button>
                              <button onClick={() => setItemToDelete(sub.id)} className="p-2 hover:bg-red-500/10 rounded text-text-muted hover:text-red-500">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{sub.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold text-white">{formatMoney(sub.amount)}</span>
                          <span className="text-xs text-text-muted bg-white/5 px-2 py-1 rounded uppercase tracking-wide">
                              {sub.billingCycle === 'monthly' ? t('billing_monthly', language) : t('billing_yearly', language)}
                          </span>
                      </div>

                      <div className="pt-4 border-t border-border">
                          <div className="flex justify-between text-sm mb-1">
                              <span className="text-text-muted">{t('next_payment', language)}</span>
                              <span className={`${isUrgent ? 'text-red-400 font-bold' : 'text-white'}`}>
                                  {formatDate(sub.nextPaymentDate)}
                              </span>
                          </div>
                          {daysLeft >= 0 && (
                              <div className={`text-xs text-right ${isUrgent ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                                  {daysLeft === 0 ? t('renew_today', language) : `${daysLeft} ${t('days_left', language)}`}
                              </div>
                          )}
                      </div>
                  </motion.div>
              );
          })}

          {subscriptions.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl text-text-muted">
                  <CreditCard size={48} className="mb-4 opacity-50" />
                  <p>{t('no_subscriptions', language)}</p>
              </div>
          )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSub ? t('edit_subscription', language) : t('create_subscription', language)}
      >
          <SubscriptionForm 
            initialData={editingSub} 
            onSubmit={handleSubmit} 
            onCancel={() => setIsModalOpen(false)} 
          />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={t('remove_budget', language).replace('Orçamento', 'Subscrição')} // Quick fix reuse trans key
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertCircle size={24} />
            <p className="text-sm font-medium">{t('confirm_delete', language)}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setItemToDelete(null)}
              className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg text-white hover:bg-zinc-800 transition-colors"
            >
              {t('cancel', language)}
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {t('confirm', language)}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;