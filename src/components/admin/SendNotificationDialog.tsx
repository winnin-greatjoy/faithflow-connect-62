import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Mail, MessageSquare } from 'lucide-react';
import { NotificationService } from '@/services/NotificationService';

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientIds: string[];
  recipientCount: number;
  onSuccess?: () => void;
}

export const SendNotificationDialog: React.FC<SendNotificationDialogProps> = ({
  open,
  onOpenChange,
  recipientIds,
  recipientCount,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
      setSubject('');
      setMessage('');
      setSelectedTemplate('none');
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      const data = await NotificationService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === 'none') {
      setSubject('');
      setMessage('');
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject || '');
      setMessage(template.body || '');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Message content is required',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'email' && !subject.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Subject is required for emails',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);

      await NotificationService.sendNotification({
        recipientIds,
        type: activeTab,
        templateId: selectedTemplate !== 'none' ? selectedTemplate : undefined,
        subject: activeTab === 'email' ? subject : undefined,
        message,
        // In a real scenario, you'd prompt for variable values if the template has them
        variables: {},
      });

      toast({
        title: 'Message Sent',
        description: `Successfully queued ${activeTab} for ${recipientCount} recipients.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>Sending to {recipientCount} selected recipients</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'sms')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" /> Email
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="h-4 w-4 mr-2" /> SMS
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  {templates
                    .filter((t) => (activeTab === 'sms' ? !t.subject : true)) // Filter out email-only templates for SMS if needed, though category check is better
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {activeTab === 'email' && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={6}
              />
            </div>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Send className="h-4 w-4 mr-2" />
            Send {activeTab === 'email' ? 'Email' : 'SMS'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
