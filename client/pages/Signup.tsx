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
  User,
  Phone,
  ArrowLeft,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnboardingWizard from "@/components/OnboardingWizard";
import type { UserRole } from "@shared/types";
import { signInWithGoogle } from "@/lib/supabase";

const emailSignupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    role: z.enum(["student", "organizer"] as const),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const phoneSignupSchema = z.object({
  phone: z
    .string()
    .regex(/^[+]?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["student", "organizer"] as const),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type EmailSignupForm = z.infer<typeof emailSignupSchema>;
type PhoneSignupForm = z.infer<typeof phoneSignupSchema>;
type OTPForm = z.infer<typeof otpSchema>;

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newUser, setNewUser] = useState<any>(null);
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    watch: watchEmail,
    setValue: setEmailValue,
    formState: { errors: emailErrors },
  } = useForm<EmailSignupForm>({
    resolver: zodResolver(emailSignupSchema),
    defaultValues: {
      role: "student",
    },
  });

  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    setValue: setPhoneValue,
    formState: { errors: phoneErrors },
  } = useForm<PhoneSignupForm>({
    resolver: zodResolver(phoneSignupSchema),
    defaultValues: {
      role: "student",
    },
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  });

  const selectedRole = watchEmail("role");

  const onEmailSubmit = async (data: EmailSignupForm) => {
    try {
      setIsLoading(true);
      setError("");

      if (!isConfigured) {
        setError(
          "Authentication is not available. Please configure Supabase connection.",
        );
        return;
      }

      const profileData = {
        full_name: data.full_name,
        role: data.role,
      };

      const result = await signUp(data.email, data.password, profileData);
      setNewUser({ ...profileData, email: data.email });

      if (data.role === "student") {
        setShowOnboarding(true);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneSignupForm) => {
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

  const onOTPSubmit = async (data: OTPForm) => {
    try {
      setIsLoading(true);
      setError("");

      // In real implementation, verify OTP
      if (data.otp !== "123456") {
        // Mock OTP verification
        setError("Invalid OTP. Please try again.");
        return;
      }

      // Get phone signup data
      const phoneData = {
        full_name: registerPhone.getValues?.("full_name") || "",
        role: registerPhone.getValues?.("role") || "student",
      };

      setNewUser({ ...phoneData, phone: phoneNumber });

      if (phoneData.role === "student") {
        setShowOnboarding(true);
      } else {
        setSuccess(true);
      }
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
      setError(err.message || "Google Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed, navigating to dashboard...');
    setShowOnboarding(false);
    navigate("/dashboard");
  };

  if (showOnboarding && newUser?.role === "student") {
    return (
      <OnboardingWizard user={newUser} onComplete={handleOnboardingComplete} />
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="max-w-md w-full mx-auto px-4">
            <Card className="shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Account Created!
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedRole === "organizer"
                    ? "Your organizer account has been created. Please complete your verification to start creating events."
                    : "Your student account has been created successfully!"}
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-fme-blue hover:bg-fme-blue/90"
                >
                  {selectedRole === "organizer"
                    ? "Complete Verification"
                    : "Go to Login"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-12">
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
              Join FindMyEvent
            </h1>
            <p className="text-gray-600">
              Create your account to discover amazing tech events
            </p>
          </div>

          {/* Signup Card */}
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Create Account
              </CardTitle>
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

              {/* Signup Method Tabs */}
              <Tabs
                value={signupMethod}
                onValueChange={(value) =>
                  setSignupMethod(value as "email" | "phone")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4 mt-6">
                  <form
                    onSubmit={handleEmailSubmit(onEmailSubmit)}
                    className="space-y-4"
                  >
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedRole === "student"
                              ? "border-fme-blue bg-fme-blue/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setEmailValue("role", "student")}
                        >
                          <div className="text-center">
                            <User className="w-6 h-6 text-fme-blue mx-auto mb-1" />
                            <div className="font-medium">Student</div>
                            <div className="text-xs text-gray-500">
                              Discover events
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedRole === "organizer"
                              ? "border-fme-orange bg-fme-orange/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setEmailValue("role", "organizer")}
                        >
                          <div className="text-center">
                            <Calendar className="w-6 h-6 text-fme-orange mx-auto mb-1" />
                            <div className="font-medium">Organizer</div>
                            <div className="text-xs text-gray-500">
                              Host events
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="full_name"
                          placeholder="Your full name"
                          className="pl-10"
                          {...registerEmail("full_name")}
                        />
                      </div>
                      {emailErrors.full_name && (
                        <p className="text-sm text-red-600">
                          {emailErrors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
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
                          placeholder="Create password"
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          className="pl-10"
                          {...registerEmail("confirmPassword")}
                        />
                      </div>
                      {emailErrors.confirmPassword && (
                        <p className="text-sm text-red-600">
                          {emailErrors.confirmPassword.message}
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
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
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

                      {/* Role Selection */}
                      <div className="space-y-3">
                        <Label>I am a</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div
                            className="p-3 border-2 rounded-lg cursor-pointer border-fme-blue bg-fme-blue/5"
                            onClick={() => setPhoneValue("role", "student")}
                          >
                            <div className="text-center">
                              <User className="w-6 h-6 text-fme-blue mx-auto mb-1" />
                              <div className="font-medium">Student</div>
                            </div>
                          </div>

                          <div
                            className="p-3 border-2 rounded-lg cursor-pointer border-gray-200"
                            onClick={() => setPhoneValue("role", "organizer")}
                          >
                            <div className="text-center">
                              <Calendar className="w-6 h-6 text-fme-orange mx-auto mb-1" />
                              <div className="font-medium">Organizer</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_name_phone">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="full_name_phone"
                            placeholder="Your full name"
                            className="pl-10"
                            {...registerPhone("full_name")}
                          />
                        </div>
                        {phoneErrors.full_name && (
                          <p className="text-sm text-red-600">
                            {phoneErrors.full_name.message}
                          </p>
                        )}
                      </div>

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
                          "Verify OTP"
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

          {/* Login prompt */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-fme-blue hover:underline font-medium"
              >
                Sign in here
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
