import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthStatus {
  supabase: "connected" | "error" | "unconfigured";
  database: "connected" | "error" | "untested";
  auth: "available" | "error" | "untested";
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    supabase: "unconfigured",
    database: "untested",
    auth: "untested",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    setErrorDetails("");

    if (!isSupabaseConfigured) {
      const newStatus = {
        supabase: "unconfigured" as const,
        database: "untested" as const,
        auth: "untested" as const,
      };
      setStatus(newStatus);
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Test Supabase connection with a simple query
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) {
        const errorMsg = `Database error: ${error.message} (Code: ${error.code || "unknown"})`;
        console.error("Database health check failed:", error);
        setErrorDetails(errorMsg);

        const newStatus = {
          supabase: "connected" as const,
          database: "error" as const,
          auth: "untested" as const,
        };
        setStatus(newStatus);
        setIsVisible(true);
        setIsLoading(false);
        return;
      }

      // Test auth service
      const { data: authData, error: authError } =
        await supabase.auth.getSession();

      const newStatus = {
        supabase: "connected" as const,
        database: "connected" as const,
        auth: authError ? ("error" as const) : ("available" as const),
      };

      if (authError) {
        const authErrorMsg = `Auth error: ${authError.message}`;
        console.error("Auth health check failed:", authError);
        setErrorDetails(authErrorMsg);
      }

      setStatus(newStatus);

      // Check the new status for visibility
      const hasIssues = Object.values(newStatus).some(
        (s) => s === "error" || s === "unconfigured",
      );
      setIsVisible(hasIssues);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Health check failed:", error);
      setErrorDetails(`Connection failed: ${errorMsg}`);

      setStatus({
        supabase: "error",
        database: "error",
        auth: "error",
      });
      setIsVisible(true);
    }

    setIsLoading(false);
  };

  if (!isVisible) return null;

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "connected":
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusText = (key: string, statusValue: string) => {
    const labels = {
      supabase: "Supabase Connection",
      database: "Database Access",
      auth: "Authentication",
    };

    const statusTexts = {
      connected: "Connected",
      available: "Available",
      error: "Error",
      unconfigured: "Not Configured",
      untested: "Not Tested",
    };

    return `${labels[key as keyof typeof labels]}: ${statusTexts[statusValue as keyof typeof statusTexts]}`;
  };

  const hasErrors = Object.values(status).some((s) => s === "error");
  const isUnconfigured = status.supabase === "unconfigured";

  return (
    <Alert
      className={`mb-4 ${hasErrors ? "border-red-200 bg-red-50" : isUnconfigured ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}`}
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              {isUnconfigured
                ? "Configuration Required"
                : hasErrors
                  ? "Service Issues Detected"
                  : "System Status"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkHealth}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Checking..." : "Retry"}
            </Button>
          </div>

          <div className="space-y-1 text-sm">
            {Object.entries(status).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {getStatusIcon(value)}
                <span>{getStatusText(key, value)}</span>
              </div>
            ))}
          </div>

          {errorDetails && (
            <div className="text-sm p-2 bg-red-100 border border-red-200 rounded text-red-800">
              <strong>Error Details:</strong> {errorDetails}
            </div>
          )}

          {isUnconfigured && (
            <div className="text-sm mt-2 text-blue-600">
              <strong>Next Steps:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>
                  Create a Supabase project at{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    supabase.com
                  </a>
                </li>
                <li>Copy your project URL and anon key</li>
                <li>Update environment variables in your hosting platform</li>
                <li>
                  Run the database migration from{" "}
                  <code>supabase/migrations/001_create_tables.sql</code>
                </li>
              </ol>
            </div>
          )}

          {hasErrors && !isUnconfigured && (
            <div className="text-sm mt-2 text-red-600">
              <strong>Troubleshooting:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Verify your Supabase URL and API key are correct</li>
                <li>
                  Check if your database tables exist (run the migration SQL)
                </li>
                <li>Ensure your Supabase project is active and not paused</li>
                <li>Check network connectivity</li>
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
