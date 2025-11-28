
import React, { useEffect, useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { RealBankService } from '../services/realBankService';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { BankAccount } from '../types';
import { generateId } from '../utils';

const BankCallback = () => {
  const { addAccount, refreshBankData } = useFinance();
  const { addNotification } = useNotification();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('A finalizar conexão com o banco...');

  useEffect(() => {
    const handleCallback = async () => {
        // Extract code from URL query params (Tink returns 'code')
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
            // Check if there's an error in params
            const error = urlParams.get('error');
            const errorDesc = urlParams.get('error_description');
            setStatus('error');
            setMessage(errorDesc || error || 'Código de autorização não encontrado.');
            return;
        }

        try {
            // 1. Exchange Code for Token and Get Accounts
            const result = await RealBankService.finishConnection(code);
            
            if (!result.accounts || result.accounts.length === 0) {
                throw new Error('Nenhuma conta encontrada.');
            }

            // 2. Create Local Accounts
            for (const bankAcc of result.accounts) {
                const newAccount: BankAccount = {
                    id: generateId(),
                    name: bankAcc.name || bankAcc.financialInstitutionId || 'Banco',
                    type: bankAcc.type || 'Conta à Ordem',
                    initialBalance: 0,
                    color: '#3b82f6',
                    enabled: true,
                    
                    bankName: bankAcc.financialInstitutionId || 'Banco',
                    accountType: bankAcc.type || 'Conta à Ordem',
                    balance: 0, // Will be updated by refreshBankData
                    lastSync: new Date().toISOString(),
                    icon: 'Building2',
                    connected: true,
                    providerAccountId: bankAcc.id,
                    accessToken: result.accessToken // Store token
                };

                // 3. Save to Supabase
                await addAccount(newAccount);
                
                // 4. Initial Sync (Transaction fetch)
                await refreshBankData(newAccount);
            }

            setStatus('success');
            setMessage('Conexão estabelecida! A redirecionar para o Dashboard...');
            
            setTimeout(() => {
                window.location.href = '/'; // Navigate home
            }, 3000);

        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setMessage('Falha na conexão: ' + e.message);
        }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center">
            {status === 'loading' && (
                <>
                    <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">A Conectar...</h2>
                    <p className="text-text-muted">{message}</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Sucesso!</h2>
                    <p className="text-text-muted">{message}</p>
                </>
            )}
            {status === 'error' && (
                <>
                    <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Erro</h2>
                    <p className="text-text-muted mb-6">{message}</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                    >
                        Voltar ao Dashboard
                    </button>
                </>
            )}
        </div>
    </div>
  );
};

export default BankCallback;
