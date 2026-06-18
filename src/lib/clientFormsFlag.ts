/**
 * Global kill-switch for client-facing opt-in / lead-capture forms.
 *
 * While `true`, all public lead forms (strategy CTAs, landing lead forms,
 * /opt-in, /response-card, /assessment, etc.) are replaced with a notice
 * telling visitors to use the LeadConnector chat widget instead.
 *
 * Flip back to `false` to restore every form to its previous behavior.
 * No form logic has been deleted — only short-circuited at render time.
 */
export const HIDE_CLIENT_OPT_IN_FORMS = true;