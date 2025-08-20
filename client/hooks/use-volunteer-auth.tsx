import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface VolunteerSession {
  id: string;
  username: string;
  event_id: string;
  event: any;
  logged_in_at: string;
}

interface VolunteerAuthContextType {
  volunteerSession: VolunteerSession | null;
  isVolunteerLoggedIn: boolean;
  loginVolunteer: (session: VolunteerSession) => void;
  logoutVolunteer: () => void;
  checkVolunteerAccess: (eventId?: string) => boolean;
}

const VolunteerAuthContext = createContext<VolunteerAuthContextType | undefined>(undefined);

export function VolunteerAuthProvider({ children }: { children: React.ReactNode }) {
  const [volunteerSession, setVolunteerSession] = useState<VolunteerSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing volunteer session on mount
    const sessionData = localStorage.getItem("volunteer_session");
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Validate session (check if it's not too old)
        const loginTime = new Date(session.logged_in_at);
        const now = new Date();
        const sessionDuration = now.getTime() - loginTime.getTime();
        const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionDuration < maxSessionDuration) {
          setVolunteerSession(session);
        } else {
          // Session expired
          localStorage.removeItem("volunteer_session");
        }
      } catch (error) {
        console.error("Error parsing volunteer session:", error);
        localStorage.removeItem("volunteer_session");
      }
    }
  }, []);

  const loginVolunteer = (session: VolunteerSession) => {
    localStorage.setItem("volunteer_session", JSON.stringify(session));
    setVolunteerSession(session);
  };

  const logoutVolunteer = () => {
    localStorage.removeItem("volunteer_session");
    setVolunteerSession(null);
    navigate("/volunteer/login");
  };

  const checkVolunteerAccess = (eventId?: string): boolean => {
    if (!volunteerSession) return false;
    
    // If specific event access is required, check if volunteer has access to that event
    if (eventId && volunteerSession.event_id !== eventId) {
      return false;
    }
    
    return true;
  };

  const value = {
    volunteerSession,
    isVolunteerLoggedIn: !!volunteerSession,
    loginVolunteer,
    logoutVolunteer,
    checkVolunteerAccess,
  };

  return (
    <VolunteerAuthContext.Provider value={value}>
      {children}
    </VolunteerAuthContext.Provider>
  );
}

export function useVolunteerAuth() {
  const context = useContext(VolunteerAuthContext);
  if (context === undefined) {
    throw new Error("useVolunteerAuth must be used within a VolunteerAuthProvider");
  }
  return context;
}

// Hook for protecting volunteer routes
export function useVolunteerProtectedRoute(eventId?: string) {
  const { volunteerSession, checkVolunteerAccess } = useVolunteerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!volunteerSession) {
      navigate("/volunteer/login");
      return;
    }

    if (!checkVolunteerAccess(eventId)) {
      navigate("/volunteer/login");
      return;
    }
  }, [volunteerSession, eventId, navigate, checkVolunteerAccess]);

  return {
    isAuthorized: checkVolunteerAccess(eventId),
    volunteerSession,
  };
}
