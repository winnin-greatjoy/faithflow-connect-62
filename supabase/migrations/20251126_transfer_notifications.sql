-- Seed default templates for member transfers
INSERT INTO public.message_templates (name, category, subject, body, variables)
VALUES 
(
  'Transfer Approved', 
  'transfer', 
  'Your Transfer Request has been Approved', 
  'Dear {{member_name}}, your transfer to {{to_branch_name}} has been approved. You can now access resources and events for your new branch.', 
  '["member_name", "to_branch_name"]'::jsonb
),
(
  'Transfer Rejected', 
  'transfer', 
  'Update on your Transfer Request', 
  'Dear {{member_name}}, your transfer request to {{to_branch_name}} has been declined. Reason: {{rejection_reason}}.', 
  '["member_name", "to_branch_name", "rejection_reason"]'::jsonb
);

-- Function to handle transfer notifications
CREATE OR REPLACE FUNCTION public.handle_transfer_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_member_id UUID;
  v_member_name TEXT;
  v_to_branch_name TEXT;
  v_template_id UUID;
  v_subject TEXT;
  v_body TEXT;
BEGIN
  -- Only proceed if status changed to approved or rejected
  IF (NEW.status = OLD.status) OR (NEW.status NOT IN ('approved', 'rejected')) THEN
    RETURN NEW;
  END IF;

  -- Get member details
  SELECT full_name INTO v_member_name FROM public.members WHERE id = NEW.member_id;
  
  -- Get branch details
  SELECT name INTO v_to_branch_name FROM public.church_branches WHERE id = NEW.to_branch_id;

  -- Get appropriate template
  IF NEW.status = 'approved' THEN
    SELECT id, subject, body INTO v_template_id, v_subject, v_body 
    FROM public.message_templates 
    WHERE category = 'transfer' AND name = 'Transfer Approved' 
    LIMIT 1;
  ELSIF NEW.status = 'rejected' THEN
    SELECT id, subject, body INTO v_template_id, v_subject, v_body 
    FROM public.message_templates 
    WHERE category = 'transfer' AND name = 'Transfer Rejected' 
    LIMIT 1;
  END IF;

  -- If template found, create notification log
  IF v_template_id IS NOT NULL THEN
    -- Replace variables in body (simple replacement)
    v_body := replace(v_body, '{{member_name}}', v_member_name);
    v_body := replace(v_body, '{{to_branch_name}}', v_to_branch_name);
    
    IF NEW.status = 'rejected' THEN
      v_body := replace(v_body, '{{rejection_reason}}', COALESCE(NEW.reason, 'No reason provided'));
    END IF;

    INSERT INTO public.notification_logs (
      type,
      recipient_id,
      template_id,
      subject,
      message,
      status
    ) VALUES (
      'email', -- Default to email for now
      NEW.member_id,
      v_template_id,
      v_subject,
      v_body,
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_transfer_status_change ON public.member_transfers;
CREATE TRIGGER on_transfer_status_change
  AFTER UPDATE ON public.member_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transfer_notification();
