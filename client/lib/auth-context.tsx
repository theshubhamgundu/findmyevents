import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getCurrentProfile, isSupabaseConfigured } from "./supabase";
import { getDemoUserByCredentials, getDemoProfile, saveDemoSession, loadDemoSession, clearDemoSession } from "./demo-data";
import type { Profile } from "@shared/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    profileData: Partial<Profile>,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, check for demo session
    if (!isSupabaseConfigured) {
      // Restore demo session if exists
      const demoSession = loadDemoSession();
      if (demoSession) {
        setUser(demoSession.user);
        setProfile(demoSession.profile);
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.warn("Failed to get initial session:", error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await getCurrentProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check for demo user credentials
    const demoUserId = getDemoUserByCredentials(email, password);
    if (demoUserId) {
      const sessionData = saveDemoSession(demoUserId);
      if (sessionData) {
        setUser(sessionData.user as User);
        setProfile(sessionData.profile);
        setLoading(false);
        return;
      }
    }

    if (!isSupabaseConfigured) {
      throw new Error(
        "Authentication is not available. Please configure Supabase connection.",
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: Partial<Profile>,
  ) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Authentication is not available. Please configure Supabase connection.",
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Wait a bit for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the current session to ensure we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        // Session is available, create the profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: profileData.full_name!,
          role: profileData.role || "student",
          notification_preferences: {
            email: true,
            whatsapp: false,
            telegram: false,
          },
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }
      } else {
        // No session available yet - email confirmation might be required
        console.log(
          "Email confirmation may be required. Profile will be created after confirmation.",
        );
      }
    }
  };

  const signOut = async () => {
    // Stop any active QR scanners and release camera before logout
    try {
      // Find any active QR scanner and stop it
      const qrReaderElement = document.getElementById("qr-reader");
      if (qrReaderElement) {
        // Dispatch a custom event to notify QR scanner components to cleanup
        const cleanupEvent = new CustomEvent("authLogout");
        window.dispatchEvent(cleanupEvent);
      }

      // Stop any media streams that might be active
      if (window.currentMediaStream) {
        window.currentMediaStream.getTracks().forEach((track) => track.stop());
        window.currentMediaStream = undefined;
        console.log("Global media stream cleaned up during logout");
      }
    } catch (error) {
      console.warn("Error during camera cleanup:", error);
    }

    // Clear demo session
    clearDemoSession();

    // Clear user state for demo users (non-Supabase)
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("No user logged in");

    // Handle demo users
    if (!isSupabaseConfigured) {
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updatedProfile);

      // Update demo session
      const currentSession = loadDemoSession();
      if (currentSession) {
        currentSession.profile = updatedProfile;
        localStorage.setItem('demo_user_session', JSON.stringify(currentSession));
      }
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;

    // Reload profile
    await loadProfile(user.id);
  };

  const value = {
    user,
    profile,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
