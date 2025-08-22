import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Something went wrong</h3>
                    <p className="text-sm mt-1">
                      An unexpected error occurred. Please try refreshing the page.
                    </p>
                  </div>
                  
                  {this.state.error && process.env.NODE_ENV === 'development' && (
                    <details className="text-xs bg-gray-100 p-2 rounded">
                      <summary className="cursor-pointer">Error details</summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={this.handleRefresh}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                    <Button
                      onClick={this.handleReset}
                      size="sm"
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
