import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, Loader2 } from "lucide-react";

interface OrganizerRouteGuardProps {
  children: React.ReactNode;
}

export default function OrganizerRouteGuard({
  children,
}: OrganizerRouteGuardProps) {
  let user, profile, loading, isConfigured;

  try {
    const authContext = useAuth();
    user = authContext.user;
    profile = authContext.profile;
    loading = authContext.loading;
    isConfigured = authContext.isConfigured;
  } catch (error) {
    console.error("Error accessing auth context:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <Alert variant="destructive">
            <Building className="h-4 w-4" />
            <AlertDescription>
              Authentication error. Please refresh the page and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Verifying organizer access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has organizer role (or admin role for access)
  // Also allow demo organizer user
  const isDemoOrganizer = user?.id === "00000000-0000-4000-8000-000000000002";

  if (
    profile?.role !== "organizer" &&
    profile?.role !== "admin" &&
    !isDemoOrganizer
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <Alert variant="destructive">
            <Building className="h-4 w-4" />
            <AlertDescription>
              Access denied. Organizer privileges required to access this page.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content for organizer users
  return <>{children}</>;
}
