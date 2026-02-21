
-- =============================================
-- Phase 2: Contracting Platform Expansion
-- 3 new tables + RLS + notification trigger
-- =============================================

-- 1. contracting_bundles
CREATE TABLE public.contracting_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  carrier_ids uuid[] NOT NULL DEFAULT '{}',
  product_types text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contracting_bundles ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read bundles
CREATE POLICY "Authenticated users can read bundles"
  ON public.contracting_bundles FOR SELECT TO authenticated
  USING (true);

-- Only admin/contracting can write
CREATE POLICY "Admin/contracting can insert bundles"
  ON public.contracting_bundles FOR INSERT TO authenticated
  WITH CHECK (
    public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "Admin/contracting can update bundles"
  ON public.contracting_bundles FOR UPDATE TO authenticated
  USING (
    public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "Admin/contracting can delete bundles"
  ON public.contracting_bundles FOR DELETE TO authenticated
  USING (
    public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

CREATE TRIGGER update_contracting_bundles_updated_at
  BEFORE UPDATE ON public.contracting_bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. contracting_carrier_selections
CREATE TABLE public.contracting_carrier_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  carrier_id uuid NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
  bundle_id uuid REFERENCES public.contracting_bundles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contracting_carrier_selections ENABLE ROW LEVEL SECURITY;

-- Agents see own
CREATE POLICY "Agents see own carrier selections"
  ON public.contracting_carrier_selections FOR SELECT TO authenticated
  USING (
    agent_id = public.get_contracting_agent_id(auth.uid())
    OR public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
    OR (
      public.get_contracting_role(auth.uid()) = 'manager'
      AND agent_id IN (
        SELECT id FROM public.contracting_agents
        WHERE manager_id = public.get_contracting_agent_id(auth.uid())
      )
    )
  );

CREATE POLICY "Admin/contracting can insert carrier selections"
  ON public.contracting_carrier_selections FOR INSERT TO authenticated
  WITH CHECK (
    public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "Admin/contracting can update carrier selections"
  ON public.contracting_carrier_selections FOR UPDATE TO authenticated
  USING (
    public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "Admin/contracting can delete carrier selections"
  ON public.contracting_carrier_selections FOR DELETE TO authenticated
  USING (
    public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

-- 3. contracting_notifications
CREATE TABLE public.contracting_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.contracting_agents(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text NOT NULL DEFAULT 'message',
  link text,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contracting_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents see own notifications"
  ON public.contracting_notifications FOR SELECT TO authenticated
  USING (
    agent_id = public.get_contracting_agent_id(auth.uid())
    OR public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

CREATE POLICY "System/admin can insert notifications"
  ON public.contracting_notifications FOR INSERT TO authenticated
  WITH CHECK (
    public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
    OR agent_id = public.get_contracting_agent_id(auth.uid())
  );

CREATE POLICY "Users can mark own notifications read"
  ON public.contracting_notifications FOR UPDATE TO authenticated
  USING (
    agent_id = public.get_contracting_agent_id(auth.uid())
    OR public.get_contracting_role(auth.uid()) IN ('admin', 'contracting')
    OR public.is_portal_admin(auth.uid())
  );

-- Notification trigger from activity logs
CREATE OR REPLACE FUNCTION public.create_contracting_notification_from_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.contracting_notifications (agent_id, title, message, notification_type, link)
  VALUES (
    NEW.agent_id,
    CASE NEW.activity_type
      WHEN 'step_completed' THEN 'Step Completed'
      WHEN 'stage_changed' THEN 'Stage Updated'
      WHEN 'document_uploaded' THEN 'Document Uploaded'
      WHEN 'message_sent' THEN 'New Message'
      ELSE 'Activity Update'
    END,
    COALESCE(NEW.description, 'Activity recorded on your contracting profile.'),
    COALESCE(NEW.activity_type, 'message'),
    '/portal/advisor/contracting'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER contracting_activity_notification
  AFTER INSERT ON public.contracting_activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.create_contracting_notification_from_activity();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracting_notifications;
