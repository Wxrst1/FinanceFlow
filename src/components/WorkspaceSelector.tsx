
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { ChevronDown, Check, Briefcase, Users, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkspaceSelector = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, checkAccess } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      if(newName) {
          createWorkspace(newName);
          setIsCreating(false);
          setNewName('');
          setIsOpen(false);
      }
  };

  return (
    <div className="relative px-4 mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white">
            {currentWorkspace ? <Briefcase size={16} /> : <Users size={16} />}
          </div>
          <div className="text-left overflow-hidden">
            <div className="text-xs text-text-muted font-bold uppercase">Espaço</div>
            <div className="text-sm font-bold text-white truncate">{currentWorkspace?.name || 'Pessoal'}</div>
          </div>
        </div>
        <ChevronDown size={16} className="text-text-muted" />
      </button>

      <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-4 right-4 mt-2 bg-[#18181b] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <button 
            onClick={() => { switchWorkspace(null); setIsOpen(false); }}
            className="w-full flex items-center justify-between p-3 hover:bg-white/5 text-left"
          >
            <span className="text-white">Pessoal</span>
            {!currentWorkspace && <Check size={16} className="text-primary" />}
          </button>
          {workspaces.map(ws => (
            <button 
              key={ws.id}
              onClick={() => { switchWorkspace(ws.id); setIsOpen(false); }}
              className="w-full flex items-center justify-between p-3 hover:bg-white/5 text-left"
            >
              <span className="text-white truncate">{ws.name}</span>
              {currentWorkspace?.id === ws.id && <Check size={16} className="text-primary" />}
            </button>
          ))}
          
          <div className="border-t border-white/10 p-2">
            {isCreating ? (
                <form onSubmit={handleCreate} className="flex gap-2">
                    <input 
                        autoFocus
                        className="bg-black/50 border border-white/20 rounded px-2 text-sm text-white w-full"
                        value={newName} onChange={e => setNewName(e.target.value)} 
                        placeholder="Nome..."
                    />
                    <button type="submit" className="text-primary text-xs font-bold">OK</button>
                </form>
            ) : (
                <button onClick={() => setIsCreating(true)} className="w-full flex items-center justify-center gap-2 p-2 text-xs text-text-muted hover:text-white border border-dashed border-white/20 rounded">
                    <Plus size={12} /> Criar Novo
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
