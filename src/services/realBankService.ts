
export interface BankInstitution {
    id: string;
    name: string;
    logo: string;
}

export const RealBankService = {
    getInstitutions: async (country: string = 'PT'): Promise<BankInstitution[]> => {
        // Mock List
        return [
            { id: 'santander', name: 'Santander Totta', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-santander-282448.png' },
            { id: 'cgd', name: 'Caixa Geral de Depósitos', logo: '' },
            { id: 'millennium', name: 'Millennium BCP', logo: '' },
            { id: 'novobanco', name: 'Novo Banco', logo: '' },
            { id: 'bpi', name: 'Banco BPI', logo: '' },
            { id: 'revolut', name: 'Revolut', logo: '' },
            { id: 'activobank', name: 'ActivoBank', logo: '' },
            { id: 'moey', name: 'Moey!', logo: '' },
        ];
    },

    connect: async (institutionId: string, redirectUrl: string): Promise<{ link: string, requisitionId: string }> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return a mock redirect that loops back to the app with a fake code
        return { 
            link: `${redirectUrl}?code=mock_auth_code_${Math.random().toString(36).substring(7)}`, 
            requisitionId: 'req_mock_12345' 
        };
    },

    finishConnection: async (code: string): Promise<{ accounts: any[], accessToken: string }> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return mock accounts
        return {
            accessToken: 'mock_access_token_xyz',
            accounts: [
                { 
                    id: 'mock_acc_1', 
                    name: 'Conta à Ordem', 
                    type: 'Conta à Ordem', 
                    balance: 1250.45, 
                    currency: 'EUR', 
                    financialInstitutionId: 'Mock Bank' 
                },
                { 
                    id: 'mock_acc_2', 
                    name: 'Poupança Objetivo', 
                    type: 'Poupança', 
                    balance: 5000.00, 
                    currency: 'EUR', 
                    financialInstitutionId: 'Mock Bank' 
                }
            ]
        };
    },

    syncAccount: async (accessToken: string, history: any[]) => {
        return { balance: 1250.45, transactions: [] };
    }
};
