import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Loader2, 
  CreditCard, 
  User,
  Mail,
  GraduationCap,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { registerForEvent, createPayment, createNotification } from '@/lib/supabase';
import { initiatePayment, formatCurrency } from '@/lib/payment-utils';
import { generateTicketQR } from '@/lib/qr-utils';
import type { Event, TicketType, RegisterEventRequest } from '@shared/types';

const registrationSchema = z.object({
  ticket_type_id: z.string().min(1, 'Please select a ticket type'),
  team_name: z.string().optional(),
  team_members: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    college: z.string().optional(),
    year: z.number().min(1).max(6).optional(),
  })).optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface EventRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  event: Event;
  onSuccess?: () => void;
}

export default function EventRegistrationModal({ 
  open, 
  onClose, 
  event, 
  onSuccess 
}: EventRegistrationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const { user, profile } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const selectedTicketTypeId = watch('ticket_type_id');
  const teamName = watch('team_name');

  const onSubmit = async (data: RegistrationForm) => {
    try {
      setIsLoading(true);
      setError('');

      if (!user || !profile) {
        throw new Error('Please log in to register for events');
      }

      if (!selectedTicketType) {
        throw new Error('Please select a ticket type');
      }

      // Validate team requirements
      if (event.is_team_event && (!data.team_name || !data.team_members || data.team_members.length === 0)) {
        throw new Error('Team name and members are required for team events');
      }

      if (event.is_team_event && data.team_members && data.team_members.length > (event.max_team_size || 4)) {
        throw new Error(`Maximum team size is ${event.max_team_size}`);
      }

      // Prepare registration data
      const registrationData = {
        event_id: event.id,
        ticket_type_id: data.ticket_type_id,
        user_id: user.id,
        team_name: data.team_name,
        team_members: data.team_members,
      };

      // Handle payment if ticket is paid
      if (selectedTicketType.price > 0) {
        await handlePaymentAndRegistration(registrationData, selectedTicketType);
      } else {
        await handleFreeRegistration(registrationData);
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentAndRegistration = async (registrationData: any, ticketType: TicketType) => {
    return new Promise((resolve, reject) => {
      const paymentData = {
        amount: ticketType.price,
        currency: 'INR',
        orderId: `${event.id}-${Date.now()}`,
        organizerUpiId: event.organizer?.verification_documents?.[0] || '', // This should be organizer's UPI
        eventTitle: event.title,
        userEmail: profile!.email,
        userPhone: profile!.phone,
      };

      initiatePayment(
        paymentData,
        async (paymentResponse) => {
          try {
            // Create payment record
            const payment = await createPayment({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              amount: ticketType.price,
              currency: 'INR',
              status: 'completed',
              payment_method: 'upi',
              paid_at: new Date().toISOString(),
            });

            // Create ticket
            const ticket = await registerForEvent({
              ...registrationData,
              payment_id: payment.id,
            });

            // Generate QR code for ticket
            const qrCode = await generateTicketQR(ticket);
            
            // Create success notification
            await createNotification({
              user_id: user!.id,
              type: 'registration_confirmed',
              title: 'Registration Confirmed!',
              message: `You have successfully registered for ${event.title}`,
              data: { event_id: event.id, ticket_id: ticket.id },
            });

            setSuccess(true);
            onSuccess?.();
            resolve(ticket);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error('Payment failed or cancelled'));
        }
      );
    });
  };

  const handleFreeRegistration = async (registrationData: any) => {
    // Create ticket directly for free events
    const ticket = await registerForEvent(registrationData);

    // Generate QR code for ticket
    const qrCode = await generateTicketQR(ticket);

    // Create success notification
    await createNotification({
      user_id: user!.id,
      type: 'registration_confirmed',
      title: 'Registration Confirmed!',
      message: `You have successfully registered for ${event.title}`,
      data: { event_id: event.id, ticket_id: ticket.id },
    });

    setSuccess(true);
    onSuccess?.();
  };

  const handleTicketTypeSelect = (ticketTypeId: string) => {
    const ticketType = event.ticket_types?.find(t => t.id === ticketTypeId);
    setSelectedTicketType(ticketType || null);
    setValue('ticket_type_id', ticketTypeId);
  };

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, { name: '', email: '', college: '', year: 1 }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: string, value: any) => {
    setTeamMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      setValue('team_members', updated);
      return updated;
    });
  };

  const handleClose = () => {
    reset();
    setError('');
    setSuccess(false);
    setSelectedTicketType(null);
    setTeamMembers([]);
    onClose();
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully registered for {event.title}. 
              Check your email and dashboard for your ticket with QR code.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleClose}
                className="w-full bg-fme-blue hover:bg-fme-blue/90"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-fme-blue" />
            <span>Register for {event.title}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Event Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-fme-blue text-white">
                  {event.event_type.toUpperCase()}
                </Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(event.start_date).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.venue}, {event.city}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {event.current_participants} registered
                  {event.max_participants && ` of ${event.max_participants}`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Type Selection */}
          <div className="space-y-3">
            <Label>Select Ticket Type</Label>
            <div className="space-y-2">
              {event.ticket_types?.map((ticketType) => {
                const isSelected = selectedTicketTypeId === ticketType.id;
                const isAvailable = !ticketType.quantity || (ticketType.sold < ticketType.quantity);
                
                return (
                  <div
                    key={ticketType.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-fme-blue bg-fme-blue/5' 
                        : isAvailable 
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    onClick={() => isAvailable && handleTicketTypeSelect(ticketType.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{ticketType.name}</h4>
                        {ticketType.description && (
                          <p className="text-sm text-gray-600">{ticketType.description}</p>
                        )}
                        {ticketType.quantity && (
                          <p className="text-xs text-gray-500 mt-1">
                            {ticketType.quantity - ticketType.sold} left
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {ticketType.price === 0 ? 'Free' : formatCurrency(ticketType.price)}
                        </div>
                        {!isAvailable && (
                          <Badge variant="secondary" className="text-xs">
                            Sold Out
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.ticket_type_id && (
              <p className="text-sm text-red-600">{errors.ticket_type_id.message}</p>
            )}
          </div>

          {/* Team Registration */}
          {event.is_team_event && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team_name">Team Name</Label>
                <Input
                  id="team_name"
                  placeholder="Enter your team name"
                  {...register('team_name')}
                />
                {errors.team_name && (
                  <p className="text-sm text-red-600">{errors.team_name.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Team Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTeamMember}
                    disabled={teamMembers.length >= (event.max_team_size || 4)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {teamMembers.map((member, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Member {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            placeholder="Full name"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Email</Label>
                          <Input
                            type="email"
                            placeholder="Email address"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">College</Label>
                          <Input
                            placeholder="College name"
                            value={member.college}
                            onChange={(e) => updateTeamMember(index, 'college', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Year</Label>
                          <Select onValueChange={(value) => updateTeamMember(index, 'year', parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : `${year}th`} Year
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {teamMembers.length === 0 && (
                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Add team members to continue</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration Summary */}
          {selectedTicketType && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Registration Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ticket Type:</span>
                    <span className="font-medium">{selectedTicketType.name}</span>
                  </div>
                  {event.is_team_event && teamName && (
                    <div className="flex justify-between">
                      <span>Team:</span>
                      <span className="font-medium">{teamName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">
                      {selectedTicketType.price === 0 ? 'Free' : formatCurrency(selectedTicketType.price)}
                    </span>
                  </div>
                  {selectedTicketType.price > 0 && (
                    <div className="text-xs text-gray-600 pt-2 border-t">
                      Payment will be processed securely via UPI
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-fme-blue hover:bg-fme-blue/90"
              disabled={isLoading || !selectedTicketType}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedTicketType?.price === 0 ? 'Registering...' : 'Processing Payment...'}
                </>
              ) : (
                <>
                  {selectedTicketType?.price === 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Register for Free
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay {selectedTicketType ? formatCurrency(selectedTicketType.price) : ''}
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
