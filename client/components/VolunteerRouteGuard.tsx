import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVolunteerAuth } from "@/hooks/use-volunteer-auth";
import { Loader2, Shield } from "lucide-react";

interface VolunteerRouteGuardProps {
  children: React.ReactNode;
  eventId?: string;
  redirectTo?: string;
}

export default function VolunteerRouteGuard({ 
  children, 
  eventId, 
  redirectTo = "/volunteer/login" 
}: VolunteerRouteGuardProps) {
  const { volunteerSession, checkVolunteerAccess } = useVolunteerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!volunteerSession) {
      navigate(redirectTo);
      return;
    }

    if (!checkVolunteerAccess(eventId)) {
      navigate(redirectTo);
      return;
    }
  }, [volunteerSession, eventId, navigate, checkVolunteerAccess, redirectTo]);

  // Show loading while checking authorization
  if (!volunteerSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <Loader2 className="w-6 h-6 text-gray-400 mx-auto animate-spin mb-2" />
          <p className="text-gray-600">Checking volunteer authorization...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized if access check fails
  if (!checkVolunteerAccess(eventId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this event.
          </p>
          <button
            onClick={() => navigate(redirectTo)}
            className="text-blue-600 hover:underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
