
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Landmark, Plus, Trash2, AlertCircle, Upload, Wallet, CreditCard, Building2, Edit2, RefreshCw, Wifi, Globe } from 'lucide-react';
import { generateId, t } from '@/utils';
import { BankAccount, Transaction } from '@/types';
import { BankInstitution, RealBankService } from '@/services/realBankService';
import Modal from './Modal';
import UpgradeModal from './UpgradeModal';
import BankAccountForm, { BankAccountInput } from './BankAccountForm';
import BankCsvImportModal from './BankCsvImportModal';
import BankSelectionModal from './BankSelectionModal';
import { motion } from 'framer-motion';

const BankSync = () => {
  const { 
    accounts, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    addMultipleTransactions,
    refreshBankData,
    getPlanLimits,
    formatMoney,
    language,
    checkAccess
  } = useFinance();
  const { addNotification } = useNotification();
  
  // States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBankSelectionOpen, setIsBankSelectionOpen] = useState(false);

  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [selectedAccountForImport, setSelectedAccountForImport] = useState<BankAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);

  const limits = getPlanLimits();
  const isLimitReached = accounts.length >= limits.maxAccounts;
  const canAutoSync = checkAccess('bankSync');

  // --- Handlers ---

  const handleManualAdd = () => {
    if (isLimitReached) {
        setIsUpgradeModalOpen(true);
    } else {
        setEditingAccount(null);
        setIsFormModalOpen(true);
    }
  };

  const handleRealConnect = () => {
      if (isLimitReached && accounts.length >= limits.maxAccounts) {
           setIsUpgradeModalOpen(true);
           return;
      }
      if (!canAutoSync) {
          setIsUpgradeModalOpen(true);
          return;
      }
      setIsBankSelectionOpen(true);
  };

  const handleBankSelect = async (bank: BankInstitution) => {
      setIsBankSelectionOpen(false);
      addNotification('A redirecionar para o banco...', 'info');
      
      try {
          // Define the callback URL (current page + /bank-callback)
          const callbackUrl = `${window.location.origin}/bank-callback`;
          
          // 1. Get Auth Link from Backend
          const { link, requisitionId } = await RealBankService.connect(bank.id, callbackUrl);
          
          // 2. Save temporary requisition ID to local storage (to verify on return)
          localStorage.setItem('pending_requisition', requisitionId);
          
          // 3. Redirect User
          window.location.href = link;

      } catch (e: any) {
          console.error(e);
          addNotification('Erro ao iniciar conexão: ' + e.message, 'error');
      }
  };

  const handleEditAccount = (account: BankAccount) => {
      setEditingAccount(account);
      setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: BankAccountInput) => {
    if (editingAccount) {
        updateAccount(editingAccount.id, data);
        addNotification('Conta atualizada com sucesso!', 'success');
    } else {
        addAccount({
            id: generateId(),
            ...data,
            balance: data.initialBalance,
            enabled: true,
            lastSync: new Date().toISOString(),
            connected: false // Manual account by default
        });
        addNotification('Conta criada com sucesso!', 'success');
    }
    setIsFormModalOpen(false);
    setEditingAccount(null);
  };

  const handleRefreshBank = async (account: BankAccount) => {
      setSyncingAccount(account.id);
      try {
          await refreshBankData(account);
          addNotification('Sincronização concluída com sucesso.', 'success');
      } catch (e: any) {
          console.error(e);
          addNotification('Erro ao sincronizar: ' + e.message, 'error');
      } finally {
          setSyncingAccount(null);
      }
  };

  const handleDeleteRequest = (id: string) => {
      setAccountToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (accountToDelete) {
          deleteAccount(accountToDelete);
          addNotification('Conta removida.', 'info');
          setIsDeleteModalOpen(false);
          setAccountToDelete(null);
      }
  };

  const handleImportClick = (account: BankAccount) => {
      setSelectedAccountForImport(account);
      setIsImportModalOpen(true);
  };

  const handleImportSubmit = (transactions: Partial<Transaction>[]) => {
      if (!selectedAccountForImport) return;

      const newTransactions: Transaction[] = transactions.map(t => ({
          id: generateId(),
          description: t.description || 'Sem descrição',
          amount: t.amount || 0,
          date: t.date || new Date().toISOString(),
          category: t.category || 'Outros',
          type: t.type || 'expense',
          tags: [...(t.tags || []), selectedAccountForImport.name], // Fallback to name if bankName unavailable
          accountId: selectedAccountForImport.id,
          isPersisted: true
      }));

      addMultipleTransactions(newTransactions);

      const netChange = newTransactions.reduce((acc, t) => {
          return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }, 0);

      updateAccount(selectedAccountForImport.id, {
          balance: Number(selectedAccountForImport.balance) + netChange,
          lastSync: new Date().toISOString()
      });

      addNotification(`${newTransactions.length} transações importadas. Saldo atualizado.`, 'success');
      setIsImportModalOpen(false);
      setSelectedAccountForImport(null);
  };

  const renderIcon = (iconName: string) => {
      switch(iconName) {
          case 'Building2': return <Building2 size={24} />;
          case 'CreditCard': return <CreditCard size={24} />;
          default: return <Wallet size={24} />;
      }
  };

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Landmark className="text-primary" />
            {t('banks_title', language)}
          </h1>
          <p className="text-text-muted">{t('banks_desc', language)}</p>
        </div>
        <div className="flex gap-3">
             <button
                onClick={handleManualAdd}
                className="flex items-center gap-2 border border-border px-4 py-2.5 rounded-lg font-medium text-text-muted hover:text-white hover:bg-surface transition-all"
            >
                <Plus size={18} />
                <span>Conta Manual</span>
            </button>
            <button
                onClick={handleRealConnect}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
                    !canAutoSync 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
            >
                <Globe size={20} />
                <span>Conectar Banco</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
            <div key={acc.id} className="bg-surface border border-border p-6 rounded-xl relative group hover:border-primary/30 transition-all flex flex-col justify-between min-h-[220px]">
                {/* Actions Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${acc.connected ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-white'}`}>
                        {renderIcon(acc.icon)}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!acc.connected && (
                            <button 
                                onClick={() => handleEditAccount(acc)}
                                className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white"
                                title="Editar"
                            >
                                <Edit2 size={16} />
                            </button>
                        )}
                        <button 
                            onClick={() => handleDeleteRequest(acc.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500"
                            title="Remover"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-xl text-white truncate">{acc.bankName || acc.name}</h3>
                        {acc.connected && (
                             <div className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">
                                <Wifi size={10} /> Live
                             </div>
                        )}
                    </div>
                    <p className="text-sm text-text-muted">{acc.accountType || acc.type}</p>
                </div>

                {/* Balance */}
                <div className="mb-6">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t('current_balance', language)}</p>
                    <motion.p 
                        key={acc.balance}
                        initial={{ scale: 1.1, color: '#22c55e' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-white"
                    >
                        {formatMoney(acc.balance)}
                    </motion.p>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    {!acc.connected ? (
                         <button 
                            onClick={() => handleImportClick(acc)}
                            className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                        >
                            <Upload size={14} />
                            Importar Extrato (CSV)
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleRefreshBank(acc)}
                            disabled={syncingAccount === acc.id}
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors"
                        >
                            <RefreshCw size={14} className={syncingAccount === acc.id ? 'animate-spin' : ''} />
                            {syncingAccount === acc.id ? 'A Sincronizar...' : 'Atualizar Saldo'}
                        </button>
                    )}
                </div>
            </div>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
             <div className="col-span-full text-center py-16 border-2 border-dashed border-border rounded-xl">
                 <Landmark size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
                 <h3 className="text-xl font-bold text-white mb-2">Nenhuma conta conectada</h3>
                 <p className="text-text-muted mb-6">Adicione uma conta manual ou conecte o seu banco para começar.</p>
                 <div className="flex justify-center gap-4">
                    <button onClick={handleManualAdd} className="text-primary hover:underline">Criar Manual</button>
                    <button onClick={handleRealConnect} className="text-blue-500 hover:underline">Conectar Banco</button>
                 </div>
             </div>
        )}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingAccount ? t('edit_bank_account', language) : 'Conta Manual'}
      >
        <BankAccountForm 
            initialData={editingAccount} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormModalOpen(false)} 
        />
      </Modal>

      <BankCsvImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSubmit}
        accountName={selectedAccountForImport?.bankName || selectedAccountForImport?.name || ''}
      />
      
      <BankSelectionModal 
        isOpen={isBankSelectionOpen}
        onClose={() => setIsBankSelectionOpen(false)}
        onSelect={handleBankSelect}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('remove_account_title', language)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertCircle size={24} />
            <p className="text-sm font-medium">{t('warning', language)}</p>
          </div>
          <p className="text-text-muted">
            {t('remove_account_msg', language)}
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
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

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default BankSync;
