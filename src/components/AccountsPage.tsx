
import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Plus, Trash2, AlertCircle, Wallet, Building2, CreditCard, Edit2, ArrowRightLeft, Upload, Smartphone } from 'lucide-react';
import { generateId, t } from '@/utils';
import { BankAccount, Transaction } from '@/types';
import Modal from './Modal';
import UpgradeModal from './UpgradeModal';
import BankAccountForm, { BankAccountInput } from './BankAccountForm';
import TransferModal from './TransferModal';
import BankCsvImportModal from './BankCsvImportModal';
import { motion } from 'framer-motion';

const AccountsPage = () => {
  const { 
    accounts, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    transferFunds,
    addMultipleTransactions,
    getPlanLimits,
    formatMoney,
    language
  } = useFinance();
  const { addNotification } = useNotification();
  
  // States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [accountForImport, setAccountForImport] = useState<BankAccount | null>(null);

  const limits = getPlanLimits();
  const isLimitReached = accounts.length >= limits.maxAccounts;

  // --- Handlers ---

  const handleAddAccount = () => {
    if (isLimitReached) {
        setIsUpgradeModalOpen(true);
    } else {
        setEditingAccount(null);
        setIsFormModalOpen(true);
    }
  };

  const handleEditAccount = (account: BankAccount) => {
      setEditingAccount(account);
      setIsFormModalOpen(true);
  };

  const handleImportClick = (account: BankAccount) => {
      setAccountForImport(account);
      setIsImportModalOpen(true);
  };

  const handleFormSubmit = (data: BankAccountInput) => {
    if (editingAccount) {
        updateAccount(editingAccount.id, data);
        addNotification('Conta atualizada com sucesso!', 'success');
    } else {
        addAccount({
            id: generateId(),
            ...data,
            balance: data.initialBalance, // Set balance to initial for new accounts
            enabled: true
        });
        addNotification('Conta criada com sucesso!', 'success');
    }
    setIsFormModalOpen(false);
    setEditingAccount(null);
  };

  const handleTransferSubmit = (sourceId: string, destId: string, amount: number, date: string) => {
      transferFunds(sourceId, destId, amount, date);
      addNotification('Transferência realizada com sucesso!', 'success');
      setIsTransferModalOpen(false);
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

  const handleImportSubmit = (transactions: Partial<Transaction>[]) => {
      if (!accountForImport) return;

      const newTransactions: Transaction[] = transactions.map(t => ({
          id: generateId(),
          description: t.description || 'Sem descrição',
          amount: t.amount || 0,
          date: t.date || new Date().toISOString(),
          category: t.category || 'Outros',
          type: t.type || 'expense',
          tags: [...(t.tags || [])],
          accountId: accountForImport.id,
          isPersisted: true
      }));

      addMultipleTransactions(newTransactions);

      // Recalculate balance locally for immediate feedback (Context does this too but good to be safe)
      const netChange = newTransactions.reduce((acc, t) => {
          return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }, 0);

      updateAccount(accountForImport.id, {
          balance: accountForImport.balance + netChange
      });

      addNotification(`${newTransactions.length} transações importadas com sucesso.`, 'success');
      setIsImportModalOpen(false);
      setAccountForImport(null);
  };

  const renderIcon = (iconName: string) => {
      switch(iconName) {
          case 'Building2': return <Building2 size={24} />;
          case 'CreditCard': return <CreditCard size={24} />;
          case 'PiggyBank': return <Wallet size={24} />; // Map PiggyBank visually to Wallet icon or similar if needed
          default: return <Wallet size={24} />;
      }
  };

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Wallet className="text-primary" />
            Minhas Contas
          </h1>
          <p className="text-text-muted">Gerencie os seus saldos e transferências.</p>
        </div>
        <div className="flex gap-3">
             <button
                onClick={() => setIsTransferModalOpen(true)}
                disabled={accounts.length < 2}
                className="flex items-center gap-2 border border-border px-4 py-2.5 rounded-lg font-medium text-text-muted hover:text-white hover:bg-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowRightLeft size={18} />
                <span>Transferir</span>
            </button>
            <button
                onClick={handleAddAccount}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
            >
                <Plus size={20} />
                <span>Nova Conta</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
            <div 
                key={acc.id} 
                className="relative p-6 rounded-xl border border-white/5 shadow-xl overflow-hidden group min-h-[220px] flex flex-col justify-between transition-all hover:-translate-y-1"
                style={{ background: `linear-gradient(135deg, ${acc.color}20 0%, rgba(24,24,27,1) 100%)` }}
            >
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => handleEditAccount(acc)}
                        className="p-2 bg-black/20 hover:bg-black/40 rounded-lg text-white backdrop-blur-sm transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => handleDeleteRequest(acc.id)}
                        className="p-2 bg-black/20 hover:bg-red-500/80 rounded-lg text-white backdrop-blur-sm transition-colors"
                        title="Remover"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md text-white">
                        {renderIcon(acc.icon)}
                    </div>
                </div>

                {/* Info */}
                <div>
                    <h3 className="font-bold text-lg text-white truncate mb-1">{acc.name}</h3>
                    <p className="text-xs text-white/60 font-medium uppercase tracking-wider mb-4">{acc.type}</p>
                    
                    <motion.div 
                        key={acc.balance}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold text-white"
                    >
                        {formatMoney(acc.balance)}
                    </motion.div>
                </div>

                {/* Import Button */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <button 
                        onClick={() => handleImportClick(acc)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-colors"
                    >
                        <Upload size={12} /> Importar Extrato
                    </button>
                </div>
            </div>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
             <div className="col-span-full text-center py-16 border-2 border-dashed border-border rounded-xl bg-surface/30">
                 <Wallet size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
                 <h3 className="text-xl font-bold text-white mb-2">Nenhuma conta criada</h3>
                 <p className="text-text-muted mb-6">Crie contas virtuais para organizar o seu dinheiro (Carteira, Banco, Poupança).</p>
                 <button onClick={handleAddAccount} className="text-primary hover:underline">Criar Primeira Conta</button>
             </div>
        )}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingAccount ? 'Editar Conta' : 'Nova Conta'}
      >
        <BankAccountForm 
            initialData={editingAccount} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormModalOpen(false)} 
        />
      </Modal>

      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transferência entre Contas"
      >
          <TransferModal 
            onClose={() => setIsTransferModalOpen(false)}
            onSubmit={handleTransferSubmit}
            accounts={accounts}
          />
      </Modal>

      <BankCsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSubmit}
        accountName={accountForImport?.name || ''}
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

export default AccountsPage;
