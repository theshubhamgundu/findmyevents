import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, Lock, User, GraduationCap, Building, ArrowLeft, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { UserRole } from '@shared/types';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['student', 'organizer'] as const),
  college: z.string().optional(),
  year: z.number().min(1).max(6).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  interests: z.array(z.string()).optional(),
  agreeToTerms: z.boolean().refine(val => val, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

const eventInterests = [
  'hackathon',
  'workshop', 
  'seminar',
  'fest',
  'ideathon',
  'networking'
];

const years = [1, 2, 3, 4, 5, 6];

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'student',
      interests: [],
      agreeToTerms: false,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignupForm) => {
    try {
      setIsLoading(true);
      setError('');
      
      const profileData = {
        full_name: data.full_name,
        role: data.role,
        college: data.college,
        year: data.year,
        phone: data.phone,
        city: data.city,
        interests: selectedInterests,
      };

      await signUp(data.email, data.password, profileData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
    setValue('interests', newInterests);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="max-w-md w-full mx-auto px-4">
            <Card className="shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Email!
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent you a verification link. Please check your email and click the link to activate your account.
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-fme-blue hover:bg-fme-blue/90"
                >
                  Go to Login
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
        <div className="max-w-2xl w-full mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-fme-blue to-fme-orange rounded-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join FindMyEvent
            </h1>
            <p className="text-gray-600">
              Create your account to discover and organize amazing tech events
            </p>
          </div>

          {/* Signup Card */}
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedRole === 'student' 
                          ? 'border-fme-blue bg-fme-blue/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setValue('role', 'student')}
                    >
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="w-6 h-6 text-fme-blue" />
                        <div>
                          <div className="font-medium">Student</div>
                          <div className="text-sm text-gray-500">Discover events</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedRole === 'organizer' 
                          ? 'border-fme-orange bg-fme-orange/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setValue('role', 'organizer')}
                    >
                      <div className="flex items-center space-x-3">
                        <Building className="w-6 h-6 text-fme-orange" />
                        <div>
                          <div className="font-medium">Organizer</div>
                          <div className="text-sm text-gray-500">Host events</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="full_name"
                        placeholder="Your full name"
                        className="pl-10"
                        {...register('full_name')}
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-sm text-red-600">{errors.full_name.message}</p>
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
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create password"
                        className="pl-10"
                        {...register('password')}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password.message}</p>
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
                        {...register('confirmPassword')}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* Student-specific fields */}
                {selectedRole === 'student' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="college">College/University</Label>
                        <Input
                          id="college"
                          placeholder="Your institution"
                          {...register('college')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year of Study</Label>
                        <Select onValueChange={(value) => setValue('year', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : `${year}th`} Year
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="space-y-3">
                      <Label>Interests (select all that apply)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {eventInterests.map(interest => (
                          <div
                            key={interest}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                              selectedInterests.includes(interest)
                                ? 'border-fme-blue bg-fme-blue/10 text-fme-blue'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleInterest(interest)}
                          >
                            <span className="text-sm font-medium capitalize">{interest}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Optional fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      placeholder="+91 XXXXX XXXXX"
                      {...register('phone')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City (optional)</Label>
                    <Input
                      id="city"
                      placeholder="Your city"
                      {...register('city')}
                    />
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms"
                    onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <Link to="/terms" className="text-fme-blue hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-fme-blue hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}

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
                    'Create Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Login prompt */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-fme-blue hover:underline font-medium">
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
