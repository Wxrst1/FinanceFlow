
import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { TrendingUp, Plus, Trash2, Edit2, AlertCircle, Building, Car, Bitcoin, Coins, FileText, CreditCard, Wallet } from 'lucide-react';
import { t } from '../utils';
import { Asset } from '../types';
import Modal from './Modal';
import AssetForm from './AssetForm';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const NetWorthPage = () => {
  const { assets, accounts, netWorth, addAsset, updateAsset, deleteAsset, formatMoney, language } = useFinance();
  const { addNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Calculations
  const assetsList = assets.filter(a => a.type !== 'liability');
  const liabilitiesList = assets.filter(a => a.type === 'liability');
  
  const totalAssets = assetsList.reduce((acc, a) => acc + a.value, 0);
  const totalLiabilities = liabilitiesList.reduce((acc, a) => acc + a.value, 0);
  const totalLiquid = accounts.reduce((acc, a) => acc + a.balance, 0);
  
  const grossAssets = totalAssets + totalLiquid;

  // Chart Data
  const chartData = useMemo(() => {
      const data = [
          { name: t('liquid_assets', language), value: totalLiquid, color: '#3b82f6' }, // Blue
          ...assetsList.map(a => ({ name: a.name, value: a.value, color: '#22c55e' })), // Green
      ];
      // Group small assets? Maybe later.
      return data.filter(d => d.value > 0);
  }, [totalLiquid, assetsList, language]);

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6'];

  const handleAdd = () => {
      setEditingAsset(null);
      setIsModalOpen(true);
  };

  const handleEdit = (asset: Asset) => {
      setEditingAsset(asset);
      setIsModalOpen(true);
  };

  const handleSubmit = (data: Omit<Asset, 'id'>) => {
      if (editingAsset) {
          updateAsset(editingAsset.id, data);
          addNotification('Ativo atualizado.', 'success');
      } else {
          addAsset(data);
          addNotification('Ativo criado.', 'success');
      }
      setIsModalOpen(false);
      setEditingAsset(null);
  };

  const handleDeleteConfirm = () => {
      if (itemToDelete) {
          deleteAsset(itemToDelete);
          addNotification('Ativo removido.', 'info');
          setItemToDelete(null);
      }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'real_estate': return Building;
          case 'vehicle': return Car;
          case 'crypto': return Bitcoin;
          case 'cash': return Coins;
          case 'liability': return CreditCard;
          case 'investment': return TrendingUp;
          default: return FileText;
      }
  };

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            {t('net_worth_title', language)}
          </h1>
          <p className="text-text-muted">{t('net_worth_desc', language)}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
        >
          <Plus size={20} />
          <span>{t('add_asset', language)}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface border border-border p-6 rounded-xl">
              <h3 className="text-text-muted font-medium mb-2">{t('total_net_worth', language)}</h3>
              <div className="text-4xl font-bold text-white">{formatMoney(netWorth)}</div>
          </div>
          <div className="bg-surface border border-border p-6 rounded-xl">
              <h3 className="text-text-muted font-medium mb-2">Total Bruto (Ativos + Líquido)</h3>
              <div className="text-2xl font-bold text-green-500">{formatMoney(grossAssets)}</div>
          </div>
          <div className="bg-surface border border-border p-6 rounded-xl">
              <h3 className="text-text-muted font-medium mb-2">{t('total_liabilities', language)}</h3>
              <div className="text-2xl font-bold text-red-500">{formatMoney(totalLiabilities)}</div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Lists */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Liquid Assets (Read Only from Accounts) */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border bg-black/20 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <Wallet size={18} className="text-blue-500" />
                          {t('liquid_assets', language)}
                      </h3>
                      <span className="text-white font-mono">{formatMoney(totalLiquid)}</span>
                  </div>
                  <div className="divide-y divide-border">
                      {accounts.map(acc => (
                          <div key={acc.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                                      <Coins size={16} />
                                  </div>
                                  <span className="text-zinc-300">{acc.name}</span>
                              </div>
                              <span className="text-white font-medium">{formatMoney(acc.balance)}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Fixed Assets */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border bg-black/20 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <Building size={18} className="text-green-500" />
                          {t('total_assets', language)} (Fixos)
                      </h3>
                      <span className="text-white font-mono">{formatMoney(totalAssets)}</span>
                  </div>
                  <div className="divide-y divide-border">
                      {assetsList.length === 0 && <div className="p-6 text-center text-text-muted text-sm">Nenhum ativo registado.</div>}
                      {assetsList.map(asset => {
                          const Icon = getIcon(asset.type);
                          return (
                            <div key={asset.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <span className="text-zinc-300 block">{asset.name}</span>
                                        <span className="text-xs text-text-muted uppercase">{t(`asset_${asset.type}`, language)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-white font-medium">{formatMoney(asset.value)}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(asset)} className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-white">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => setItemToDelete(asset.id)} className="p-1.5 hover:bg-red-500/10 rounded text-text-muted hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                          )
                      })}
                  </div>
              </div>

              {/* Liabilities */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border bg-black/20 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <CreditCard size={18} className="text-red-500" />
                          {t('total_liabilities', language)}
                      </h3>
                      <span className="text-white font-mono">{formatMoney(totalLiabilities)}</span>
                  </div>
                  <div className="divide-y divide-border">
                      {liabilitiesList.length === 0 && <div className="p-6 text-center text-text-muted text-sm">Nenhuma dívida registada.</div>}
                      {liabilitiesList.map(asset => {
                          return (
                            <div key={asset.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                                        <CreditCard size={16} />
                                    </div>
                                    <span className="text-zinc-300">{asset.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-red-400 font-medium">-{formatMoney(asset.value)}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(asset)} className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-white">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => setItemToDelete(asset.id)} className="p-1.5 hover:bg-red-500/10 rounded text-text-muted hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                          )
                      })}
                  </div>
              </div>
          </div>

          {/* Right: Chart */}
          <div className="bg-surface border border-border p-6 rounded-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-6">Composição de Riqueza</h3>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => formatMoney(value)}
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="mt-6 text-center">
                  <p className="text-sm text-text-muted">O seu património líquido é composto maioritariamente por ativos {totalLiquid > totalAssets ? 'líquidos' : 'fixos'}.</p>
              </div>
          </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingAsset ? t('edit_asset', language) : t('create_asset', language)}
      >
          <AssetForm 
            initialData={editingAsset} 
            onSubmit={handleSubmit} 
            onCancel={() => setIsModalOpen(false)} 
          />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={t('remove_asset_title', language)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertCircle size={24} />
            <p className="text-sm font-medium">{t('warning', language)}</p>
          </div>
          <p className="text-text-muted">
            {t('remove_asset_msg', language)}
          </p>
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

export default NetWorthPage;
