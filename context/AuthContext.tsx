import { getCurrentUser, getSession, supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        // Get session
        const { session, error: sessionError } = await getSession();
        if (!mounted) return;
        
        if (sessionError) {
          setState((prev) => ({ ...prev, error: sessionError.message, isLoading: false }));
          return;
        }

        // No session, user is not logged in
        if (!session) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Get user
        const { user, error: userError } = await getCurrentUser();
        if (!mounted) return;
        
        if (userError) {
          setState((prev) => ({ ...prev, error: userError.message, isLoading: false }));
          return;
        }

        setState({ user, session, isLoading: false, error: null });
      } catch (error) {
        if (!mounted) return;
        
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error occurred",
          isLoading: false,
        }));
      }
    }

    loadUser();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session) {
        const { user } = await getCurrentUser();
        setState({ user: user ?? null, session, isLoading: false, error: null });
      } else {
        setState({ user: null, session: null, isLoading: false, error: null });
      }
    });

    // Clean up subscription
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
