import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, X } from 'lucide-react';
import { useState } from 'react';

interface ConfigBannerProps {
  isSupabaseConfigured: boolean;
}

export default function ConfigBanner({ isSupabaseConfigured }: ConfigBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (isSupabaseConfigured || dismissed) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>
            <strong>Demo Mode:</strong> Configure Supabase to enable authentication and real data. 
            Current features are using mock data for demonstration.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
