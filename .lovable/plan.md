

# Fix Resales Online API - IP Whitelisting Required

## Current Status: Code is Correct ✅

Both Edge Functions (`search-properties` and `get-property-details`) are **already correctly configured**:
- Using direct Resales Online V6 API: `https://webapi.resales-online.com/V6/SearchProperties`
- Using `RESA_P1` environment variable for authentication
- Using `P_Agency_FilterId: '1'` (required)
- Using GET method with query parameters (V6 compliant)
- No proxy server references exist

## Root Cause: IP Whitelisting ❌

The API is returning:
```json
{
  "errordescription": {
    "001": "the IP does not match with your API key"
  }
}
```

The Supabase Edge Functions run from AWS infrastructure with dynamic IPs:
- `63.180.200.112`
- `18.192.206.34`
- `63.180.199.30`
- (and others)

These IPs are NOT whitelisted in your Resales Online API key configuration.

## Solution Options

### Option A: Whitelist Supabase IPs (Recommended)

In your Resales Online dashboard, add these IP ranges to your API key:
- Go to API Keys section
- Edit your API key
- Add the Supabase/AWS EU (Frankfurt) IP ranges

Unfortunately, Supabase Edge Functions don't have static IPs. You would need to:
1. Contact Supabase support about static egress IPs (Enterprise feature)
2. Or whitelist the entire AWS EU-Central-1 IP range (not recommended for security)

### Option B: Use a Proxy with Static IP

Since the original proxy (`188.34.164.137`) had a whitelisted IP but is now broken, you could:
1. Deploy a new proxy server with a static IP that you control
2. Whitelist that static IP in Resales Online
3. Update Edge Functions to call your new proxy

### Option C: Request IP Range from Resales Online

Contact Resales Online support and ask if they can:
1. Whitelist the AWS EU-Central-1 IP ranges for your API key
2. Or provide an alternative authentication method

## Immediate Action Required (User Side)

You need to whitelist the Supabase IPs in your Resales Online dashboard:

1. Log into Resales Online
2. Go to **API Settings** → **API Keys**
3. Edit your API key (`d123f6c72f05081edf221e871329704ef16275db`)
4. Add these IPs to the whitelist:
   - `63.180.200.112`
   - `18.192.206.34`
   - `63.180.199.30`
   - `35.159.41.208`
   - `3.73.79.51`

Note: Supabase uses multiple AWS IPs, so you may need to add more as they appear in logs.

## Code Changes: None Required

The Edge Functions are already correctly implemented. No code changes are needed.

| File | Status |
|------|--------|
| `supabase/functions/search-properties/index.ts` | ✅ Correct - Direct V6 API |
| `supabase/functions/get-property-details/index.ts` | ✅ Correct - Direct V6 API |

## Verification After IP Whitelisting

Once you've whitelisted the IPs:
1. Refresh the Property Finder page (`/en/properties`)
2. Check Edge Function logs for `transaction.status: "success"`
3. Properties should display correctly

