
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ShieldCheck, Lock, Smartphone, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BankDef {
  id: string;
  name: string;
  color: string;
  logo: string; // Initials or icon name
}

interface BankAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BankDef | null;
  onSuccess: () => void;
}

const BankAuthModal: React.FC<BankAuthModalProps> = ({ isOpen, onClose, bank, onSuccess }) => {
  const [step, setStep] = useState<'login' | '2fa' | 'consent' | 'connecting' | 'success'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('login');
      setUsername('');
      setPassword('');
      setOtp('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, bank]);

  if (!bank) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        setError('Por favor preencha as credenciais.');
        return;
    }
    setIsLoading(true);
    setError('');
    
    // Simulate network request
    setTimeout(() => {
        setIsLoading(false);
        setStep('2fa');
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
        setError('Código inválido.');
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setStep('consent');
    }, 1500);
  };

  const handleConsent = () => {
    setStep('connecting');
    setTimeout(() => {
        setStep('success');
        setTimeout(() => {
            onSuccess();
        }, 1500);
    }, 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col min-h-[400px]">
        {/* Bank Header */}
        <div 
            className="p-6 -mt-6 -mx-6 mb-6 flex items-center justify-center flex-col text-white relative overflow-hidden"
            style={{ backgroundColor: bank.color }}
        >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold mb-3" style={{ color: bank.color }}>
                {bank.logo}
            </div>
            <h2 className="relative z-10 text-xl font-bold">Conectar com {bank.name}</h2>
            <div className="absolute bottom-2 right-4 flex items-center gap-1 text-[10px] opacity-70">
                <Lock size={10} /> Ambiente Seguro
            </div>
        </div>

        <div className="flex-1 px-2 pb-2">
            <AnimatePresence mode="wait">
                {/* STEP 1: LOGIN */}
                {step === 'login' && (
                    <motion.form 
                        key="login"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleLogin}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-white font-semibold">Credenciais de Acesso</h3>
                            <p className="text-text-muted text-sm">Utilize os seus dados do Homebanking</p>
                        </div>

                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="Nome de Utilizador / Nº Contrato"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                            <input 
                                type="password" 
                                placeholder="Palavra-passe"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                        </button>
                        
                        <p className="text-center text-xs text-text-muted mt-4">
                            Não armazenamos as suas credenciais. A autenticação é feita diretamente com o {bank.name}.
                        </p>
                    </motion.form>
                )}

                {/* STEP 2: 2FA */}
                {step === '2fa' && (
                    <motion.form 
                        key="2fa"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-4 text-center"
                    >
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-4">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-white font-semibold text-lg">Verificação de Segurança</h3>
                        <p className="text-text-muted text-sm mb-6">
                            Enviámos um código SMS para o número terminado em <span className="text-white">*** 892</span>.
                        </p>

                        <div className="flex justify-center gap-2 mb-6">
                            <input 
                                type="text" 
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="000000"
                                className="w-40 bg-background border border-border rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                                autoFocus
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm flex items-center justify-center gap-1"><AlertCircle size={14}/> {error}</p>}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Código'}
                        </button>
                    </motion.form>
                )}

                {/* STEP 3: CONSENT */}
                {step === 'consent' && (
                    <motion.div 
                        key="consent"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <ShieldCheck size={48} className="text-green-500 mx-auto mb-4" />
                            <h3 className="text-white font-semibold text-lg">Permissões de Acesso</h3>
                            <p className="text-text-muted text-sm">
                                O FinanceFlow solicita acesso de <strong>leitura</strong> aos seguintes dados:
                            </p>
                        </div>

                        <ul className="space-y-3 bg-surface/50 p-4 rounded-lg border border-border mb-6">
                            <li className="flex items-center gap-3 text-sm text-zinc-300">
                                <CheckCircle2 size={16} className="text-green-500" /> Detalhes da Conta e IBAN
                            </li>
                            <li className="flex items-center gap-3 text-sm text-zinc-300">
                                <CheckCircle2 size={16} className="text-green-500" /> Saldo em Tempo Real
                            </li>
                            <li className="flex items-center gap-3 text-sm text-zinc-300">
                                <CheckCircle2 size={16} className="text-green-500" /> Histórico de Transações (24 meses)
                            </li>
                        </ul>

                        <button 
                            onClick={handleConsent}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            Autorizar Acesso
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full bg-transparent hover:bg-white/5 text-text-muted font-medium py-3 rounded-lg transition-all"
                        >
                            Cancelar
                        </button>
                    </motion.div>
                )}

                {/* STEP 4: CONNECTING */}
                {step === 'connecting' && (
                    <motion.div 
                        key="connecting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="relative w-20 h-20 mb-8">
                            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-primary">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">A estabelecer conexão segura...</h3>
                        <p className="text-text-muted text-sm animate-pulse">A encriptar chaves PSD2</p>
                    </motion.div>
                )}

                {/* STEP 5: SUCCESS */}
                {step === 'success' && (
                     <motion.div 
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                     >
                         <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                             <CheckCircle2 size={48} />
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-2">Conectado!</h3>
                         <p className="text-text-muted">A importar transações...</p>
                     </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

export default BankAuthModal;
