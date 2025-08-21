import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Loader2 } from 'lucide-react';

interface OrganizerRouteGuardProps {
  children: React.ReactNode;
}

export default function OrganizerRouteGuard({ children }: OrganizerRouteGuardProps) {
  const { user, profile, loading, isConfigured } = useAuth();

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
  if (profile?.role !== 'organizer' && profile?.role !== 'admin') {
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
