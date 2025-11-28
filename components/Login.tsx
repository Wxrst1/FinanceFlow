
import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { Wallet, Lock, Mail, ArrowRight, ArrowLeft, User as UserIcon, Loader2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { SubscriptionPlan } from '../types';
import { ApiService } from '../services/api';

interface LoginProps {
  onBack?: () => void;
  selectedPlan?: SubscriptionPlan;
  onPaymentRequired?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack, selectedPlan = 'starter', onPaymentRequired }) => {
  const { login, register } = useFinance();
  const { addNotification } = useNotification();
  const isMounted = useRef(true);
  
  const [isRegistering, setIsRegistering] = useState(!!selectedPlan && selectedPlan !== 'starter');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
      return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
      if (selectedPlan && selectedPlan !== 'starter') {
          setIsRegistering(true);
      }
  }, [selectedPlan]);

  const handleGoogleLogin = async () => {
      try {
          await ApiService.auth.signInWithOAuth('google');
      } catch (e: any) {
          addNotification('Erro ao conectar com Google: ' + e.message, 'error');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    
    // Safety timeout to force stop loading state if API hangs
    const safetyTimeout = setTimeout(() => {
        if (isMounted.current) {
            setIsLoading(false);
            addNotification('A conexão está demorada. Verifique a internet.', 'info');
        }
    }, 15000);

    try {
        if (isRegistering) {
            if (!name) {
                addNotification('Por favor insira o seu nome.', 'error');
                setIsLoading(false);
                clearTimeout(safetyTimeout);
                return;
            }
            
            // Sign Up
            const result = await register(email, password, name, selectedPlan);
            clearTimeout(safetyTimeout);
            
            if (!isMounted.current) return;

            // Check if session was created. If not, email confirmation is likely required.
            if (result && !result.session && result.user) {
                addNotification('Conta criada! Verifique o seu email (caixa de entrada ou SPAM) para confirmar.', 'info');
                // Switch to login mode so they can login after clicking the email link
                setIsRegistering(false); 
            } else if (result.user) {
                addNotification('Conta criada com sucesso!', 'success');
                if ((selectedPlan === 'pro' || selectedPlan === 'business') && onPaymentRequired) {
                    onPaymentRequired();
                }
                // Login successful - App.tsx will re-render
            }
        } else {
            // Login
            await login(email, password);
            clearTimeout(safetyTimeout);
            if (isMounted.current) {
                addNotification('Bem-vindo de volta!', 'success');
            }
        }
    } catch (error: any) {
        clearTimeout(safetyTimeout);
        if (!isMounted.current) return;
        
        console.error("Auth Error:", error);
        
        let msg = 'Ocorreu um erro. Tente novamente.';
        const errorMessage = (error.message || '').toLowerCase();
        
        if (errorMessage.includes('invalid login') || errorMessage.includes('invalid credentials')) {
            msg = 'Email ou password incorretos.';
        } else if (errorMessage.includes('user already registered')) {
            msg = 'Este email já está registado. Tente fazer login.';
            setIsRegistering(false); // Auto switch to login
        } else if (errorMessage.includes('password should be')) {
            msg = 'A password deve ter pelo menos 6 caracteres.';
        } else if (errorMessage.includes('email not confirmed')) {
            msg = 'Email não confirmado. Verifique a sua caixa de correio.';
        } else if (errorMessage.includes('rate limit')) {
            msg = 'Muitas tentativas. Aguarde um minuto.';
        } else if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
            msg = 'Erro de conexão. Verifique a sua internet.';
        }
        
        addNotification(msg, 'error');
    } finally {
        if (isMounted.current) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute -top-12 left-0 flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Voltar ao início
          </button>
        )}

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 text-primary">
              <Wallet size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white">
                {isRegistering ? 'Criar Conta' : 'Bem-vindo'}
            </h1>
            <p className="text-text-muted mt-2 text-center">
                {isRegistering ? 'Comece a organizar a sua vida financeira.' : 'Gerencie as suas finanças com inteligência.'}
            </p>
            {isRegistering && selectedPlan !== 'starter' && (
                <div className="mt-4 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase border border-primary/20">
                    Plano {selectedPlan} selecionado
                </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mb-4"
            >
                <Globe size={18} />
                Entrar com Google
            </button>

            <div className="flex items-center gap-4 text-xs text-text-muted uppercase tracking-wider">
                <div className="h-px bg-border flex-1"></div>
                OU
                <div className="h-px bg-border flex-1"></div>
            </div>

            {isRegistering && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">Nome Completo</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input 
                        type="text" 
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        placeholder="João Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isRegistering}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isRegistering ? 'Continuar' : 'Entrar'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            <p>
                {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
                <button 
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        // Reset fields on toggle
                        setEmail('');
                        setPassword('');
                        setName('');
                    }}
                    className="ml-2 text-primary hover:underline font-medium"
                >
                    {isRegistering ? 'Faça Login' : 'Criar Conta Grátis'}
                </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
