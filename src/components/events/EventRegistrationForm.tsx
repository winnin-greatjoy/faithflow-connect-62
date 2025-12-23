import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import registrationsApi from '@/services/registrationsApi';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, Banknote } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import eventsApi from '@/services/eventsApi';

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  capacity?: number;
  onSuccess?: () => void;
}

export const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  eventId,
  eventTitle,
  capacity,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registrationCount, setRegistrationCount] = useState<number | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(
    null
  );
  const { toast } = useToast();
  useEffect(() => {
    // Auto-fill for logged-in members
    const loadUserData = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', user.user.id)
          .single();

        if (profile) {
          setName(profile.full_name || '');
          setEmail(profile.email || user.user.email || '');
          setPhone(profile.phone || '');
        } else {
          setEmail(user.user.email || '');
        }
      }
    };

    // Load event data and registration count
    const loadInitialData = async () => {
      try {
        const { data: ev } = await eventsApi.getEvent(eventId);
        setEventData(ev);

        const { count } = await registrationsApi.getRegistrationCount(eventId);
        setRegistrationCount(count || 0);

        const elig = await registrationsApi.checkEligibility(eventId);
        setEligibility(elig);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };

    loadUserData();
    loadInitialData();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Check capacity
    if (capacity && registrationCount !== null && registrationCount >= capacity) {
      toast({
        title: 'Event Full',
        description: 'This event has reached its capacity',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await registrationsApi.registerForEvent(
        {
          event_id: eventId,
          name,
          email,
          phone,
        },
        { fee: eventData?.registration_fee }
      );

      if (error) {
        if (error.message?.includes('duplicate')) {
          throw new Error('You are already registered for this event');
        }
        throw error;
      }

      setSuccess(true);
      toast({
        title: 'Registration Successful!',
        description: `You've been registered for ${eventTitle}`,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({
        title: 'Registration Failed',
        description: err.message || 'Failed to register for event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Registration Confirmed!</h3>
        <p className="text-gray-600 mb-4">
          You've successfully registered for <strong>{eventTitle}</strong>
        </p>
        <p className="text-sm text-gray-500">A confirmation has been sent to {email}</p>
      </div>
    );
  }

  const spotsLeft = capacity && registrationCount !== null ? capacity - registrationCount : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold">Register for {eventTitle}</h3>

        {eventData?.target_audience && eventData.target_audience !== 'everyone' && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center gap-2 text-xs text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            <span>
              Target Audience:{' '}
              <strong className="capitalize">{eventData.target_audience.replace(/_/g, ' ')}</strong>
            </span>
          </div>
        )}

        {eventData?.is_paid ? (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-md flex items-center gap-2 text-xs text-amber-700">
            <Banknote className="h-4 w-4" />
            <span>
              Registration Fee: <strong>GHS {(eventData.registration_fee || 0).toFixed(2)}</strong>
            </span>
          </div>
        ) : (
          <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-md flex items-center gap-2 text-xs text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span>
              This event is <strong>Free</strong>
            </span>
          </div>
        )}

        {eligibility && !eligibility.eligible && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Eligible</AlertTitle>
            <AlertDescription>{eligibility.reason}</AlertDescription>
          </Alert>
        )}

        {capacity && spotsLeft !== null && (
          <p className="text-sm text-gray-600">
            {spotsLeft > 0 ? (
              <span className="text-green-600">
                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
              </span>
            ) : (
              <span className="text-red-600">Event is full</span>
            )}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <Button
          type="submit"
          disabled={
            loading ||
            (capacity !== undefined && spotsLeft !== null && spotsLeft <= 0) ||
            (eligibility && !eligibility.eligible)
          }
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {eligibility && !eligibility.eligible
            ? 'Ineligible'
            : loading
              ? 'Registering...'
              : 'Register'}
        </Button>
      </form>
    </div>
  );
};

export default EventRegistrationForm;
