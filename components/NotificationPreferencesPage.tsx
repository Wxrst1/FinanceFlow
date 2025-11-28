
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { Bell, Mail, Smartphone, Save, AlertTriangle } from 'lucide-react';
import { t } from '../utils';
import { NotificationType } from '../types';

const NotificationPreferencesPage = () => {
    const { notificationSettings, updateNotificationSettings, language } = useFinance();
    const { addNotification } = useNotification();

    const handleToggle = (id: string, field: 'emailEnabled' | 'inAppEnabled') => {
        const setting = notificationSettings.find(s => s.id === id);
        if (setting) {
            updateNotificationSettings({ ...setting, [field]: !setting[field] });
        }
    };

    const handleThresholdChange = (id: string, val: string) => {
        const setting = notificationSettings.find(s => s.id === id);
        if (setting) {
            updateNotificationSettings({ ...setting, threshold: parseInt(val) });
        }
    };

    const settingsList = [
        { type: 'budget_exceeded', label: 'Orçamento Excedido', desc: 'Quando atingir uma % do limite.' },
        { type: 'subscription_renewal', label: 'Renovação de Subscrição', desc: '3 dias antes do pagamento.' },
        { type: 'goal_reached', label: 'Meta Atingida', desc: 'Quando completar um objetivo.' },
        { type: 'negative_forecast', label: 'Previsão Negativa', desc: 'Risco de saldo negativo (IA).' },
        { type: 'monthly_report', label: 'Relatório Mensal', desc: 'Resumo enviado por email.' },
    ];

    return (
        <div className="p-8 animate-fade-in max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Bell className="text-yellow-500" />
                    Preferências de Notificação
                </h1>
                <p className="text-text-muted">Escolha o que é importante para si e como quer receber alertas.</p>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-black/20 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <div className="col-span-6">Tipo de Alerta</div>
                    <div className="col-span-2 text-center flex flex-col items-center gap-1">
                        <Smartphone size={16} /> App
                    </div>
                    <div className="col-span-2 text-center flex flex-col items-center gap-1">
                        <Mail size={16} /> Email
                    </div>
                    <div className="col-span-2 text-center">Config</div>
                </div>

                <div className="divide-y divide-border">
                    {settingsList.map((item) => {
                        const setting = notificationSettings.find(s => s.type === item.type as NotificationType);
                        if (!setting) return null;

                        return (
                            <div key={item.type} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/5 transition-colors">
                                <div className="col-span-6">
                                    <h3 className="font-bold text-white text-sm">{item.label}</h3>
                                    <p className="text-xs text-text-muted mt-1">{item.desc}</p>
                                </div>
                                
                                {/* In-App Toggle */}
                                <div className="col-span-2 flex justify-center">
                                    <button 
                                        onClick={() => handleToggle(setting.id, 'inAppEnabled')}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${setting.inAppEnabled ? 'bg-primary' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${setting.inAppEnabled ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>

                                {/* Email Toggle */}
                                <div className="col-span-2 flex justify-center">
                                    <button 
                                        onClick={() => handleToggle(setting.id, 'emailEnabled')}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${setting.emailEnabled ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${setting.emailEnabled ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>

                                {/* Extra Config */}
                                <div className="col-span-2 flex justify-center">
                                    {item.type === 'budget_exceeded' && (
                                        <div className="flex items-center gap-1 bg-black/30 rounded-lg border border-white/10 px-2 py-1">
                                            <input 
                                                type="number" 
                                                className="w-8 bg-transparent text-white text-xs text-center outline-none"
                                                value={setting.threshold || 100}
                                                onChange={(e) => handleThresholdChange(setting.id, e.target.value)}
                                            />
                                            <span className="text-xs text-text-muted">%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={() => addNotification('Preferências guardadas.', 'success')}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg"
                >
                    <Save size={18} />
                    Guardar Alterações
                </button>
            </div>
        </div>
    );
};

export default NotificationPreferencesPage;
