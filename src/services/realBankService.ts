
export interface BankInstitution {
    id: string;
    name: string;
    logo: string;
}

export const RealBankService = {
    getInstitutions: async (country: string = 'PT'): Promise<BankInstitution[]> => {
        return [
            { id: 'santander', name: 'Santander', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-santander-282448.png' },
            { id: 'cgd', name: 'Caixa Geral de Depósitos', logo: '' },
            { id: 'millennium', name: 'Millennium BCP', logo: '' },
            { id: 'novobanco', name: 'Novo Banco', logo: '' },
            { id: 'bpi', name: 'BPI', logo: '' },
            { id: 'revolut', name: 'Revolut', logo: '' },
            { id: 'activobank', name: 'ActivoBank', logo: '' },
        ];
    },

    connect: async (institutionId: string, redirectUrl: string): Promise<{ link: string, requisitionId: string }> => {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retornar um link que volta para a própria app com um código fake
        return { 
            link: `${redirectUrl}?code=mock_auth_code_12345`, 
            requisitionId: 'req_mock_123' 
        };
    },

    finishConnection: async (code: string): Promise<{ accounts: any[], accessToken: string }> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            accessToken: 'mock_access_token_xyz',
            accounts: [
                { id: 'mock_acc_1', name: 'Conta à Ordem', type: 'Conta à Ordem', balance: 1250.00, currency: 'EUR', financialInstitutionId: 'Mock Bank' },
                { id: 'mock_acc_2', name: 'Cartão Crédito', type: 'Cartão de Crédito', balance: -450.00, currency: 'EUR', financialInstitutionId: 'Mock Bank' }
            ]
        };
    },

    syncAccount: async (accessToken: string, history: any[]) => {
        return { balance: 1250.00, transactions: [] };
    }
};
