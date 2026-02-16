
-- Portal notifications table
CREATE TABLE public.portal_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON public.portal_notifications FOR SELECT
  TO authenticated
  USING (user_id = public.get_portal_user_id(auth.uid()));

CREATE POLICY "Users update own notifications"
  ON public.portal_notifications FOR UPDATE
  TO authenticated
  USING (user_id = public.get_portal_user_id(auth.uid()));

-- Allow system inserts via service role (edge functions)
CREATE POLICY "Service role can insert notifications"
  ON public.portal_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Portal messages table
CREATE TABLE public.portal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations table (advisor <-> client)
CREATE TABLE public.portal_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(advisor_id, client_id)
);

ALTER TABLE public.portal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_conversations ENABLE ROW LEVEL SECURITY;

-- Conversations: participants can see their own
CREATE POLICY "Participants see conversations"
  ON public.portal_conversations FOR SELECT
  TO authenticated
  USING (
    advisor_id = public.get_portal_user_id(auth.uid())
    OR client_id = public.get_portal_user_id(auth.uid())
  );

CREATE POLICY "Advisors can create conversations"
  ON public.portal_conversations FOR INSERT
  TO authenticated
  WITH CHECK (advisor_id = public.get_portal_user_id(auth.uid()));

-- Messages: participants of the conversation can see
CREATE POLICY "Participants see messages"
  ON public.portal_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portal_conversations c
      WHERE c.id = conversation_id
      AND (c.advisor_id = public.get_portal_user_id(auth.uid()) OR c.client_id = public.get_portal_user_id(auth.uid()))
    )
  );

CREATE POLICY "Participants send messages"
  ON public.portal_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = public.get_portal_user_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.portal_conversations c
      WHERE c.id = conversation_id
      AND (c.advisor_id = public.get_portal_user_id(auth.uid()) OR c.client_id = public.get_portal_user_id(auth.uid()))
    )
  );

CREATE POLICY "Participants update messages read status"
  ON public.portal_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portal_conversations c
      WHERE c.id = conversation_id
      AND (c.advisor_id = public.get_portal_user_id(auth.uid()) OR c.client_id = public.get_portal_user_id(auth.uid()))
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_notifications;

-- Add FK from messages to conversations
ALTER TABLE public.portal_messages
  ADD CONSTRAINT portal_messages_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES public.portal_conversations(id) ON DELETE CASCADE;
