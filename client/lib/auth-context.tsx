import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getCurrentProfile, isSupabaseConfigured } from "./supabase";
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
      const savedSession = localStorage.getItem('demo_user_session');
      if (savedSession) {
        try {
          const { user, profile } = JSON.parse(savedSession);
          setUser(user);
          setProfile(profile);
        } catch (error) {
          console.warn('Failed to restore demo session:', error);
          localStorage.removeItem('demo_user_session');
        }
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
    // Demo admin login bypass - simulates database-stored admin user
    if (email === "shubsss" && password === "shubsss@1911") {
      const demoUserId = "00000000-0000-4000-8000-000000000001";
      const demoUser = {
        id: demoUserId,
        email: "admin@findmyevent.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: "authenticated",
        role: "authenticated",
        // Simulate database metadata
        user_metadata: {
          provider: "demo",
          verified: true,
          last_sign_in: new Date().toISOString()
        }
      } as User;

      const demoProfile: Profile = {
        id: demoUserId,
        email: "admin@findmyevent.com",
        full_name: "System Administrator",
        role: "admin",
        phone: "+91-9876543210",
        city: "Mumbai",
        college: "FindMyEvent HQ",
        year_of_study: null,
        interests: ["platform_management", "user_analytics"],
        notification_preferences: {
          email: true,
          whatsapp: true,
          telegram: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        verification_status: "verified",
        profile_completion: 100
      };

      // Simulate database session storage
      localStorage.setItem('demo_user_session', JSON.stringify({ user: demoUser, profile: demoProfile }));

      setUser(demoUser);
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    // Demo organizer login bypass - simulates database-stored organizer user
    if (email === "organizer" && password === "organizer123") {
      const demoUserId = "00000000-0000-4000-8000-000000000002";
      const demoUser = {
        id: demoUserId,
        email: "organizer@findmyevent.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: "authenticated",
        role: "authenticated",
        user_metadata: {
          provider: "demo",
          verified: true,
          last_sign_in: new Date().toISOString()
        }
      } as User;

      const demoProfile: Profile = {
        id: demoUserId,
        email: "organizer@findmyevent.com",
        full_name: "Tech Events Organizer",
        role: "organizer",
        phone: "+91-9123456789",
        city: "Bangalore",
        college: "IIT Bangalore",
        year_of_study: null,
        interests: ["event_management", "hackathons", "workshops"],
        notification_preferences: {
          email: true,
          whatsapp: true,
          telegram: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        verification_status: "verified",
        profile_completion: 95
      };

      // Simulate database session storage
      localStorage.setItem('demo_user_session', JSON.stringify({ user: demoUser, profile: demoProfile }));

      setUser(demoUser);
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    // Demo student login bypass - simulates database-stored student user
    if (email === "student" && password === "student123") {
      const demoUserId = "00000000-0000-4000-8000-000000000003";
      const demoUser = {
        id: demoUserId,
        email: "student@findmyevent.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: "authenticated",
        role: "authenticated",
        user_metadata: {
          provider: "demo",
          verified: true,
          last_sign_in: new Date().toISOString()
        }
      } as User;

      const demoProfile: Profile = {
        id: demoUserId,
        email: "student@findmyevent.com",
        full_name: "CS Student",
        role: "student",
        phone: "+91-9987654321",
        city: "Delhi",
        college: "Delhi Technological University",
        year_of_study: "3rd Year",
        interests: ["hackathons", "ai_ml", "web_development", "coding_competitions"],
        notification_preferences: {
          email: true,
          whatsapp: true,
          telegram: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        verification_status: "verified",
        profile_completion: 85
      };

      // Simulate database session storage
      localStorage.setItem('demo_user_session', JSON.stringify({ user: demoUser, profile: demoProfile }));

      setUser(demoUser);
      setProfile(demoProfile);
      setLoading(false);
      return;
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

    // Clear demo session storage
    localStorage.removeItem('demo_user_session');

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

      // Update localStorage session
      const currentSession = localStorage.getItem('demo_user_session');
      if (currentSession) {
        const session = JSON.parse(currentSession);
        session.profile = updatedProfile;
        localStorage.setItem('demo_user_session', JSON.stringify(session));
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
