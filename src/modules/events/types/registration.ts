export type RegistrationRole = 'ATTENDEE' | 'CHILD' | 'VOLUNTEER' | 'STAFF' | 'GUEST';

export type RegistrationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'WAITLISTED'
  | 'CANCELLED'
  | 'CHECKED_IN';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED' | 'FREE';

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'signature'
  | 'consent';

export interface ConditionalLogic {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
  action: 'show' | 'hide' | 'require';
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: { label: string; value: string }[]; // For select/multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  conditionalLogic?: ConditionalLogic[];
  defaultValue?: any;
  section?: string; // For grouping fields
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  roleVisibility?: RegistrationRole[]; // Which roles see this section
  order: number;
}

export interface RegistrationFormSchema {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  sections: FormSection[];
  fields: FormField[];
  settings: {
    allowGroupRegistration: boolean;
    allowGuestRegistration: boolean;
    requireEmailVerification: boolean;
    waitlistEnabled: boolean;
    capacityLimit?: number;
    closeDate?: string;
  };
}

export interface RegistrationSubmission {
  id: string;
  eventId: string;
  primaryRegistrantId?: string; // If part of a group/family
  role: RegistrationRole;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;

  // Personal Details (Standardized)
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;

  // Dynamic Data
  formData: Record<string, any>; // Keyed by fieldId

  // Meta
  submittedAt: string;
  updatedAt: string;
  credentialId?: string;
  checkInTime?: string;

  // Relations
  groupId?: string;
  parentId?: string; // For children
}

export interface RegistrationStats {
  total: number;
  confirmed: number;
  pending: number;
  waitlisted: number;
  checkedIn: number;
  revenue: number;
  byRole: Record<RegistrationRole, number>;
}
