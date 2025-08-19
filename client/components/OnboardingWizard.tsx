import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar,
  Clock,
  MapPin,
  Globe,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  MessageCircle,
  Instagram,
  Smartphone
} from 'lucide-react';

const onboardingSchema = z.object({
  eventTypes: z.array(z.string()).min(1, 'Select at least one event type'),
  durations: z.array(z.string()).min(1, 'Select at least one duration preference'),
  locations: z.array(z.string()).min(1, 'Select at least one location preference'),
  wantsNotifications: z.boolean(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

interface OnboardingWizardProps {
  user: any;
  onComplete: () => void;
}

const eventTypes = [
  { id: 'hackathon', label: 'Hackathons', icon: '🖥️', description: 'Coding competitions & innovation challenges' },
  { id: 'workshop', label: 'Workshops', icon: '🛠️', description: 'Hands-on learning sessions' },
  { id: 'seminar', label: 'Seminars', icon: '🎤', description: 'Educational talks & presentations' },
  { id: 'ideathon', label: 'Ideathons', icon: '💡', description: 'Idea generation & pitching events' },
  { id: 'all', label: 'All Events', icon: '✅', description: 'Show me everything!' },
];

const durations = [
  { id: 'half-day', label: 'Half-day', description: '2-4 hours' },
  { id: 'full-day', label: 'Full-day', description: '6-8 hours' },
  { id: 'multi-day', label: 'Multi-day', description: '2+ days' },
];

const cities = [
  'Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Pune',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Indore'
];

const communityLinks = {
  whatsapp: 'https://chat.whatsapp.com/findmyevent',
  telegram: 'https://t.me/findmyevent',
  instagram: 'https://instagram.com/findmyevent'
};

export default function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [includeOnline, setIncludeOnline] = useState(false);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
  });

  const steps = [
    'Event Preferences',
    'Duration Preferences', 
    'Location Preferences',
    'Community Channels'
  ];

  const toggleEventType = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedEventTypes(['all']);
    } else {
      const newTypes = selectedEventTypes.includes(typeId)
        ? selectedEventTypes.filter(t => t !== typeId && t !== 'all')
        : [...selectedEventTypes.filter(t => t !== 'all'), typeId];
      setSelectedEventTypes(newTypes);
    }
    setValue('eventTypes', selectedEventTypes);
  };

  const toggleDuration = (durationId: string) => {
    const newDurations = selectedDurations.includes(durationId)
      ? selectedDurations.filter(d => d !== durationId)
      : [...selectedDurations, durationId];
    setSelectedDurations(newDurations);
    setValue('durations', newDurations);
  };

  const toggleLocation = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    setSelectedLocations(newLocations);
    setValue('locations', newLocations);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: OnboardingForm) => {
    try {
      // Save onboarding preferences to user profile
      console.log('Saving onboarding preferences:', {
        eventTypes: selectedEventTypes,
        durations: selectedDurations,
        locations: selectedLocations,
        includeOnline,
        user
      });

      // In real implementation, update user profile in Supabase

      // Mark onboarding as completed before calling onComplete
      localStorage.setItem('onboarding_completed', 'true');

      console.log('Onboarding completed, calling onComplete callback...');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding preferences:', error);
    }
  };

  const openCommunityLink = (platform: keyof typeof communityLinks) => {
    window.open(communityLinks[platform], '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-fme-blue to-fme-orange rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            Welcome to FindMyEvent! 🎉
          </CardTitle>
          <p className="text-gray-600">
            Let's personalize your experience, {user?.full_name}
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-fme-blue' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Event Type Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">What events interest you?</h3>
                  <p className="text-gray-600">Select the types of events you'd like to discover</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedEventTypes.includes(type.id)
                          ? 'border-fme-blue bg-fme-blue/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleEventType(type.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{type.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        </div>
                        {selectedEventTypes.includes(type.id) && (
                          <CheckCircle className="w-5 h-5 text-fme-blue flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {errors.eventTypes && (
                  <p className="text-sm text-red-600 text-center">{errors.eventTypes.message}</p>
                )}
              </div>
            )}

            {/* Step 2: Duration Preferences */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">How long can you commit?</h3>
                  <p className="text-gray-600">Select your preferred event durations</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {durations.map((duration) => (
                    <div
                      key={duration.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedDurations.includes(duration.id)
                          ? 'border-fme-blue bg-fme-blue/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleDuration(duration.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-6 h-6 text-fme-blue" />
                          <div>
                            <h4 className="font-medium text-gray-900">{duration.label}</h4>
                            <p className="text-sm text-gray-600">{duration.description}</p>
                          </div>
                        </div>
                        {selectedDurations.includes(duration.id) && (
                          <CheckCircle className="w-5 h-5 text-fme-blue" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {errors.durations && (
                  <p className="text-sm text-red-600 text-center">{errors.durations.message}</p>
                )}
              </div>
            )}

            {/* Step 3: Location Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Where do you want to attend?</h3>
                  <p className="text-gray-600">Select your preferred cities</p>
                </div>

                {/* Online Events Option */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    includeOnline
                      ? 'border-fme-orange bg-fme-orange/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setIncludeOnline(!includeOnline)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-6 h-6 text-fme-orange" />
                      <div>
                        <h4 className="font-medium text-gray-900">Online Events</h4>
                        <p className="text-sm text-gray-600">Attend from anywhere</p>
                      </div>
                    </div>
                    {includeOnline && (
                      <CheckCircle className="w-5 h-5 text-fme-orange" />
                    )}
                  </div>
                </div>

                {/* Cities Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cities.map((city) => (
                    <div
                      key={city}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center hover:shadow-sm ${
                        selectedLocations.includes(city)
                          ? 'border-fme-blue bg-fme-blue/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleLocation(city)}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{city}</span>
                        {selectedLocations.includes(city) && (
                          <CheckCircle className="w-4 h-4 text-fme-blue" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {errors.locations && (
                  <p className="text-sm text-red-600 text-center">{errors.locations.message}</p>
                )}
              </div>
            )}

            {/* Step 4: Community Channels */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Stay Connected! 🚀</h3>
                  <p className="text-gray-600">Join our community for exclusive updates and networking</p>
                </div>

                <div className="space-y-4">
                  {/* WhatsApp */}
                  <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">WhatsApp Community</h4>
                          <p className="text-sm text-gray-600">Get instant event updates & connect with peers</p>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => openCommunityLink('whatsapp')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Join Group
                      </Button>
                    </div>
                  </div>

                  {/* Telegram */}
                  <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Telegram Channel</h4>
                          <p className="text-sm text-gray-600">Daily event notifications & tech news</p>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => openCommunityLink('telegram')}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Join Channel
                      </Button>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="p-4 border-2 border-pink-200 bg-pink-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Instagram</h4>
                          <p className="text-sm text-gray-600">Event highlights, stories & community posts</p>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => openCommunityLink('instagram')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Follow
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </div>

              {currentStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  className="bg-fme-blue hover:bg-fme-blue/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-fme-blue hover:bg-fme-blue/90"
                  disabled={
                    (currentStep === 0 && selectedEventTypes.length === 0) ||
                    (currentStep === 1 && selectedDurations.length === 0) ||
                    (currentStep === 2 && selectedLocations.length === 0 && !includeOnline)
                  }
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
