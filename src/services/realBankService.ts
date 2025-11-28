
export interface BankInstitution { id: string; name: string; logo: string; }
export const RealBankService = {
    getInstitutions: async (country: string = 'PT'): Promise<BankInstitution[]> => [],
    connect: async (institutionId: string, redirectUrl: string) => { throw new Error("Disabled"); },
    finishConnection: async (code: string) => { throw new Error("Disabled"); },
    syncAccount: async (accessToken: string, history: any[]) => ({ balance: 0, transactions: [] })
};
