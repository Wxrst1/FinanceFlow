
import { Transaction } from "../types";
export const BankService = {
  parseCSV: async (file: File, history: Transaction[] = []): Promise<Partial<Transaction>[]> => [],
  parseOFX: async (file: File, history: Transaction[] = []): Promise<Partial<Transaction>[]> => [],
  parsePDF: async (file: File, history: Transaction[] = []): Promise<Partial<Transaction>[]> => []
};
