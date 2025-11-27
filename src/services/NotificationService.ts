import { supabase } from '@/integrations/supabase/client';

export interface NotificationRequest {
  recipientIds: string[];
  templateId?: string;
  subject?: string;
  message?: string;
  type: 'email' | 'sms';
  variables?: Record<string, any>;
}

export const NotificationService = {
  async sendNotification(request: NotificationRequest) {
    try {
      const { recipientIds, templateId, subject, message, type, variables } = request;

      // If templateId is provided, fetch the template first
      let finalSubject = subject;
      let finalMessage = message;

      if (templateId) {
        const { data: template, error: templateError } = await supabase
          .from('message_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (templateError) throw templateError;

        finalSubject = template.subject;
        finalMessage = template.body;

        // Replace variables in subject and message
        if (variables) {
          Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            if (finalSubject) finalSubject = finalSubject.replace(regex, String(value));
            if (finalMessage) finalMessage = finalMessage.replace(regex, String(value));
          });
        }
      }

      if (!finalMessage) {
        throw new Error('Message content is required');
      }

      // Create notification logs for each recipient
      const logs = recipientIds.map((recipientId) => ({
        type,
        recipient_id: recipientId,
        template_id: templateId,
        subject: finalSubject,
        message: finalMessage,
        status: 'pending',
      }));

      const { error: insertError } = await supabase.from('notification_logs').insert(logs);

      if (insertError) throw insertError;

      // In a real production app, you might trigger an Edge Function here to send immediately
      // or rely on a background worker processing the 'pending' logs.
      // For this implementation, we'll assume the logs are sufficient to trigger the sending process (e.g. via database triggers or external worker).

      return { success: true, count: logs.length };
    } catch (error) {
      console.error('NotificationService Error:', error);
      throw error;
    }
  },

  async getTemplates(category?: string) {
    let query = supabase.from('message_templates').select('*').order('name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};
