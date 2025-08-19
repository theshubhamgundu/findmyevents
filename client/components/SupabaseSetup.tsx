import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Key, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

interface SupabaseSetupProps {
  isConfigured: boolean;
  currentUrl?: string;
  currentKey?: string;
}

export default function SupabaseSetup({ isConfigured, currentUrl, currentKey }: SupabaseSetupProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>✅ Supabase is configured and ready!</strong>
          <div className="mt-2 text-sm">
            Connected to: <code className="bg-green-100 px-1 rounded">{currentUrl?.substring(0, 40)}...</code>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6 border-orange-200">
      <CardHeader className="bg-orange-50">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Database className="h-5 w-5" />
          Supabase Setup Required
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode Active:</strong> The app is currently using demo data. 
            Set up Supabase to enable authentication, real data, and full functionality.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Setup Steps:</h3>
          
          {/* Step 1 */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Create Supabase Project</h4>
              <p className="text-sm text-gray-600 mb-2">
                Go to Supabase and create a new project
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Get API Credentials</h4>
              <p className="text-sm text-gray-600 mb-2">
                In your project dashboard: Settings → API → Copy URL and anon key
              </p>
              <div className="text-xs text-gray-500">
                URL format: <code>https://[project-id].supabase.co</code><br/>
                Key format: <code>eyJ... (long JWT token)</code>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Set Environment Variables</h4>
              <p className="text-sm text-gray-600 mb-3">
                Add these variables to your deployment platform:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white p-2 rounded border">
                    VITE_SUPABASE_URL=https://your-project-id.supabase.co
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('VITE_SUPABASE_URL=https://your-project-id.supabase.co', 3)}
                  >
                    <Copy className="h-3 w-3" />
                    {copiedStep === 3 ? 'Copied!' : ''}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white p-2 rounded border">
                    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here', 4)}
                  >
                    <Copy className="h-3 w-3" />
                    {copiedStep === 4 ? 'Copied!' : ''}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Run Database Migration</h4>
              <p className="text-sm text-gray-600 mb-2">
                In Supabase SQL Editor, run the migration from:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white p-2 rounded border">
                  supabase/migrations/001_create_tables.sql
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('supabase/migrations/001_create_tables.sql', 5)}
                >
                  <Copy className="h-3 w-3" />
                  {copiedStep === 5 ? 'Copied!' : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 p-3 bg-gray-100 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Key className="h-4 w-4" />
            Current Configuration Status
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {currentUrl ? (
                currentUrl.includes('your-project-id') || currentUrl.includes('REPLACE_WITH') ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Supabase URL: {currentUrl || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              {currentKey ? (
                currentKey.includes('your_supabase_anon_key') || currentKey.includes('REPLACE_WITH') ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>API Key: {currentKey ? 'Set (hidden)' : 'Not set'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
