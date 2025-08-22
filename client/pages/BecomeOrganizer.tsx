import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, 
  Upload, 
  Loader2, 
  Shield, 
  CheckCircle,
  AlertCircle,
  FileText,
  Globe,
  Mail,
  Instagram,
  Linkedin
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createOrganizer, uploadFile, getFileUrl } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { CreateOrganizerRequest } from '@shared/types';

const organizerSchema = z.object({
  organization_name: z.string().min(2, 'Organization name is required'),
  organization_type: z.enum(['college', 'club', 'startup', 'company']),
  official_email: z.string().email('Valid email required').optional(),
  website_url: z.string().url('Valid URL required').optional(),
  instagram_handle: z.string().optional(),
  linkedin_url: z.string().url('Valid LinkedIn URL required').optional(),
  twitter_handle: z.string().optional(),
  description: z.string().min(50, 'Please provide a detailed description (minimum 50 characters)'),
});

type OrganizerForm = z.infer<typeof organizerSchema>;

const organizationTypes = [
  { value: 'college', label: 'College/University', description: 'Educational institution' },
  { value: 'club', label: 'Student Club', description: 'Student organization or club' },
  { value: 'startup', label: 'Startup', description: 'Early-stage company' },
  { value: 'company', label: 'Company', description: 'Established business' },
];

export default function BecomeOrganizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // If user is already an organizer, redirect to organizer dashboard
  useEffect(() => {
    if (profile?.role === 'organizer') {
      navigate('/organizer/dashboard');
    }
  }, [profile, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrganizerForm>({
    resolver: zodResolver(organizerSchema),
  });

  const onSubmit = async (data: OrganizerForm) => {
    try {
      setIsLoading(true);
      setError('');

      if (!user) {
        throw new Error('You must be logged in to become an organizer');
      }

      if (uploadedDocs.length === 0) {
        throw new Error('Please upload at least one verification document');
      }

      const organizerData = {
        user_id: user.id,
        organization_name: data.organization_name,
        organization_type: data.organization_type,
        official_email: data.official_email,
        website_url: data.website_url,
        social_links: {
          instagram: data.instagram_handle,
          linkedin: data.linkedin_url,
          twitter: data.twitter_handle,
        },
        verification_documents: uploadedDocs,
        verification_status: 'pending',
      };

      await createOrganizer(organizerData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit organizer application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      const { path } = await uploadFile('verification-docs', fileName, file);
      const fileUrl = getFileUrl('verification-docs', path);
      setUploadedDocs(prev => [...prev, fileUrl]);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload document. Please try again.');
    }
  };

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
                Please log in to apply as an organizer.
              </p>
              <Button 
                onClick={() => navigate('/login')}
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

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-2xl w-full mx-4">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Application Submitted!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for applying to become an organizer. Your application is now under review.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-fme-blue mb-3">What happens next?</h3>
                <div className="text-left space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-fme-blue rounded-full mr-3"></div>
                    Our team will review your application and documents
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-fme-blue rounded-full mr-3"></div>
                    We may contact you for additional information
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-fme-blue rounded-full mr-3"></div>
                    You'll receive an email notification about the decision
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-fme-blue rounded-full mr-3"></div>
                    Once approved, you can start creating events
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-fme-blue hover:bg-fme-blue/90"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/events')}
                >
                  Browse Events
                </Button>
              </div>
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
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-fme-blue to-fme-orange rounded-lg mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Become an Event Organizer
            </h1>
            <p className="text-xl text-gray-600">
              Join FindMyEvent and start hosting amazing tech events for students
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-10 h-10 text-fme-blue mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Verified Badge</h3>
                <p className="text-sm text-gray-600">Get a verified organizer badge for credibility</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Building className="w-10 h-10 text-fme-orange mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Zero Commission</h3>
                <p className="text-sm text-gray-600">Direct UPI payments with no platform fees</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Easy Management</h3>
                <p className="text-sm text-gray-600">Simple tools for tickets, analytics & check-ins</p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Organization Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Organization Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization_name">Organization Name</Label>
                      <Input
                        id="organization_name"
                        placeholder="IIT Delhi Tech Club"
                        {...register('organization_name')}
                      />
                      {errors.organization_name && (
                        <p className="text-sm text-red-600">{errors.organization_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization_type">Organization Type</Label>
                      <Select onValueChange={(value) => setValue('organization_type', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizationTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-gray-500">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.organization_type && (
                        <p className="text-sm text-red-600">{errors.organization_type.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Organization Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      placeholder="Tell us about your organization, what events you plan to host, and your experience..."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="official_email">Official Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="official_email"
                          type="email"
                          placeholder="contact@organization.edu"
                          className="pl-10"
                          {...register('official_email')}
                        />
                      </div>
                      {errors.official_email && (
                        <p className="text-sm text-red-600">{errors.official_email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website URL</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="website_url"
                          type="url"
                          placeholder="https://yourorganization.edu"
                          className="pl-10"
                          {...register('website_url')}
                        />
                      </div>
                      {errors.website_url && (
                        <p className="text-sm text-red-600">{errors.website_url.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Social Media (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram_handle">Instagram Handle</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="instagram_handle"
                          placeholder="@yourorganization"
                          className="pl-10"
                          {...register('instagram_handle')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn Page</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="linkedin_url"
                          type="url"
                          placeholder="https://linkedin.com/company/..."
                          className="pl-10"
                          {...register('linkedin_url')}
                        />
                      </div>
                      {errors.linkedin_url && (
                        <p className="text-sm text-red-600">{errors.linkedin_url.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Verification Documents</h3>
                  <p className="text-sm text-gray-600">
                    Upload official documents to verify your organization (ID card, letter of authorization, etc.)
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-fme-blue bg-fme-blue/10 hover:bg-fme-blue/20 cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                    
                    {uploadedDocs.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</p>
                        <div className="space-y-1">
                          {uploadedDocs.map((doc, index) => (
                            <div key={index} className="flex items-center text-sm text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Document {index + 1} uploaded successfully
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-fme-blue hover:bg-fme-blue/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
