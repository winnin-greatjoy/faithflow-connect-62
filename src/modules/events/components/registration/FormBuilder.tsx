import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  List,
  CheckSquare,
  FileText,
  Upload,
  PenTool,
  GripVertical,
  Trash2,
  Plus,
  Settings,
} from 'lucide-react';
import { FieldType, FormField, RegistrationFormSchema } from '../../types/registration';
import { toast } from 'sonner';

// --- Field Palette ---
const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Short Text', icon: <Type className="h-4 w-4" /> },
  { type: 'textarea', label: 'Long Text', icon: <FileText className="h-4 w-4" /> },
  { type: 'email', label: 'Email Address', icon: <Mail className="h-4 w-4" /> },
  { type: 'phone', label: 'Phone Number', icon: <Phone className="h-4 w-4" /> },
  { type: 'number', label: 'Number', icon: <Hash className="h-4 w-4" /> },
  { type: 'date', label: 'Date Picker', icon: <Calendar className="h-4 w-4" /> },
  { type: 'select', label: 'Dropdown', icon: <List className="h-4 w-4" /> },
  { type: 'multiselect', label: 'Multi-Select', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'file', label: 'File Upload', icon: <Upload className="h-4 w-4" /> },
  { type: 'signature', label: 'Signature', icon: <PenTool className="h-4 w-4" /> },
];

const DraggableField = ({
  type,
  label,
  icon,
}: {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
}) => {
  // Simplified draggable for now - we'll likely click-to-add for MVP stability
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-3 h-12 border-dashed border-2 hover:border-primary hover:bg-muted/50 cursor-grab active:cursor-grabbing"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

// --- Main Form Builder ---
export const FormBuilder = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      section: 'default',
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
    toast.success(`Added ${type} field`);
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
    toast.error('Field removed');
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Left: Palette */}
      <Card className="w-80 flex flex-col p-4 gap-4 border-r overflow-y-auto">
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Core Fields
          </h3>
          <div className="space-y-3">
            {FIELD_TYPES.slice(0, 6).map((ft) => (
              <div key={ft.type} onClick={() => handleAddField(ft.type)}>
                <DraggableField {...ft} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Advanced
          </h3>
          <div className="space-y-3">
            {FIELD_TYPES.slice(6).map((ft) => (
              <div key={ft.type} onClick={() => handleAddField(ft.type)}>
                <DraggableField {...ft} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Center: Canvas */}
      <div className="flex-1 bg-muted/20 rounded-xl border p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Registration Form</h2>
            <p className="text-muted-foreground">Start adding fields to build your form.</p>
          </div>

          {fields.length === 0 && (
            <div className="h-64 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
              Select a field from the left to begin
            </div>
          )}

          {fields.map((field) => (
            <Card
              key={field.id}
              onClick={() => setSelectedFieldId(field.id)}
              className={`p-4 cursor-pointer transition-all border-2 relative group ${selectedFieldId === field.id ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-200'}`}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex-1 pointer-events-none">
                  <Label className="text-base font-semibold">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    disabled
                    placeholder={field.placeholder || `Enter ${field.label}...`}
                    className="mt-2 bg-muted/50"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteField(field.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Properties */}
      <Card className="w-80 flex flex-col border-l overflow-y-auto">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-bold">Field Properties</h3>
        </div>
        {selectedField ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                value={selectedField.label}
                onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={selectedField.placeholder || ''}
                onChange={(e) =>
                  handleUpdateField(selectedField.id, { placeholder: e.target.value })
                }
              />
            </div>

            {(selectedField.type === 'select' || selectedField.type === 'multiselect') && (
              <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Options</Label>
                <div className="space-y-2">
                  {selectedField.options?.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input className="h-8 text-sm" defaultValue={opt.label} />
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => {
                      const newOpts = [
                        ...(selectedField.options || []),
                        { label: 'New Option', value: 'new' },
                      ];
                      handleUpdateField(selectedField.id, { options: newOpts });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Option
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <Label>Required Field</Label>
              <Switch
                checked={selectedField.required}
                onCheckedChange={(checked) =>
                  handleUpdateField(selectedField.id, { required: checked })
                }
              />
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full text-muted-foreground">
                <Settings className="h-4 w-4 mr-2" /> Advanced Logic
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <Settings className="h-10 w-10 mb-4 opacity-20" />
            <p>Select a field to configure its properties</p>
          </div>
        )}
      </Card>
    </div>
  );
};
