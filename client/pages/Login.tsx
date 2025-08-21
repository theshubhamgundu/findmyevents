import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Mail,
  Lock,
  ArrowLeft,
  Calendar,
  Phone,
  MessageSquare,
} from "lucide-react";
import { signInWithGoogle } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const emailLoginSchema = z.object({
  email: z.string().min(1, "Email or username is required").refine(
    (value) => {
      // Allow admin username 'shubsss' without email validation
      if (value === 'shubsss') return true;
      // Otherwise require email format
      return z.string().email().safeParse(value).success;
    },
    {
      message: "Please enter a valid email address",
    }
  ),
  password: z.string().min(1, "Password is required"),
});

const phoneLoginSchema = z.object({
  phone: z
    .string()
    .regex(/^[+]?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
});

const otpLoginSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type EmailLoginForm = z.infer<typeof emailLoginSchema>;
type PhoneLoginForm = z.infer<typeof phoneLoginSchema>;
type OTPLoginForm = z.infer<typeof otpLoginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
  });

  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm<PhoneLoginForm>({
    resolver: zodResolver(phoneLoginSchema),
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPLoginForm>({
    resolver: zodResolver(otpLoginSchema),
  });

  const onEmailSubmit = async (data: EmailLoginForm) => {
    try {
      setIsLoading(true);
      setError("");

      if (!isConfigured) {
        setError(
          "Authentication is not available. Please configure Supabase connection.",
        );
        return;
      }

      await signIn(data.email, data.password);

      // Check if this is the admin demo login
      if (data.email === "shubsss" && data.password === "shubsss@1911") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneLoginForm) => {
    try {
      setIsLoading(true);
      setError("");

      // In real implementation, this would send OTP via SMS
      setPhoneNumber(data.phone);
      setOtpSent(true);

      // Mock OTP sending
      console.log("Sending OTP to:", data.phone);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPLoginForm) => {
    try {
      setIsLoading(true);
      setError("");

      // In real implementation, verify OTP and sign in user
      if (data.otp !== "123456") {
        // Mock OTP verification
        setError("Invalid OTP. Please try again.");
        return;
      }

      // Mock successful login
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!isConfigured) {
        setError(
          "Authentication is not available. Please configure Supabase connection.",
        );
        return;
      }

      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
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
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-fme-blue to-fme-orange rounded-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">
              Sign in to access your event dashboard and tickets
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Google Sign-in */}
              <div className="mb-6">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              {/* Login Method Tabs */}
              <Tabs
                value={loginMethod}
                onValueChange={(value) =>
                  setLoginMethod(value as "email" | "phone")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone + OTP
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4 mt-6">
                  <form
                    onSubmit={handleEmailSubmit(onEmailSubmit)}
                    className="space-y-4"
                  >
                    {!isConfigured && (
                      <Alert>
                        <AlertDescription>
                          <strong>Demo Mode:</strong> Authentication is
                          disabled. Configure Supabase to enable real login
                          functionality.
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email or Username</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="text"
                          placeholder="your@email.com or username"
                          className="pl-10"
                          {...registerEmail("email")}
                        />
                      </div>
                      {emailErrors.email && (
                        <p className="text-sm text-red-600">
                          {emailErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          {...registerEmail("password")}
                        />
                      </div>
                      {emailErrors.password && (
                        <p className="text-sm text-red-600">
                          {emailErrors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-fme-blue hover:bg-fme-blue/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>

                    <div className="text-center text-sm">
                      <Link
                        to="/forgot-password"
                        className="text-fme-blue hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-6">
                  {!otpSent ? (
                    <form
                      onSubmit={handlePhoneSubmit(onPhoneSubmit)}
                      className="space-y-4"
                    >
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="phone"
                            placeholder="+91 XXXXX XXXXX"
                            className="pl-10"
                            {...registerPhone("phone")}
                          />
                        </div>
                        {phoneErrors.phone && (
                          <p className="text-sm text-red-600">
                            {phoneErrors.phone.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-fme-blue hover:bg-fme-blue/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send OTP
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form
                      onSubmit={handleOTPSubmit(onOTPSubmit)}
                      className="space-y-4"
                    >
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="text-center mb-4">
                        <MessageSquare className="w-12 h-12 text-fme-blue mx-auto mb-2" />
                        <h3 className="text-lg font-semibold">
                          Verify Your Phone
                        </h3>
                        <p className="text-gray-600">
                          We've sent a 6-digit code to {phoneNumber}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                          {...registerOTP("otp")}
                        />
                        {otpErrors.otp && (
                          <p className="text-sm text-red-600">
                            {otpErrors.otp.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                          For demo, use: 123456
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-fme-blue hover:bg-fme-blue/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Sign In"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setOtpSent(false)}
                      >
                        Change Phone Number
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Sign up prompt */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-fme-blue hover:underline font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Volunteer Login */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Are you a volunteer?{" "}
              <Link
                to="/volunteer/login"
                className="text-green-600 hover:underline font-medium"
              >
                Volunteer Login
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-4 text-center">
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
