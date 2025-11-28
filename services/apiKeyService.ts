
import { ApiKey } from "../types";
import { generateId } from "../utils";
import { isSupabaseConfigured, supabase } from "./supabase";

const KEYS_STORAGE = 'financeflow_api_keys';

export const ApiKeyService = {
    getKeys: async (workspaceId: string): Promise<ApiKey[]> => {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase!
                .from('api_keys')
                .select('*')
                .eq('workspace_id', workspaceId);
            
            if (error) {
                console.error('Error fetching API keys:', error);
                return [];
            }
            // Map DB format to internal type if needed
            return data.map((k: any) => ({
                id: k.id,
                workspaceId: k.workspace_id,
                name: k.name,
                key: k.key,
                createdAt: k.created_at,
                lastUsedAt: k.last_used_at
            }));
        } else {
            // Local Mock
            const allKeys = JSON.parse(localStorage.getItem(KEYS_STORAGE) || '[]');
            return allKeys.filter((k: ApiKey) => k.workspaceId === workspaceId);
        }
    },

    generateKey: async (workspaceId: string, name: string): Promise<ApiKey> => {
        // Generate a random key (e.g., sk_ff_...)
        const randomPart = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const keyString = `sk_ff_${randomPart}`;
        
        const newKey: ApiKey = {
            id: generateId(),
            workspaceId,
            name,
            key: keyString,
            createdAt: new Date().toISOString()
        };

        if (isSupabaseConfigured) {
            const { data: { user } } = await supabase!.auth.getUser();
            if (user) {
                await supabase!.from('api_keys').insert({
                    id: newKey.id,
                    workspace_id: workspaceId,
                    name: name,
                    key: keyString,
                    user_id: user.id
                });
            }
        } else {
            // Local Mock
            const allKeys = JSON.parse(localStorage.getItem(KEYS_STORAGE) || '[]');
            allKeys.push(newKey);
            localStorage.setItem(KEYS_STORAGE, JSON.stringify(allKeys));
        }

        return newKey;
    },

    revokeKey: async (id: string): Promise<void> => {
        if (isSupabaseConfigured) {
            await supabase!.from('api_keys').delete().eq('id', id);
        } else {
            const allKeys = JSON.parse(localStorage.getItem(KEYS_STORAGE) || '[]');
            const filtered = allKeys.filter((k: ApiKey) => k.id !== id);
            localStorage.setItem(KEYS_STORAGE, JSON.stringify(filtered));
        }
    }
};
