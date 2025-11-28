

import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate, t } from '../utils';
import { Trash2, Search, ArrowUp, ArrowDown, AlertCircle, Edit2, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { Transaction } from '../types';
import TransactionForm from './TransactionForm';

const TransactionList = () => {
  const { transactions, deleteTransaction, language, formatMoney } = useFinance();
  const { addNotification } = useNotification();
  const [filter, setFilter] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const filtered = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(filter.toLowerCase()) ||
    transaction.category.toLowerCase().includes(filter.toLowerCase()) ||
    (transaction.tags && transaction.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const handleEdit = (e: React.MouseEvent, transaction: Transaction) => {
    e.stopPropagation();
    setEditingTransaction(transaction);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteTransaction(itemToDelete);
      addNotification('Transação removida.', 'info');
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('transactions', language)}</h1>
          <p className="text-text-muted">Histórico completo</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder', language)}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-text-muted text-sm font-medium hidden md:grid">
          <div className="col-span-4 pl-2">{t('description', language)}</div>
          <div className="col-span-2">{t('category', language)}</div>
          <div className="col-span-3">{t('date', language)}</div>
          <div className="col-span-2 text-right">{t('value', language)}</div>
          <div className="col-span-1 text-center">{t('actions', language)}</div>
        </div>

        <div className="divide-y divide-border">
          <AnimatePresence>
            {filtered.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                    {t('no_transactions', language)}
                </div>
            ) : (
                filtered.map(transaction => (
                <motion.div 
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={() => setEditingTransaction(transaction)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-white/5 transition-colors md:grid md:grid-cols-12 cursor-pointer group relative"
                >
                    <div className="flex items-center gap-3 md:col-span-4 md:pl-2">
                        <div className={`p-2 rounded-full shrink-0 ${transaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {transaction.type === 'income' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <span className="font-medium text-white truncate block">{transaction.description}</span>
                            <span className="md:hidden text-xs text-text-muted block">
                                {formatDate(transaction.date)} • {transaction.category}
                            </span>
                            {transaction.tags && transaction.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {transaction.tags.map((tag, i) => (
                                        <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <Tag size={8} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:block md:col-span-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-border text-text-muted border border-white/5">
                            {transaction.category}
                        </span>
                    </div>

                    <div className="hidden md:block md:col-span-3 text-text-muted text-sm">
                        {formatDate(transaction.date)}
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto md:contents">
                        <div className={`md:col-span-2 md:text-right font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                             {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
                        </div>
                        <div className="md:col-span-1 flex justify-end md:justify-center pl-4 gap-2">
                            <button 
                                type="button"
                                onClick={(e) => handleEdit(e, transaction)}
                                className="text-text-muted hover:text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors z-10 cursor-pointer hidden md:block"
                                title="Editar"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => confirmDelete(e, transaction.id)}
                                className="text-text-muted hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors z-10 cursor-pointer"
                                title="Remover"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal 
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title={t('new_transaction', language)}
      >
          <TransactionForm 
            onClose={() => setEditingTransaction(null)} 
            transactionToEdit={editingTransaction}
          />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={t('actions', language)}
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
              onClick={handleConfirmDelete}
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

export default TransactionList;