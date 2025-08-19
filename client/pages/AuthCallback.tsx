import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login?error=auth_failed");
          return;
        }

        if (data.session && data.session.user) {
          // User is authenticated, check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist, create it using INSERT
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                full_name:
                  data.session.user.user_metadata?.full_name ||
                  data.session.user.user_metadata?.name ||
                  "Google User",
                role: "student", // Default role for Google sign-ups
                notification_preferences: {
                  email: true,
                  whatsapp: false,
                  telegram: false,
                },
              });

            if (createError) {
              console.error("Error creating profile:", createError);
              navigate("/login?error=profile_creation_failed");
              return;
            }
          }

          // Redirect to dashboard
          navigate("/dashboard");
        } else {
          // No session, redirect to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        navigate("/login?error=unexpected_error");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fme-blue" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Completing sign-in...
        </h2>
        <p className="text-gray-600">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  );
}
