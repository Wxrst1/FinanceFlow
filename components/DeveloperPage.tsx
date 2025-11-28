
import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { ApiKeyService } from '../services/apiKeyService';
import { ApiKey } from '../types';
import { t } from '../utils';
import { Key, Plus, Trash2, Copy, Code, Terminal } from 'lucide-react';
import Modal from './Modal';

const DeveloperPage = () => {
    const { currentWorkspace, language, formatMoney } = useFinance();
    const { addNotification } = useNotification();
    
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    useEffect(() => {
        if (currentWorkspace) {
            loadKeys();
        }
    }, [currentWorkspace]);

    const loadKeys = async () => {
        if (!currentWorkspace) return;
        const data = await ApiKeyService.getKeys(currentWorkspace.id);
        setKeys(data);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorkspace || !newKeyName) return;

        try {
            const newKey = await ApiKeyService.generateKey(currentWorkspace.id, newKeyName);
            setGeneratedKey(newKey.key);
            loadKeys();
            addNotification('Chave API criada com sucesso.', 'success');
        } catch (e) {
            addNotification('Erro ao criar chave.', 'error');
        }
    };

    const handleRevoke = async (id: string) => {
        if (window.confirm('Tem certeza? Aplicações usando esta chave deixarão de funcionar.')) {
            await ApiKeyService.revokeKey(id);
            loadKeys();
            addNotification('Chave revogada.', 'info');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addNotification('Copiado para a área de transferência', 'success');
    };

    const endpoints = [
        { method: 'GET', path: '/transactions', desc: 'Listar histórico de transações' },
        { method: 'GET', path: '/accounts', desc: 'Saldos de contas bancárias' },
        { method: 'GET', path: '/networth', desc: 'Resumo de património' },
    ];

    return (
        <div className="p-8 animate-fade-in max-w-6xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Terminal className="text-green-500" />
                        {t('developer_keys_title', language)}
                    </h1>
                    <p className="text-text-muted">{t('developer_keys_desc', language)}</p>
                </div>
                <button
                    onClick={() => { setNewKeyName(''); setGeneratedKey(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
                >
                    <Plus size={20} />
                    <span>{t('generate_key', language)}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* API Keys List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        {keys.length === 0 ? (
                            <div className="p-8 text-center text-text-muted flex flex-col items-center">
                                <Key size={48} className="mb-4 opacity-50" />
                                <p>{t('no_keys', language)}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {keys.map(k => (
                                    <div key={k.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-zinc-800 rounded-lg text-zinc-400">
                                                <Key size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{k.name}</h3>
                                                <p className="text-xs text-text-muted font-mono mt-1">
                                                    {k.key.substring(0, 8)}...
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-1">
                                                    {t('created_at', language)}: {new Date(k.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRevoke(k.id)}
                                            className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={16} /> {t('revoke', language)}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Documentation Snippet */}
                    <div className="bg-black/40 border border-border rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Code size={20} className="text-blue-400" />
                            {t('api_docs', language)}
                        </h3>
                        
                        <div className="space-y-4">
                            {endpoints.map((ep, idx) => (
                                <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                {ep.method}
                                            </span>
                                            <span className="text-sm text-zinc-300 font-mono">{ep.path}</span>
                                        </div>
                                        <span className="text-xs text-zinc-500">{ep.desc}</span>
                                    </div>
                                    <div className="bg-black p-3 rounded text-xs text-zinc-400 font-mono overflow-x-auto">
                                        curl -H "x-api-key: YOUR_KEY" https://financeflow-api.supabase.co{ep.path}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Context / Info */}
                <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                        <h3 className="font-bold text-blue-200 mb-2">Espaço Atual</h3>
                        <p className="text-white text-lg font-bold mb-1">{currentWorkspace?.name || 'Pessoal'}</p>
                        <p className="text-xs text-blue-200/60">As chaves geradas aqui darão acesso apenas aos dados deste espaço.</p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setGeneratedKey(null); }} title={t('generate_key', language)}>
                {!generatedKey ? (
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">{t('key_name', language)}</label>
                            <input 
                                type="text" 
                                required
                                autoFocus
                                placeholder="Ex: Zapier, Google Sheets"
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={newKeyName}
                                onChange={e => setNewKeyName(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg mt-2">
                            Criar Chave
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 mb-2">
                            <Key size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Chave Gerada!</h3>
                        <p className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                            {t('copy_key_warning', language)}
                        </p>
                        
                        <div className="bg-black border border-zinc-700 rounded-lg p-4 flex items-center justify-between gap-2">
                            <code className="text-green-400 font-mono text-sm break-all text-left">
                                {generatedKey}
                            </code>
                            <button 
                                onClick={() => copyToClipboard(generatedKey)}
                                className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                            >
                                <Copy size={18} />
                            </button>
                        </div>

                        <button 
                            onClick={() => { setIsModalOpen(false); setGeneratedKey(null); }}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg mt-2"
                        >
                            Concluído
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DeveloperPage;
