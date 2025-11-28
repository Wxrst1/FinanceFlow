
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { Bell, AlertTriangle, CheckCircle2, CalendarClock, TrendingDown, CreditCard, History, Trash2, Info, XCircle, Users, Check, X } from 'lucide-react';
import { t, formatDate } from '../utils';

const NotificationsPage = () => {
  const { fixedExpenses, budget, transactions, subscriptions, formatMoney, language, pendingInvites, acceptInvite, rejectInvite } = useFinance();
  const { history, clearHistory } = useNotification();
  const today = new Date().getDate();
  
  // Generate Intelligent Notifications (Active Alerts)
  const alerts = [];

  // 1. Budget Alerts
  const currentMonth = new Date().getMonth();
  const currentExpenses = transactions
    .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && t.type === 'expense';
    })
    .reduce((acc, t) => acc + t.amount, 0);

  if (budget) {
      const percentage = (currentExpenses / budget) * 100;
      if (percentage >= 100) {
          alerts.push({
              id: 'budget-crit',
              type: 'critical',
              title: t('budget_exceeded', language),
              message: `${t('budget_exceeded_msg', language)} ${formatMoney(budget)}.`,
              icon: AlertTriangle,
              color: 'text-red-500 bg-red-500/10'
          });
      } else if (percentage >= 85) {
           alerts.push({
              id: 'budget-warn',
              type: 'warning',
              title: t('budget_warning', language),
              message: `${t('budget_warning_msg', language)} ${percentage.toFixed(0)}% ${t('of', language)} ${t('monthly_budget', language).toLowerCase()}.`,
              icon: TrendingDown,
              color: 'text-yellow-500 bg-yellow-500/10'
          });
      }
  }

  // 2. Fixed Expenses Due Soon (Next 3 days)
  fixedExpenses.forEach(expense => {
      // Simple logic: if day is today or next 3 days
      let diff = expense.day - today;
      // Handle month wrapping (simple version)
      if (diff < 0) diff += 30; 

      if (diff === 0) {
          const msg = t('bill_due_today_msg', language)
            .replace('{desc}', expense.description)
            .replace('{amount}', formatMoney(expense.amount));
            
          alerts.push({
              id: `due-${expense.id}`,
              type: 'info',
              title: t('bill_due_today', language),
              message: msg,
              icon: CalendarClock,
              color: 'text-blue-500 bg-blue-500/10'
          });
      } else if (diff > 0 && diff <= 3) {
          const msg = t('bill_due_soon_msg', language)
            .replace('{desc}', expense.description)
            .replace('{days}', diff.toString());

          alerts.push({
              id: `due-${expense.id}`,
              type: 'info',
              title: t('bill_due_soon', language),
              message: msg,
              icon: CalendarClock,
              color: 'text-blue-500 bg-blue-500/10'
          });
      }
  });

  // 3. Subscription Renewals (Check dates)
  const todayDate = new Date();
  subscriptions.forEach(sub => {
      const renewalDate = new Date(sub.nextPaymentDate);
      const diffTime = renewalDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
          const msg = t('sub_renew_soon_msg', language)
            .replace('{name}', sub.name)
            .replace('{amount}', formatMoney(sub.amount))
            .replace('{days}', diffDays === 0 ? 'HOJE' : diffDays.toString());

          alerts.push({
              id: `sub-${sub.id}`,
              type: 'info',
              title: t('sub_renew_soon', language),
              message: msg,
              icon: CreditCard,
              color: 'text-pink-500 bg-pink-500/10'
          });
      }
  });

  // 4. Welcome / General (only if no other alerts and no invites)
  if (alerts.length === 0 && pendingInvites.length === 0) {
      alerts.push({
          id: 'all-good',
          type: 'success',
          title: t('all_good', language),
          message: t('all_good_msg', language),
          icon: CheckCircle2,
          color: 'text-green-500 bg-green-500/10'
      });
  }

  const getHistoryIcon = (type: string) => {
      switch (type) {
          case 'success': return CheckCircle2;
          case 'error': return XCircle;
          case 'warning': return AlertTriangle;
          default: return Info;
      }
  };

  const getHistoryColor = (type: string) => {
      switch (type) {
          case 'success': return 'text-green-500';
          case 'error': return 'text-red-500';
          case 'warning': return 'text-yellow-500';
          default: return 'text-blue-500';
      }
  };

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
          <Bell className="text-primary" />
          {t('notifications', language)}
        </h1>
        <p className="text-text-muted">Alertas inteligentes sobre as suas finanças.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Alerts Column */}
          <div className="space-y-6">
              
              {/* Workspace Invites Section */}
              {pendingInvites.length > 0 && (
                  <div className="animate-fade-in-up">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Users size={20} className="text-purple-500" />
                          Convites de Espaço
                      </h2>
                      <div className="space-y-4">
                          {pendingInvites.map(invite => (
                              <div key={invite.id} className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-purple-900/20">
                                  <div>
                                      <h3 className="text-lg font-bold text-white">{invite.workspaceName}</h3>
                                      <p className="text-sm text-purple-200 mt-1">
                                          Convidado por <span className="font-bold text-white">{invite.inviterName}</span> como <span className="capitalize bg-purple-500/20 px-2 py-0.5 rounded text-xs">{invite.role}</span>
                                      </p>
                                  </div>
                                  <div className="flex gap-2 w-full sm:w-auto">
                                      <button 
                                          onClick={() => acceptInvite(invite.id)}
                                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                      >
                                          <Check size={16} /> Aceitar
                                      </button>
                                      <button 
                                          onClick={() => rejectInvite(invite.id)}
                                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                      >
                                          <X size={16} /> Recusar
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-yellow-500" />
                      Alertas Ativos
                  </h2>
                  <div className="space-y-4">
                    {alerts.map(alert => {
                        const Icon = alert.icon;
                        return (
                            <div key={alert.id} className="bg-surface border border-border p-5 rounded-xl flex items-start gap-4 hover:border-border/80 transition-colors">
                                <div className={`p-3 rounded-lg shrink-0 ${alert.color}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{alert.title}</h3>
                                    <p className="text-text-muted leading-relaxed">{alert.message}</p>
                                </div>
                            </div>
                        )
                    })}
                  </div>
              </div>
          </div>

          {/* History Column */}
          <div>
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <History size={20} className="text-blue-500" />
                      Histórico Recente
                  </h2>
                  {history.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        className="text-xs flex items-center gap-1 text-text-muted hover:text-red-500 transition-colors"
                      >
                          <Trash2 size={12} /> Limpar
                      </button>
                  )}
              </div>
              
              <div className="bg-surface border border-border rounded-xl overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar">
                  {history.length === 0 ? (
                      <div className="p-8 text-center text-text-muted">
                          <p className="text-sm">Sem histórico de notificações.</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-border">
                          {history.map(item => {
                              const Icon = getHistoryIcon(item.type);
                              const colorClass = getHistoryColor(item.type);
                              const date = new Date(item.timestamp);
                              
                              return (
                                  <div key={item.id} className="p-4 hover:bg-white/5 transition-colors flex gap-3">
                                      <div className={`mt-0.5 ${colorClass}`}>
                                          <Icon size={16} />
                                      </div>
                                      <div className="flex-1">
                                          <p className="text-sm text-white leading-snug">{item.message}</p>
                                          <p className="text-[10px] text-text-muted mt-1">
                                              {date.toLocaleDateString()} às {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
