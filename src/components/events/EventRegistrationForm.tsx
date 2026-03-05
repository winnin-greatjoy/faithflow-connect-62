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
import { FormField } from '@/modules/events/types/registration';

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  capacity?: number;
  onSuccess?: () => void;
}

interface StoredRegistrationFormSchema {
  version: 1;
  title: string;
  description?: string;
  fields: FormField[];
  settings?: {
    waitlistEnabled?: boolean;
    allowGuestRegistration?: boolean;
    closeDate?: string | null;
  };
  updatedAt?: string;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(
    null
  );
  const [customFields, setCustomFields] = useState<FormField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);
  const [allowGuestRegistration, setAllowGuestRegistration] = useState(true);
  const [registrationCloseDate, setRegistrationCloseDate] = useState<string | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    // Auto-fill for logged-in members
    const loadUserData = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        setCurrentUserId(user.user.id);
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

        const schema = (ev?.metadata as any)?.registration_form_schema as
          | StoredRegistrationFormSchema
          | undefined;
        const schemaFields = Array.isArray(schema?.fields) ? schema?.fields : [];
        setCustomFields(schemaFields || []);
        const defaults = (schemaFields || []).reduce<Record<string, any>>((acc, field) => {
          if (field.defaultValue !== undefined) {
            acc[field.id] = field.defaultValue;
          }
          return acc;
        }, {});
        setCustomFieldValues(defaults);
        setWaitlistEnabled(schema?.settings?.waitlistEnabled ?? true);
        setAllowGuestRegistration(schema?.settings?.allowGuestRegistration ?? true);
        setRegistrationCloseDate(schema?.settings?.closeDate ?? null);

        const { count } = await registrationsApi.getRegistrationCount(eventId);
        setRegistrationCount(count || 0);

        const elig = await registrationsApi.checkEligibility(eventId);
        if (!elig.eligible) {
          setEligibility(elig);
          return;
        }

        if (schema?.settings?.closeDate) {
          const now = new Date();
          const closeAt = new Date(schema.settings.closeDate);
          if (!Number.isNaN(closeAt.getTime()) && closeAt.getTime() < now.getTime()) {
            setEligibility({
              eligible: false,
              reason: 'Registration is closed for this event.',
            });
            return;
          }
        }

        const { data: authUser } = await supabase.auth.getUser();
        if (!schema?.settings?.allowGuestRegistration && !authUser.user?.id) {
          setEligibility({
            eligible: false,
            reason: 'Please sign in to register for this event.',
          });
          return;
        }

        setEligibility(elig);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };

    loadUserData();
    loadInitialData();
  }, [eventId]);

  const setCustomValue = (fieldId: string, value: any) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const isEmptyCustomValue = (field: FormField, value: any) => {
    if (field.type === 'checkbox') return value !== true;
    if (field.type === 'multiselect') return !Array.isArray(value) || value.length === 0;
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    return false;
  };

  const getMissingRequiredField = () => {
    for (const field of customFields) {
      if (!field.required) continue;
      if (isEmptyCustomValue(field, customFieldValues[field.id])) {
        return field.label;
      }
    }
    return null;
  };

  const renderCustomField = (field: FormField) => {
    const value = customFieldValues[field.id];
    const commonLabel = (
      <Label htmlFor={field.id}>
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
    );

    if (field.type === 'textarea') {
      return (
        <div key={field.id}>
          {commonLabel}
          <textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => setCustomValue(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.id}>
          {commonLabel}
          <select
            id={field.id}
            value={value || ''}
            onChange={(e) => setCustomValue(field.id, e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'multiselect') {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div key={field.id}>
          {commonLabel}
          <div className="space-y-2 border rounded-md p-3">
            {(field.options || []).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCustomValue(field.id, [...selected, opt.value]);
                    } else {
                      setCustomValue(
                        field.id,
                        selected.filter((v) => v !== opt.value)
                      );
                    }
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="flex items-center gap-2">
          <input
            id={field.id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setCustomValue(field.id, e.target.checked)}
          />
          <Label htmlFor={field.id}>
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </Label>
        </div>
      );
    }

    const mappedType =
      field.type === 'email' ||
      field.type === 'phone' ||
      field.type === 'number' ||
      field.type === 'date'
        ? field.type
        : 'text';

    return (
      <div key={field.id}>
        {commonLabel}
        <Input
          id={field.id}
          type={mappedType}
          value={value || ''}
          onChange={(e) => setCustomValue(field.id, e.target.value)}
          placeholder={field.placeholder || ''}
        />
      </div>
    );
  };

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

    const missingRequiredField = getMissingRequiredField();
    if (missingRequiredField) {
      toast({
        title: 'Missing Information',
        description: `Please complete required field: ${missingRequiredField}`,
        variant: 'destructive',
      });
      return;
    }

    // Check capacity
    if (
      capacity &&
      registrationCount !== null &&
      registrationCount >= capacity &&
      !waitlistEnabled
    ) {
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
          metadata: {
            source: 'public_form',
            custom_fields: customFieldValues,
          },
        },
        { fee: eventData?.registration_fee, waitlistEnabled }
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
        description:
          capacity && registrationCount !== null && registrationCount >= capacity && waitlistEnabled
            ? `You've been added to the waitlist for ${eventTitle}`
            : `You've been registered for ${eventTitle}`,
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
  const registrationClosed =
    registrationCloseDate && !Number.isNaN(new Date(registrationCloseDate).getTime())
      ? new Date(registrationCloseDate).getTime() < Date.now()
      : false;

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
            ) : waitlistEnabled ? (
              <span className="text-amber-600">Event is full, waitlist is open</span>
            ) : (
              <span className="text-red-600">Event is full</span>
            )}
          </p>
        )}
        {registrationCloseDate && (
          <p className="text-xs text-muted-foreground">
            Registration closes on {new Date(registrationCloseDate).toLocaleDateString()}
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

        {customFields.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">Additional Information</h4>
            {customFields.map(renderCustomField)}
          </div>
        )}

        <Button
          type="submit"
          disabled={
            loading ||
            (capacity !== undefined && spotsLeft !== null && spotsLeft <= 0 && !waitlistEnabled) ||
            (!allowGuestRegistration && !currentUserId) ||
            registrationClosed ||
            (eligibility && !eligibility.eligible)
          }
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {eligibility && !eligibility.eligible
            ? 'Ineligible'
            : registrationClosed
              ? 'Registration Closed'
              : loading
                ? 'Registering...'
                : capacity !== undefined && spotsLeft !== null && spotsLeft <= 0 && waitlistEnabled
                  ? 'Join Waitlist'
                  : 'Register'}
        </Button>
      </form>
    </div>
  );
};

export default EventRegistrationForm;
