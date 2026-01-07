import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateAllPasswords: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name,
          role: session.user.user_metadata.role,
        });
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name,
          role: session.user.user_metadata.role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Function to update all users' passwords to '1234567890'
  const updateAllPasswords = async () => {
    try {
      // Fetch the list of users (you may need permissions for this, depending on Supabase's rules)
      const { data: users, error } = await supabase
        .from('users') // Replace 'users' with your user table
        .select('id, email');

      if (error) throw error;

      // Iterate through each user and update the password
      for (const user of users) {
        const { error: updateError } = await supabase.auth.updateUser({
          id: user.id,
          password: '1234567890', // Set the new password
        });

        if (updateError) {
          console.error(`Failed to update password for user ${user.email}`, updateError.message);
        } else {
          console.log(`Password updated for user ${user.email}`);
        }
      }
    } catch (err) {
      console.error('Error updating passwords:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateAllPasswords }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
