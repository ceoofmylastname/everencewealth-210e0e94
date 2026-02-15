

## Remove Unused Secrets

Delete the following 7 secrets from the project:

1. GOOGLE_CLIENT_SECRET
2. RESA_P2
3. RESA_P1
4. RESALES_ONLINE_API_KEY
5. GOOGLE_CLIENT_ID
6. APP_URL
7. INDEXNOW_API_KEY

### Remaining secrets after cleanup
- ANTHROPIC_API_KEY
- GEMINI_API_KEY
- LOVABLE_API_KEY (managed, cannot be deleted)
- OPENAI_API_KEY
- PERPLEXITY_API_KEY
- RESEND_API_KEY

### Note
Before removing these, I will verify no edge functions currently reference them. If any do, those references will need to be cleaned up as well.

