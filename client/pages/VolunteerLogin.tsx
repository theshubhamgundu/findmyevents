import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Shield,
  Users,
  QrCode,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useVolunteerAuth } from "@/hooks/use-volunteer-auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const volunteerLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type VolunteerLoginForm = z.infer<typeof volunteerLoginSchema>;

export default function VolunteerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const { loginVolunteer } = useVolunteerAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VolunteerLoginForm>({
    resolver: zodResolver(volunteerLoginSchema),
  });

  const onSubmit = async (data: VolunteerLoginForm) => {
    try {
      setIsLoading(true);
      setError("");

      if (!isSupabaseConfigured) {
        // Demo volunteer authentication
        const demoVolunteers = [
          {
            id: "vol-demo-1",
            username: "volunteer1",
            password_hash: "volunteer123",
            event_id: "demo-event-1",
            events: {
              id: "demo-event-1",
              title: "AI/ML Workshop 2024",
              venue: "Tech Hub Auditorium",
              event_date: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              city: "Mumbai",
            },
          },
          {
            id: "vol-demo-2",
            username: "scanner",
            password_hash: "scanner123",
            event_id: "demo-event-2",
            events: {
              id: "demo-event-2",
              title: "React Bootcamp 2024",
              venue: "Innovation Center",
              event_date: new Date(
                Date.now() + 5 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              city: "Delhi",
            },
          },
        ];

        const volunteer = demoVolunteers.find(
          (v) =>
            v.username === data.username && v.password_hash === data.password,
        );

        if (!volunteer) {
          setError(
            "Invalid username or password. Try: volunteer1/volunteer123 or scanner/scanner123",
          );
          return;
        }

        // Store volunteer session using auth provider
        const volunteerSession = {
          id: volunteer.id,
          username: volunteer.username,
          event_id: volunteer.event_id,
          event: volunteer.events,
          logged_in_at: new Date().toISOString(),
        };

        loginVolunteer(volunteerSession);

        // Navigate to volunteer dashboard or specific event if eventId is provided
        const redirectTo = eventId
          ? `/volunteer/scan/${eventId}`
          : `/volunteer/scan/${volunteer.event_id}`;
        navigate(redirectTo);
        return;
      }

      // Authenticate volunteer with Supabase
      const { data: volunteer, error: authError } = await supabase
        .from("volunteers")
        .select("*, events(*)")
        .eq("username", data.username)
        .single();

      if (authError || !volunteer) {
        setError("Invalid username or password");
        return;
      }

      // In a real app, you'd hash the password. For demo, we'll use bcrypt comparison
      // For now, let's do a simple comparison (in production, use proper password hashing)
      const isPasswordValid = volunteer.password_hash === data.password; // Simplified for demo

      if (!isPasswordValid) {
        setError("Invalid username or password");
        return;
      }

      // Store volunteer session using auth provider
      const volunteerSession = {
        id: volunteer.id,
        username: volunteer.username,
        event_id: volunteer.event_id,
        event: volunteer.events,
        logged_in_at: new Date().toISOString(),
      };

      loginVolunteer(volunteerSession);

      // Navigate to volunteer dashboard or specific event if eventId is provided
      const redirectTo = eventId
        ? `/volunteer/scan/${eventId}`
        : `/volunteer/scan/${volunteer.event_id}`;
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center mb-6"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Volunteer Login
            </h1>
            <p className="text-gray-600">
              Sign in to access event scanning and check-in tools
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
                Volunteer Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!isSupabaseConfigured && (
                  <Alert>
                    <AlertDescription>
                      <strong>Demo Mode:</strong> Use these volunteer
                      credentials:
                      <br />
                      <strong>Username:</strong> volunteer1 or scanner
                      <br />
                      <strong>Password:</strong> volunteer123 or scanner123
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter volunteer username"
                      className="pl-10"
                      {...register("username")}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-600">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter volunteer password"
                      className="pl-10"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Access Scanner
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>Credentials provided by your event organizer</p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    Volunteer Access Features:
                  </p>
                  <ul className="text-blue-700 mt-1 space-y-1">
                    <li>• QR code ticket scanning</li>
                    <li>• Real-time check-in tracking</li>
                    <li>• Event attendee validation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-600">
              Are you an organizer?{" "}
              <Link
                to="/login"
                className="text-fme-blue hover:underline font-medium"
              >
                Organizer Login
              </Link>
            </p>

            <Link
              to="/"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
