import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bell,
  Shield,
  Settings,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Profile } from "@shared/types";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  city: z.string().optional(),
  college: z.string().optional(),
  graduation_year: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  push_notifications: z.boolean(),
  event_reminders: z.boolean(),
  marketing_emails: z.boolean(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const eventTypes = [
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'seminar', label: 'Seminars' },
  { id: 'ideathon', label: 'Ideathons' },
  { id: 'conference', label: 'Conferences' },
  { id: 'networking', label: 'Networking' },
];

const skillOptions = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Machine Learning',
  'Data Science', 'UI/UX Design', 'Mobile Development', 'Cloud Computing',
  'DevOps', 'Blockchain', 'Cybersecurity', 'AI/ML', 'Database Management'
];

const cities = [
  'Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Pune',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Indore'
];

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { user, profile, updateProfile, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerNotifications,
    handleSubmit: handleNotificationsSubmit,
    setValue: setNotificationValue,
    formState: { errors: notificationErrors },
  } = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      // Populate form with existing profile data
      setProfileValue("full_name", profile.full_name || "");
      setProfileValue("email", profile.email || user?.email || "");
      setProfileValue("phone", profile.phone || "");
      setProfileValue("bio", profile.bio || "");
      setProfileValue("city", profile.city || "");
      setProfileValue("college", profile.college || "");
      setProfileValue("graduation_year", profile.graduation_year?.toString() || "");
      
      if (profile.skills) {
        setSelectedSkills(profile.skills);
      }
      if (profile.interests) {
        setSelectedInterests(profile.interests);
      }

      // Populate notification preferences (mock data)
      setNotificationValue("email_notifications", true);
      setNotificationValue("sms_notifications", false);
      setNotificationValue("push_notifications", true);
      setNotificationValue("event_reminders", true);
      setNotificationValue("marketing_emails", false);
    }
  }, [profile, user, setProfileValue, setNotificationValue]);

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updatedProfile: Partial<Profile> = {
        ...data,
        skills: selectedSkills,
        interests: selectedInterests,
        graduation_year: data.graduation_year ? parseInt(data.graduation_year) : undefined,
      };

      await updateProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const onNotificationsSubmit = async (data: NotificationForm) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // In real implementation, update notification preferences
      console.log("Updating notification preferences:", data);
      
      setSuccess("Notification preferences updated!");
    } catch (err: any) {
      setError(err.message || "Failed to update notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // In real implementation, update password via Supabase
      console.log("Updating password...");
      
      resetPassword();
      setSuccess("Password updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        setLoading(true);
        // In real implementation, delete user account
        console.log("Deleting account...");
        await signOut();
        navigate("/");
      } catch (err: any) {
        setError(err.message || "Failed to delete account");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-fme-orange mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Demo Mode</h2>
              <p className="text-gray-600 mb-4">
                Profile management requires Supabase configuration.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-fme-blue hover:bg-fme-blue/90"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-fme-orange mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">
                Please log in to access your profile.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="bg-fme-blue hover:bg-fme-blue/90"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Information */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          placeholder="Your full name"
                          {...registerProfile("full_name")}
                        />
                        {profileErrors.full_name && (
                          <p className="text-sm text-red-600">{profileErrors.full_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          {...registerProfile("email")}
                          disabled
                        />
                        {profileErrors.email && (
                          <p className="text-sm text-red-600">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+91 XXXXX XXXXX"
                          {...registerProfile("phone")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select onValueChange={(value) => setProfileValue("city", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="college">College</Label>
                        <Input
                          id="college"
                          placeholder="Your college name"
                          {...registerProfile("college")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="graduation_year">Graduation Year</Label>
                        <Input
                          id="graduation_year"
                          type="number"
                          placeholder="2024"
                          min="2020"
                          max="2030"
                          {...registerProfile("graduation_year")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        rows={3}
                        {...registerProfile("bio")}
                      />
                      {profileErrors.bio && (
                        <p className="text-sm text-red-600">{profileErrors.bio.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-fme-blue hover:bg-fme-blue/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Skills */}
                  <div>
                    <Label className="text-base font-medium">Skills</Label>
                    <p className="text-sm text-gray-600 mb-3">Select your technical skills</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {skillOptions.map((skill) => (
                        <div
                          key={skill}
                          className={`p-2 border rounded-lg cursor-pointer text-sm transition-colors ${
                            selectedSkills.includes(skill)
                              ? 'border-fme-blue bg-fme-blue/10 text-fme-blue'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <Label className="text-base font-medium">Event Interests</Label>
                    <p className="text-sm text-gray-600 mb-3">Select your preferred event types</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {eventTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`p-2 border rounded-lg cursor-pointer text-sm transition-colors ${
                            selectedInterests.includes(type.id)
                              ? 'border-fme-orange bg-fme-orange/10 text-fme-orange'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleInterest(type.id)}
                        >
                          {type.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => onProfileSubmit({
                      full_name: watchProfile("full_name") || "",
                      email: watchProfile("email") || "",
                      phone: watchProfile("phone"),
                      bio: watchProfile("bio"),
                      city: watchProfile("city"),
                      college: watchProfile("college"),
                      graduation_year: watchProfile("graduation_year"),
                      skills: selectedSkills,
                      interests: selectedInterests,
                    })}
                    disabled={loading}
                    className="bg-fme-blue hover:bg-fme-blue/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNotificationsSubmit(onNotificationsSubmit)} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-600">Receive event updates via email</p>
                        </div>
                        <Checkbox {...registerNotifications("email_notifications")} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-gray-600">Receive urgent updates via SMS</p>
                        </div>
                        <Checkbox {...registerNotifications("sms_notifications")} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-gray-600">Browser push notifications</p>
                        </div>
                        <Checkbox {...registerNotifications("push_notifications")} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Event Reminders</Label>
                          <p className="text-sm text-gray-600">Reminders before events start</p>
                        </div>
                        <Checkbox {...registerNotifications("event_reminders")} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-gray-600">Updates about new features and offers</p>
                        </div>
                        <Checkbox {...registerNotifications("marketing_emails")} />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-fme-blue hover:bg-fme-blue/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          {...registerPassword("currentPassword")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...registerPassword("newPassword")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        {...registerPassword("confirmPassword")}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-fme-blue hover:bg-fme-blue/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Delete Account</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
