
import { Transaction, Budget, Subscription, Goal, NotificationType, NotificationSetting, User, RiskAnalysis } from "../types";
import { t, formatCurrency } from "../utils";
import { isSupabaseConfigured, supabase } from "./supabase";

export const NotificationsService = {
    
    // Helper: Call Supabase Edge Function
    sendEmail: async (to: string, subject: string, html: string) => {
        if (!isSupabaseConfigured) {
            console.warn("[Mock Email] To:", to, "Subject:", subject);
            return;
        }
        
        try {
            await supabase!.functions.invoke('send-email', {
                body: { to, subject, html }
            });
        } catch (e) {
            console.error("Error sending email:", e);
        }
    },

    // Check all conditions
    checkAll: async (
        settings: NotificationSetting[],
        transactions: Transaction[],
        budgets: Budget[],
        subscriptions: Subscription[],
        goals: Goal[],
        risk: RiskAnalysis,
        user: User | null
    ): Promise<{ message: string, type: 'info' | 'warning' | 'success' | 'error' }[]> => {
        if (!user) return [];
        const alerts: { message: string, type: 'info' | 'warning' | 'success' | 'error' }[] = [];

        // 1. Check Budgets
        const budgetSetting = settings.find(s => s.type === 'budget_exceeded');
        if (budgetSetting && budgetSetting.inAppEnabled) {
            const currentMonth = new Date().getMonth();
            for (const budget of budgets) {
                const spent = transactions
                    .filter(t => t.type === 'expense' && (budget.category === 'Global' || t.category === budget.category) && new Date(t.date).getMonth() === currentMonth)
                    .reduce((acc, t) => acc + t.amount, 0);
                
                const threshold = budgetSetting.threshold || 100; // Default 100% if not set, or budget's own alertThreshold
                const limit = budget.amount * (threshold / 100);

                if (spent >= limit) {
                    const msg = `Alerta: Orçamento de ${budget.category} atingiu ${((spent/budget.amount)*100).toFixed(0)}%.`;
                    alerts.push({ message: msg, type: 'warning' });
                    
                    if (budgetSetting.emailEnabled) {
                        await NotificationsService.sendEmail(
                            user.email, 
                            `Alerta de Orçamento: ${budget.category}`, 
                            `<p>Você gastou <b>${formatCurrency(spent, user.currency, user.language)}</b> de ${formatCurrency(budget.amount, user.currency, user.language)}.</p>`
                        );
                    }
                }
            }
        }

        // 2. Check Subscriptions
        const subSetting = settings.find(s => s.type === 'subscription_renewal');
        if (subSetting && subSetting.inAppEnabled) {
            const today = new Date();
            const threeDaysLater = new Date();
            threeDaysLater.setDate(today.getDate() + 3);

            for (const sub of subscriptions) {
                if (!sub.active) continue;
                const renewal = new Date(sub.nextPaymentDate);
                if (renewal >= today && renewal <= threeDaysLater) {
                    const msg = `Renovação: ${sub.name} (${formatCurrency(sub.amount, user.currency, user.language)}) vence em breve.`;
                    alerts.push({ message: msg, type: 'info' });
                }
            }
        }

        // 3. Check Goals
        const goalSetting = settings.find(s => s.type === 'goal_reached');
        if (goalSetting && goalSetting.inAppEnabled) {
            for (const goal of goals) {
                if (goal.currentAmount >= goal.targetAmount && goal.targetAmount > 0) {
                    alerts.push({ message: `Parabéns! Atingiu a meta "${goal.name}".`, type: 'success' });
                }
            }
        }

        // 4. Forecast
        const forecastSetting = settings.find(s => s.type === 'negative_forecast');
        if (forecastSetting && forecastSetting.inAppEnabled) {
            if (risk.riskLevel === 'high') {
                alerts.push({ message: `Atenção: Previsão de saldo negativo nos próximos dias.`, type: 'error' });
            }
        }

        return alerts;
    },

    getDefaultSettings: (): NotificationSetting[] => [
        { id: '1', type: 'budget_exceeded', emailEnabled: true, inAppEnabled: true, threshold: 90 },
        { id: '2', type: 'subscription_renewal', emailEnabled: true, inAppEnabled: true },
        { id: '3', type: 'goal_reached', emailEnabled: true, inAppEnabled: true },
        { id: '4', type: 'negative_forecast', emailEnabled: false, inAppEnabled: true },
        { id: '5', type: 'monthly_report', emailEnabled: true, inAppEnabled: false },
    ]
};
