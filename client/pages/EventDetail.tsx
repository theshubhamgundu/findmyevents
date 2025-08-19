import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Tag, Share2, ArrowLeft, CreditCard, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { getEventById, updateEventAnalytics } from '@/lib/supabase';
import { Event, PassType } from '@shared/types';
import { formatCurrency } from '@/lib/payment-utils';
import EventRegistrationModal from '@/components/EventRegistrationModal';

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedPass, setSelectedPass] = useState<PassType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const eventData = await getEventById(eventId);
      if (eventData) {
        setEvent(eventData);
        // Track page view
        await updateEventAnalytics(eventId, 'view');
      } else {
        toast({
          title: 'Event not found',
          description: 'The event you are looking for does not exist.',
          variant: 'destructive',
        });
        navigate('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = (passType: PassType) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to register for this event.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setSelectedPass(passType);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    setSelectedPass(null);
    toast({
      title: 'Registration Submitted!',
      description: 'Your registration has been submitted. You will receive a confirmation once payment is verified.',
    });
    // Refresh event data to update participant count
    fetchEvent();
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Event link has been copied to your clipboard.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Event not found.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isEventFull = event.max_participants && event.current_participants >= event.max_participants;
  const registrationClosed = event.registration_deadline && new Date(event.registration_deadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Event header */}
        <div className="mb-8">
          {event.banner_url && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                <div className="p-6 text-white">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {event.event_type}
                    </Badge>
                    {event.is_featured && (
                      <Badge className="bg-fme-orange text-white">Featured</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                  <p className="text-lg opacity-90">by {event.organizer?.organization_name}</p>
                </div>
              </div>
            </div>
          )}

          {!event.banner_url && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{event.event_type}</Badge>
                {event.is_featured && (
                  <Badge className="bg-fme-orange text-white">Featured</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-lg text-gray-600">by {event.organizer?.organization_name}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Event Details
                  <Button variant="outline" size="sm" onClick={shareEvent}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-fme-blue" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleTimeString()} - {new Date(event.end_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-fme-blue" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600">{event.venue}</p>
                      <p className="text-sm text-gray-600">{event.city}, {event.state}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-fme-blue" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-sm text-gray-600">
                        {event.current_participants} / {event.max_participants || '∞'} registered
                      </p>
                    </div>
                  </div>

                  {event.registration_deadline && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-fme-blue" />
                      <div>
                        <p className="font-medium">Registration Deadline</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.registration_deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {event.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{event.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Prizes */}
            {event.prizes && (
              <Card>
                <CardHeader>
                  <CardTitle>Prizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{event.prizes}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            {event.contact_info && Object.keys(event.contact_info).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.contact_info.email && (
                      <p>
                        <strong>Email:</strong> 
                        <a href={`mailto:${event.contact_info.email}`} className="text-fme-blue ml-2">
                          {event.contact_info.email}
                        </a>
                      </p>
                    )}
                    {event.contact_info.phone && (
                      <p>
                        <strong>Phone:</strong> 
                        <a href={`tel:${event.contact_info.phone}`} className="text-fme-blue ml-2">
                          {event.contact_info.phone}
                        </a>
                      </p>
                    )}
                    {event.contact_info.website && (
                      <p>
                        <strong>Website:</strong> 
                        <a href={event.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-fme-blue ml-2">
                          {event.contact_info.website}
                        </a>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Registration sidebar */}
          <div className="space-y-6">
            {/* Registration status */}
            {(isEventFull || registrationClosed) && (
              <Alert>
                <AlertDescription>
                  {isEventFull && 'This event is full.'}
                  {registrationClosed && 'Registration has closed.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Pass types */}
            {event.pass_types && event.pass_types.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    {event.requires_tickets ? 'Tickets Available' : 'Registration Options'}
                  </CardTitle>
                  <CardDescription>
                    Choose your registration type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.pass_types.map((passType) => (
                    <div key={passType.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{passType.name}</h4>
                          {passType.description && (
                            <p className="text-sm text-gray-600">{passType.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-lg font-bold text-fme-blue">
                            <IndianRupee className="w-4 h-4" />
                            {formatCurrency(passType.price)}
                          </div>
                          {passType.quantity && (
                            <p className="text-xs text-gray-500">
                              {passType.quantity - passType.sold} left
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <Button
                        onClick={() => handleRegisterClick(passType)}
                        disabled={
                          isEventFull || 
                          registrationClosed || 
                          (passType.quantity && passType.sold >= passType.quantity) ||
                          !passType.is_active
                        }
                        className="w-full bg-fme-blue hover:bg-fme-blue/90"
                      >
                        {passType.price === 0 ? 'Register Free' : 'Pay Now'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Organizer info */}
            {event.organizer && (
              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{event.organizer.organization_name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{event.organizer.organization_type}</p>
                    </div>
                    
                    {event.organizer.website_url && (
                      <a
                        href={event.organizer.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fme-blue hover:underline text-sm"
                      >
                        Visit Website
                      </a>
                    )}

                    {event.organizer.social_links && (
                      <div className="flex space-x-3">
                        {event.organizer.social_links.instagram && (
                          <a
                            href={event.organizer.social_links.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-fme-blue hover:underline text-sm"
                          >
                            Instagram
                          </a>
                        )}
                        {event.organizer.social_links.linkedin && (
                          <a
                            href={event.organizer.social_links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-fme-blue hover:underline text-sm"
                          >
                            LinkedIn
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Registrations</span>
                    <span className="font-medium">{event.current_participants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Event Type</span>
                    <span className="font-medium capitalize">{event.event_type}</span>
                  </div>
                  {event.is_team_event && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Team Size</span>
                      <span className="font-medium">{event.max_team_size}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Registration Modal */}
      {showRegistrationModal && selectedPass && event && (
        <EventRegistrationModal
          event={event}
          passType={selectedPass}
          isOpen={showRegistrationModal}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedPass(null);
          }}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
