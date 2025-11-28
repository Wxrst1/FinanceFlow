
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { ApiService } from '@/services/api';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: typeof ApiService.auth.signIn;
  logout: typeof ApiService.auth.signOut;
  register: typeof ApiService.auth.signUp;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // If Supabase isn't configured, we can't really check session
        if (!isSupabaseConfigured || !supabase) {
          console.log('Running in offline/demo mode (No Auth)');
          setUser(null);
          return;
        }

        const currentUser = await ApiService.auth.getCurrentUser();
        setUser(currentUser);

        // Listen to Supabase Auth events only if configured
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const updatedUser = await ApiService.auth.getCurrentUser();
            setUser(updatedUser);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
          setIsLoading(false);
        });

        return () => {
          authListener.subscription.unsubscribe();
        };

      } catch (error) {
        console.error('Auth initialization error', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login: ApiService.auth.signIn,
      logout: ApiService.auth.signOut,
      register: ApiService.auth.signUp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
