
// This service is deprecated and has been replaced by internal Virtual Accounts.
// Keeping a stub to prevent immediate build errors if imported elsewhere, 
// but functionality is disabled.

export interface BankInstitution {
    id: string;
    name: string;
    logo: string;
}

export const RealBankService = {
    getInstitutions: async (country: string = 'PT'): Promise<BankInstitution[]> => {
        return [];
    },

    connect: async (institutionId: string, redirectUrl: string): Promise<{ link: string, requisitionId: string }> => {
        throw new Error("Banking integration is disabled.");
    },

    finishConnection: async (code: string): Promise<{ accounts: any[], accessToken: string }> => {
        throw new Error("Banking integration is disabled.");
    },

    syncAccount: async (accessToken: string, history: any[]): Promise<{ balance: number, transactions: any[], accountId?: string }> => {
        return { balance: 0, transactions: [] };
    }
};
