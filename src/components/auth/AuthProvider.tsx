/// <reference types="vite/client" />
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, isAdmin: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthStateChange = async (supabaseUser: any) => {
    if (supabaseUser) {
      const appUser: AppUser = {
        uid: supabaseUser.id,
        email: supabaseUser.email || '',
        displayName: supabaseUser.user_metadata?.displayName || supabaseUser.email?.split('@')[0] || 'User',
        photoURL: supabaseUser.user_metadata?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
      };
      
      setUser(appUser);

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('uid', appUser.uid)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile(data as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: appUser.uid,
            email: appUser.email,
            displayName: appUser.displayName,
            photoURL: appUser.photoURL,
            role: 'reporter',
            createdAt: new Date().toISOString(),
          };
          
          const { error: upsertError } = await supabase
            .from('users')
            .upsert(newProfile);

          if (upsertError) throw upsertError;

          setProfile(newProfile);
        }
      } catch (error) {
        console.error("Error setting Supabase user profile:", error);
      }
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch of current session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthStateChange(session?.user || null);
      } catch (error) {
        console.error("Error checking Supabase session:", error);
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleAuthStateChange(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
