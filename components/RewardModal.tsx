
import React from 'react';
import Modal from './Modal';
import { Trophy, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, onClaim }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center p-4">
        <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.5)] relative"
        >
            <Trophy size={48} className="text-white drop-shadow-md" />
            <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-yellow-200"
            >
                <Sparkles size={24} />
            </motion.div>
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">Recompensa Desbloqueada!</h2>
        <p className="text-zinc-300 mb-6">
            Parabéns! Você desbloqueou 3 conquistas e demonstrou consistência financeira.
        </p>

        <div className="bg-surface border border-primary/30 p-4 rounded-xl mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
            <div className="relative z-10 flex items-center gap-3 justify-center">
                <Crown className="text-yellow-500" size={24} />
                <div className="text-left">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">Oferta Especial</p>
                    <p className="font-bold text-white">7 Dias de FinanceFlow PRO</p>
                </div>
            </div>
        </div>

        <button 
            onClick={onClaim}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-green-600 hover:from-green-500 hover:to-primary text-white rounded-xl font-bold shadow-lg shadow-green-900/30 transition-all hover:scale-[1.02]"
        >
            Resgatar Agora
        </button>
      </div>
    </Modal>
  );
};

export default RewardModal;
