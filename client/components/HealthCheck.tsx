import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface HealthStatus {
  supabase: 'connected' | 'error' | 'unconfigured';
  database: 'connected' | 'error' | 'untested';
  auth: 'available' | 'error' | 'untested';
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    supabase: 'unconfigured',
    database: 'untested',
    auth: 'untested'
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    if (!isSupabaseConfigured) {
      setStatus({
        supabase: 'unconfigured',
        database: 'untested',
        auth: 'untested'
      });
      setIsVisible(true);
      return;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Test Supabase connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('Database health check failed:', error);
        setStatus({
          supabase: 'connected',
          database: 'error',
          auth: 'untested'
        });
        setIsVisible(true);
        return;
      }

      // Test auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      setStatus({
        supabase: 'connected',
        database: 'connected',
        auth: authError ? 'error' : 'available'
      });

      // Only show if there are issues
      const hasIssues = Object.values(status).some(s => s === 'error' || s === 'unconfigured');
      setIsVisible(hasIssues);

    } catch (error) {
      console.error('Health check failed:', error);
      setStatus({
        supabase: 'error',
        database: 'error',
        auth: 'error'
      });
      setIsVisible(true);
    }
  };

  if (!isVisible) return null;

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'connected':
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusText = (key: string, statusValue: string) => {
    const labels = {
      supabase: 'Supabase Connection',
      database: 'Database Access',
      auth: 'Authentication'
    };

    const statusTexts = {
      connected: 'Connected',
      available: 'Available', 
      error: 'Error',
      unconfigured: 'Not Configured',
      untested: 'Not Tested'
    };

    return `${labels[key as keyof typeof labels]}: ${statusTexts[statusValue as keyof typeof statusTexts]}`;
  };

  const hasErrors = Object.values(status).some(s => s === 'error');
  const isUnconfigured = status.supabase === 'unconfigured';

  return (
    <Alert className={`mb-4 ${hasErrors ? 'border-red-200 bg-red-50' : isUnconfigured ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="font-semibold">
            {isUnconfigured ? 'Configuration Required' : hasErrors ? 'Service Issues Detected' : 'System Status'}
          </div>
          <div className="space-y-1 text-sm">
            {Object.entries(status).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {getStatusIcon(value)}
                <span>{getStatusText(key, value)}</span>
              </div>
            ))}
          </div>
          {isUnconfigured && (
            <div className="text-sm mt-2 text-blue-600">
              <strong>Next Steps:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                <li>Copy your project URL and anon key</li>
                <li>Update environment variables in your hosting platform</li>
                <li>Run the database migration from <code>supabase/migrations/001_create_tables.sql</code></li>
              </ol>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
