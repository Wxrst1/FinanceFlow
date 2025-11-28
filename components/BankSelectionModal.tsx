
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { BankInstitution, RealBankService } from '../services/realBankService';
import { Search, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface BankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bank: BankInstitution) => void;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { addNotification } = useNotification();
  const [search, setSearch] = useState('');
  const [banks, setBanks] = useState<BankInstitution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      if (isOpen) {
          loadBanks();
      }
  }, [isOpen]);

  const loadBanks = async () => {
      setIsLoading(true);
      try {
          const data = await RealBankService.getInstitutions('PT'); // Default to Portugal
          setBanks(data);
      } catch (error) {
          console.error(error);
          addNotification('Erro ao carregar lista de bancos. Verifique a sua conexão.', 'error');
      } finally {
          setIsLoading(false);
      }
  };

  const filteredBanks = banks.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conectar Instituição (Tink)">
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 items-start">
            <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">Conexão Segura e Regulada</p>
                <p className="opacity-80">Utilizamos a Tink (Regulada PSD2). Você será redirecionado para o site do seu banco para autorizar. Nós nunca vemos as suas senhas.</p>
            </div>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
                type="text" 
                placeholder="Pesquisar banco (ex: Santander, CGD)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
            />
        </div>

        <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[200px]">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-text-muted">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <p>A carregar bancos...</p>
                </div>
            ) : filteredBanks.length > 0 ? (
                filteredBanks.map(bank => (
                    <button
                        key={bank.id}
                        onClick={() => onSelect(bank)}
                        className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:bg-white/5 hover:border-primary/30 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            {bank.logo ? (
                                <img src={bank.logo} alt={bank.name} className="w-10 h-10 rounded object-contain bg-white p-1" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold bg-zinc-700">
                                    {bank.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="font-medium text-white text-left">{bank.name}</span>
                        </div>
                        <ChevronRight className="text-text-muted group-hover:text-white transition-colors" size={20} />
                    </button>
                ))
            ) : (
                <div className="text-center py-8 text-text-muted">
                    Nenhum banco encontrado.
                </div>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default BankSelectionModal;
