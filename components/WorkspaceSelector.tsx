
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { ChevronDown, Plus, Users, Check, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';

const WorkspaceSelector = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, checkAccess } = useFinance();
  const { addNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const canCreate = checkAccess('workspaces');

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newWorkspaceName) return;
      try {
          await createWorkspace(newWorkspaceName);
          addNotification('Espaço criado com sucesso!', 'success');
          setIsCreating(false);
          setNewWorkspaceName('');
          setIsOpen(false);
      } catch (e) {
          addNotification('Erro ao criar espaço.', 'error');
      }
  };

  return (
    <div className="relative px-4 mb-6">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${currentWorkspace ? 'bg-purple-500' : 'bg-zinc-700'}`}>
                    {currentWorkspace ? <Briefcase size={16} /> : <Users size={16} />}
                </div>
                <div className="text-left">
                    <div className="text-xs text-text-muted font-bold uppercase tracking-wider">Espaço</div>
                    <div className="text-sm font-bold text-white truncate w-28">
                        {currentWorkspace ? currentWorkspace.name : 'Pessoal'}
                    </div>
                </div>
            </div>
            <ChevronDown size={16} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-4 right-4 mt-2 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                    <div className="p-1">
                        <button
                            onClick={() => { switchWorkspace(null); setIsOpen(false); }}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white">
                                    <Users size={16} />
                                </div>
                                <span className="font-medium text-white">Pessoal</span>
                            </div>
                            {!currentWorkspace && <Check size={16} className="text-primary" />}
                        </button>

                        {workspaces.map(ws => (
                            <button
                                key={ws.id}
                                onClick={() => { switchWorkspace(ws.id); setIsOpen(false); }}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
                                        <Briefcase size={16} />
                                    </div>
                                    <span className="font-medium text-white truncate max-w-[120px]">{ws.name}</span>
                                </div>
                                {currentWorkspace?.id === ws.id && <Check size={16} className="text-primary" />}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-white/10 p-2">
                        {isCreating ? (
                            <form onSubmit={handleCreate} className="flex flex-col gap-2 p-1">
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="Nome do Espaço"
                                    className="bg-black/50 border border-white/20 rounded px-2 py-1.5 text-sm text-white outline-none focus:border-primary"
                                    value={newWorkspaceName}
                                    onChange={e => setNewWorkspaceName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-primary text-white text-xs font-bold py-1.5 rounded hover:bg-primary-hover">Criar</button>
                                    <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-1.5 rounded hover:bg-white/20">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button
                                disabled={!canCreate}
                                onClick={() => setIsCreating(true)}
                                className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-white/20 text-xs font-medium transition-colors ${canCreate ? 'text-text-muted hover:text-white hover:bg-white/5' : 'text-zinc-600 cursor-not-allowed'}`}
                            >
                                <Plus size={14} />
                                {canCreate ? 'Criar Novo Espaço' : 'Upgrade para Criar'}
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default WorkspaceSelector;
