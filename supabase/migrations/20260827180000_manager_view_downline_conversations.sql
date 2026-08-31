-- Managers could not see their downline advisors' client conversations,
-- the same gap that hid downline CNAs. portal_conversations and
-- portal_messages had SELECT policies only for the two participants
-- (advisor and client) — no manager path.
--
-- Read-only by design: an observing manager may read a thread but must
-- never post into it or mark it read. Only SELECT policies are added, so
-- the existing participant-only INSERT/UPDATE policies still govern writes.

-- portal_conversations.advisor_id references portal_users(id), so the
-- helper applies directly.
DROP POLICY IF EXISTS manager_select_downline_conversations ON public.portal_conversations;
CREATE POLICY manager_select_downline_conversations
ON public.portal_conversations FOR SELECT
TO authenticated
USING (public.can_manage_portal_advisor(auth.uid(), advisor_id));

-- portal_messages has no advisor_id of its own — it hangs off a
-- conversation — so the check routes through the parent row, mirroring
-- the existing "Participants see messages" policy.
DROP POLICY IF EXISTS manager_select_downline_messages ON public.portal_messages;
CREATE POLICY manager_select_downline_messages
ON public.portal_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.portal_conversations c
    WHERE c.id = conversation_id
      AND public.can_manage_portal_advisor(auth.uid(), c.advisor_id)
  )
);
