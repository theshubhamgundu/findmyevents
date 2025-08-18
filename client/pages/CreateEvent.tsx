import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Loader2, 
  Plus, 
  Trash2, 
  Upload,
  AlertCircle,
  Clock,
  Tag,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getOrganizerByUserId, createEvent, createTicketTypes } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { EventType, CreateEventRequest } from '@shared/types';

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
  sale_start: z.string().optional(),
  sale_end: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  event_type: z.enum(['hackathon', 'workshop', 'seminar', 'fest', 'ideathon', 'other']),
  venue: z.string().min(3, 'Venue is required'),
  address: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  registration_deadline: z.string().optional(),
  max_participants: z.number().min(1, 'Max participants must be at least 1').optional(),
  is_team_event: z.boolean(),
  max_team_size: z.number().min(2, 'Team size must be at least 2').optional(),
  tags: z.array(z.string()),
  requirements: z.string().optional(),
  prizes: z.string().optional(),
  contact_email: z.string().email('Valid email required').optional(),
  contact_phone: z.string().optional(),
  contact_website: z.string().url('Valid URL required').optional(),
  organizer_upi_id: z.string().optional(),
  ticket_types: z.array(ticketTypeSchema).min(1, 'At least one ticket type is required'),
});

type EventForm = z.infer<typeof eventSchema>;

const eventTypes: { value: EventType; label: string; description: string }[] = [
  { value: 'hackathon', label: 'Hackathon', description: 'Competitive coding and innovation event' },
  { value: 'workshop', label: 'Workshop', description: 'Hands-on learning session' },
  { value: 'seminar', label: 'Seminar', description: 'Educational talk or presentation' },
  { value: 'fest', label: 'Tech Fest', description: 'Multi-day technical festival' },
  { value: 'ideathon', label: 'Ideathon', description: 'Idea generation and pitching event' },
  { value: 'other', label: 'Other', description: 'Other type of technical event' },
];

const popularTags = [
  'AI/ML', 'Web Development', 'Mobile App', 'Blockchain', 'IoT', 'Cybersecurity',
  'Data Science', 'Cloud Computing', 'DevOps', 'UI/UX', 'Game Development', 'AR/VR'
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

export default function CreateEvent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [organizer, setOrganizer] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      is_team_event: false,
      tags: [],
      ticket_types: [
        {
          name: 'General',
          description: 'Standard event ticket',
          price: 0,
          quantity: 100,
        }
      ],
    },
  });

  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({
    control,
    name: 'ticket_types',
  });

  const isTeamEvent = watch('is_team_event');
  const eventType = watch('event_type');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrganizer = async () => {
      try {
        const orgData = await getOrganizerByUserId(user.id);
        if (!orgData) {
          navigate('/become-organizer');
          return;
        }
        setOrganizer(orgData);
      } catch (error) {
        console.error('Error loading organizer:', error);
        setError('Failed to load organizer data');
      }
    };

    loadOrganizer();
  }, [user, navigate]);

  const onSubmit = async (data: EventForm) => {
    try {
      setIsLoading(true);
      setError('');

      if (!organizer) {
        throw new Error('Organizer not found');
      }

      // Prepare event data
      const eventData = {
        ...data,
        organizer_id: organizer.id,
        contact_info: {
          email: data.contact_email,
          phone: data.contact_phone,
          website: data.contact_website,
        },
        event_status: organizer.verification_status === 'approved' ? 'published' : 'pending',
      };

      // Create event
      const event = await createEvent(eventData);

      // Create ticket types
      const ticketTypesData = data.ticket_types.map(ticket => ({
        ...ticket,
        event_id: event.id,
        is_active: true,
      }));

      await createTicketTypes(ticketTypesData);

      // Redirect to event page or dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setValue('tags', newTags);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const addTicketType = () => {
    appendTicket({
      name: '',
      description: '',
      price: 0,
      quantity: 100,
    });
  };

  if (!user) {
    return <div>Please log in to create events.</div>;
  }

  if (!organizer) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-fme-orange mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Become an Organizer</h2>
              <p className="text-gray-600 mb-4">
                You need to register as an organizer before creating events.
              </p>
              <Button 
                onClick={() => navigate('/become-organizer')}
                className="bg-fme-blue hover:bg-fme-blue/90"
              >
                Register as Organizer
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
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Event
            </h1>
            <p className="text-gray-600">
              Fill in the details below to create and publish your event.
            </p>
            
            {organizer.verification_status !== 'approved' && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your organizer account is pending verification. Events will be hidden until approved.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Amazing Tech Hackathon 2024"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe your event, what participants can expect, and any special highlights..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select onValueChange={(value) => setValue('event_type', value as EventType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-gray-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.event_type && (
                      <p className="text-sm text-red-600">{errors.event_type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Team Event</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is_team_event"
                        onCheckedChange={(checked) => setValue('is_team_event', !!checked)}
                      />
                      <Label htmlFor="is_team_event" className="text-sm">
                        This is a team-based event
                      </Label>
                    </div>
                  </div>
                </div>

                {isTeamEvent && (
                  <div className="space-y-2">
                    <Label htmlFor="max_team_size">Maximum Team Size</Label>
                    <Input
                      id="max_team_size"
                      type="number"
                      min="2"
                      max="10"
                      placeholder="4"
                      {...register('max_team_size', { valueAsNumber: true })}
                    />
                    {errors.max_team_size && (
                      <p className="text-sm text-red-600">{errors.max_team_size.message}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      placeholder="IIT Delhi, Lecture Hall Complex"
                      {...register('venue')}
                    />
                    {errors.venue && (
                      <p className="text-sm text-red-600">{errors.venue.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New Delhi"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      placeholder="Detailed address with landmarks"
                      {...register('address')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select onValueChange={(value) => setValue('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map(state => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date & Time</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      {...register('start_date')}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-600">{errors.start_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date & Time</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      {...register('end_date')}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-600">{errors.end_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_deadline">Registration Deadline</Label>
                    <Input
                      id="registration_deadline"
                      type="datetime-local"
                      {...register('registration_deadline')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Tickets & Pricing
                  </span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addTicketType}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ticket Type
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {ticketFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Ticket Type {index + 1}</h4>
                      {ticketFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicket(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`ticket_types.${index}.name`}>Name</Label>
                        <Input
                          placeholder="Early Bird, Regular, Student..."
                          {...register(`ticket_types.${index}.name`)}
                        />
                        {errors.ticket_types?.[index]?.name && (
                          <p className="text-sm text-red-600">
                            {errors.ticket_types[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`ticket_types.${index}.price`}>Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          {...register(`ticket_types.${index}.price`, { valueAsNumber: true })}
                        />
                        {errors.ticket_types?.[index]?.price && (
                          <p className="text-sm text-red-600">
                            {errors.ticket_types[index]?.price?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`ticket_types.${index}.description`}>Description</Label>
                      <Input
                        placeholder="Brief description of this ticket type..."
                        {...register(`ticket_types.${index}.description`)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`ticket_types.${index}.quantity`}>Available Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="100"
                          {...register(`ticket_types.${index}.quantity`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`ticket_types.${index}.sale_start`}>Sale Start</Label>
                        <Input
                          type="datetime-local"
                          {...register(`ticket_types.${index}.sale_start`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`ticket_types.${index}.sale_end`}>Sale End</Label>
                        <Input
                          type="datetime-local"
                          {...register(`ticket_types.${index}.sale_end`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="organizer_upi_id">Your UPI ID (for payments)</Label>
                  <Input
                    id="organizer_upi_id"
                    placeholder="your-upi@paytm"
                    {...register('organizer_upi_id')}
                  />
                  <p className="text-sm text-gray-500">
                    Payments will be sent directly to this UPI ID with zero commission
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Maximum Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    {...register('max_participants', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <Button
                        key={tag}
                        type="button"
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    rows={3}
                    placeholder="Prerequisites, things to bring, technical requirements..."
                    {...register('requirements')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prizes">Prizes & Benefits</Label>
                  <Textarea
                    id="prizes"
                    rows={3}
                    placeholder="Cash prizes, certificates, internship opportunities..."
                    {...register('prizes')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="contact@event.com"
                      {...register('contact_email')}
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-red-600">{errors.contact_email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      placeholder="+91 XXXXX XXXXX"
                      {...register('contact_phone')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_website">Event Website</Label>
                  <Input
                    id="contact_website"
                    type="url"
                    placeholder="https://your-event-website.com"
                    {...register('contact_website')}
                  />
                  {errors.contact_website && (
                    <p className="text-sm text-red-600">{errors.contact_website.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
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
                    Creating Event...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
