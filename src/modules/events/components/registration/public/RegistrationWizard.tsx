import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
// import { DatePicker } from '@/components/ui/date-picker'; // Assumed component
import {
  User,
  Users,
  HeartHandshake,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { RegistrationFormSchema, RegistrationRole, FormField } from '../../../types/registration';
import { motion, AnimatePresence } from 'framer-motion';

interface RegistrationWizardProps {
  schema?: RegistrationFormSchema;
  eventName: string;
}

const STEPS = [
  { id: 'role', title: 'Start', icon: <User /> },
  { id: 'details', title: 'Details', icon: <CheckCircle2 /> },
  { id: 'addons', title: 'Extras', icon: <HeartHandshake /> },
  { id: 'payment', title: 'Finish', icon: <CreditCard /> },
];

export const RegistrationWizard = ({ eventName, schema }: RegistrationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [role, setRole] = useState<RegistrationRole>('ATTENDEE');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // --- Mock Schema if none provided ---
  const activeSchema = schema || {
    fields: [
      { id: 'f1', type: 'text', label: 'First Name', required: true },
      { id: 'f2', type: 'text', label: 'Last Name', required: true },
      { id: 'f3', type: 'email', label: 'Email Address', required: true },
      { id: 'f4', type: 'phone', label: 'Mobile Number', required: true },
    ] as FormField[],
  };

  const renderField = (field: FormField) => {
    return (
      <div key={field.id} className="space-y-2">
        <Label>
          {field.label} {field.required && <span className="text-destructive">*</span>}
        </Label>
        {field.type === 'text' && <Input placeholder={field.placeholder} />}
        {field.type === 'email' && <Input type="email" placeholder="you@example.com" />}
        {field.type === 'phone' && <Input type="tel" placeholder="+233..." />}
        {field.type === 'select' && (
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select option...</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl overflow-hidden shadow-xl rounded-2xl border-0">
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-8">
          <h5 className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-2">
            Registration
          </h5>
          <h1 className="text-3xl font-black">{eventName}</h1>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between mt-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-blue-500 transition-all duration-500 -z-0"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, idx) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all ${
                    idx <= currentStep
                      ? 'bg-blue-500 border-[#0F172A] text-white'
                      : 'bg-[#0F172A] border-white/20 text-white/40'
                  }`}
                >
                  {React.cloneElement(step.icon as React.ReactElement, { className: 'h-4 w-4' })}
                </div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    idx <= currentStep ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Who are you registering?</h2>
                  <p className="text-muted-foreground">
                    Select the option that best describes you.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-500 ${role === 'ATTENDEE' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                    onClick={() => setRole('ATTENDEE')}
                  >
                    <User className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-bold text-lg">Detailed Individual</h3>
                    <p className="text-sm text-gray-500">I am attending the event myself.</p>
                  </div>
                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-500 ${role === 'CHILD' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                    onClick={() => setRole('CHILD')}
                  >
                    <Users className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-bold text-lg">Group / Family</h3>
                    <p className="text-sm text-gray-500">I'm registering for me and my family.</p>
                  </div>
                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-500 ${role === 'VOLUNTEER' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                    onClick={() => setRole('VOLUNTEER')}
                  >
                    <HeartHandshake className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-bold text-lg">Volunteer</h3>
                    <p className="text-sm text-gray-500">I want to serve at this event.</p>
                  </div>
                  <div
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-500 ${role === 'STAFF' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
                    onClick={() => setRole('STAFF')}
                  >
                    <Briefcase className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-bold text-lg">Event Staff</h3>
                    <p className="text-sm text-gray-500">Official staff registration.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-lg mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Your Details</h2>
                  <p className="text-muted-foreground">Please fill in your information.</p>
                </div>
                <div className="grid gap-6">{activeSchema.fields.map(renderField)}</div>
              </motion.div>
            )}
            {/* More steps would go here */}
            {currentStep >= 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-black mb-2">You're All Set!</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Your registration has been confirmed. We've sent your entry QR code to your email.
                </p>
                <Button size="lg" className="w-full max-w-xs">
                  Download Ticket
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          {currentStep < 2 ? (
            <Button
              onClick={handleNext}
              className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90 px-8"
            >
              Next Step <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Start New
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
