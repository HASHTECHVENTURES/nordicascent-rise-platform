import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Candidate, Profile, UserRole } from "@/types/database";
import {
  HARDCODED_ADMIN_EMAIL,
  HARDCODED_ADMIN_PASSWORD,
  isHardcodedAdminCredentials,
} from "@/lib/adminCredentials";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  candidate: Candidate | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata: { role: UserRole; full_name: string; company_name?: string }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileData?.account_status === "suspended") {
      await supabase.auth.signOut();
      setProfile(null);
      setCandidate(null);
      return;
    }

    setProfile(profileData);

    if (profileData?.role === "candidate") {
      const { data: candidateData } = await supabase
        .from("candidates")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();
      setCandidate(candidateData);
    } else {
      setCandidate(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await loadProfile(session.user.id);
    }
  }, [session?.user?.id, loadProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id);
      } else {
        setProfile(null);
        setCandidate(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signInAsAdmin = useCallback(async (email: string, password: string) => {
    if (!isHardcodedAdminCredentials(email, password)) {
      throw new Error("Invalid admin email or password.");
    }

    const credentials = {
      email: HARDCODED_ADMIN_EMAIL,
      password: HARDCODED_ADMIN_PASSWORD,
    };

    const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
    if (!signInError) return;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      ...credentials,
      options: {
        data: {
          role: "admin",
          full_name: "Nordic Ascent Admin",
        },
      },
    });

    if (signUpData.session) return;

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        throw new Error(
          "Admin account exists but the password does not match. In Supabase → Authentication → Users, reset the password for admin@nordicascent.com to NordicAdmin2026!"
        );
      }
      throw signUpError;
    }

    const { error: retryError } = await supabase.auth.signInWithPassword(credentials);
    if (retryError) {
      throw new Error(
        "Admin account may need email confirmation. In Supabase → Authentication → Providers, turn off “Confirm email” for local dev, then try again."
      );
    }
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { role: UserRole; full_name: string; company_name?: string }
    ): Promise<void> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: metadata.role,
            full_name: metadata.full_name,
            company_name: metadata.company_name,
          },
        },
      });
      if (error) throw error;

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      candidate,
      loading,
      signIn,
      signInAsAdmin,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, candidate, loading, signIn, signInAsAdmin, signUp, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
