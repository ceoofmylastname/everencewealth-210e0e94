CREATE OR REPLACE FUNCTION public.create_contracting_notification_from_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.contracting_notifications (agent_id, title, message, notification_type, link)
  VALUES (
    NEW.agent_id,
    CASE NEW.action
      WHEN 'step_completed' THEN 'Step Completed'
      WHEN 'stage_changed' THEN 'Stage Updated'
      WHEN 'document_uploaded' THEN 'Document Uploaded'
      WHEN 'message_sent' THEN 'New Message'
      ELSE 'Activity Update'
    END,
    COALESCE(NEW.description, 'Activity recorded on your contracting profile.'),
    COALESCE(NEW.action, 'message'),
    '/portal/advisor/contracting'
  );
  RETURN NEW;
END;
$$;