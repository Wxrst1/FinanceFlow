
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { Settings as SettingsIcon, Globe, Coins, LogOut, User, AlertCircle, Trash2, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { CurrencyCode, LanguageCode } from '../types';
import { t } from '../utils';
import Modal from './Modal';

const Settings = () => {
  const { 
      user, currency, language, updatePreferences, logout, deleteUserAccount, 
      isPrivacyEnabled, togglePrivacyMode, transactions, goals, accounts 
  } = useFinance();
  const { addNotification } = useNotification();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSave = async (newCurrency: CurrencyCode, newLanguage: LanguageCode) => {
      await updatePreferences(newCurrency, newLanguage);
      addNotification(t('preferences_updated', language), 'success');
  };

  const handleDeleteAccount = async () => {
      try {
          await deleteUserAccount();
          addNotification('Conta apagada com sucesso.', 'info');
      } catch (error) {
          console.error("Delete account failed", error);
          addNotification('Erro ao apagar conta.', 'error');
      }
  };

  const handleExport = () => {
      const data = {
          transactions,
          goals,
          accounts,
          exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financeflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification('Backup exportado com sucesso.', 'success');
  };

  return (
    <div className="p-8 animate-fade-in max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
          <SettingsIcon className="text-primary" />
          {t('settings_title', language)}
        </h1>
        <p className="text-text-muted">{t('settings_desc', language)}</p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <div className="bg-surface border border-border rounded-xl p-6">
           <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                   {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full" /> : <User size={32} />}
               </div>
               <div className="flex-1">
                   <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                   <p className="text-text-muted">{user?.email}</p>
               </div>
               
               {/* Distinct Plan Badge */}
               <div className="flex flex-col items-end">
                    <span className="text-xs text-text-muted uppercase mb-1 font-bold tracking-wider">{t('plan', language)}</span>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide border ${
                        user?.plan === 'pro' ? 'bg-primary/20 text-primary border-primary/50' : 
                        user?.plan === 'business' ? 'bg-purple-500/20 text-purple-500 border-purple-500/50' : 
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                        {user?.plan || 'Starter'}
                    </div>
               </div>
           </div>
           
           <div className="border-t border-border pt-4 mt-4">
               <button 
                 onClick={logout}
                 className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-sm font-medium"
               >
                   <LogOut size={16} />
                   {t('logout_button', language)}
               </button>
           </div>
        </div>

        {/* Interface Settings */}
        <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">{t('interface_privacy', language)}</h3>
            
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPrivacyEnabled ? 'bg-primary/20 text-primary' : 'bg-zinc-700 text-zinc-400'}`}>
                        {isPrivacyEnabled ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                    <div>
                        <h4 className="font-medium text-white">{t('privacy_mode', language)}</h4>
                        <p className="text-xs text-text-muted">{t('privacy_desc', language)}</p>
                    </div>
                </div>
                <button 
                    onClick={togglePrivacyMode}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isPrivacyEnabled ? 'bg-primary' : 'bg-zinc-700'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${isPrivacyEnabled ? 'translate-x-6' : ''}`} />
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                        <Coins size={16} /> {t('main_currency', language)}
                    </label>
                    <select 
                        value={currency}
                        onChange={(e) => handleSave(e.target.value as CurrencyCode, language)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dólar Americano ($)</option>
                        <option value="GBP">Libra Esterlina (£)</option>
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="JPY">Iene Japonês (¥)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                        <Globe size={16} /> {t('language', language)}
                    </label>
                    <select 
                        value={language}
                        onChange={(e) => handleSave(currency, e.target.value as LanguageCode)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Data Management */}
        <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">{t('data_management', language)}</h3>
            <div className="flex gap-4">
                <button 
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg transition-colors"
                >
                    <Download size={18} />
                    {t('export_data', language)}
                </button>
                {/* Import functionality placeholder */}
                <button 
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 cursor-not-allowed py-3 rounded-lg transition-colors"
                    title="Em breve"
                >
                    <Upload size={18} />
                    {t('import_data', language)}
                </button>
            </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
                <AlertCircle size={20} />
                {t('danger_zone', language)}
            </h3>
            <p className="text-sm text-red-200/60 mb-6 max-w-lg">
                {t('delete_account_desc', language)}
            </p>
            
            <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
            >
                <Trash2 size={16} />
                {t('delete_account', language)}
            </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={t('delete_account_confirm_title', language)}
      >
          <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 text-red-200">
                  <AlertCircle className="shrink-0 text-red-500" size={24} />
                  <p className="text-sm leading-relaxed">
                      {t('delete_account_confirm_msg', language)}
                  </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                  <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="flex-1 py-3 bg-transparent border border-border hover:bg-white/5 text-text-muted hover:text-white rounded-lg transition-colors font-medium"
                  >
                      {t('cancel', language)}
                  </button>
                  <button 
                      onClick={handleDeleteAccount}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-900/20"
                  >
                      {t('confirm', language)}
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Settings;
