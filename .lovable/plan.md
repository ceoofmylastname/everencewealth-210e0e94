
# Fix Resales Online API Integration

## Problem Analysis

The Edge Functions are failing with 400 errors because of **three critical issues**:

1. **Wrong HTTP Method**: Currently using `POST` with JSON body, but the API requires `GET` with URL query parameters
2. **Missing Required Parameter**: `P_Agency_FilterId` (or `P_ApiId`) is mandatory but not included
3. **Credentials Need Update**: Your new API key needs to be set

## Solution

### Step 1: Update API Credentials

Update the following secrets with your new credentials:
- `RESA_P1` → `d123f6c72f05081edf221e871329704ef16275db`
- `RESALES_ONLINE_API_KEY` → `d123f6c72f05081edf221e871329704ef16275db` (to match)
- Verify `RESA_P2` contains your API password

### Step 2: Fix API Request Format

Modify `supabase/functions/search-properties/index.ts`:

**Change from:**
```javascript
const response = await fetch(RESALES_API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(apiParams),
});
```

**Change to:**
```javascript
const queryString = new URLSearchParams(apiParams).toString();
const response = await fetch(`${RESALES_API_URL}?${queryString}`, {
  method: 'GET',
});
```

### Step 3: Add Required Filter Parameter

Add `P_Agency_FilterId=1` to all requests (uses the default "Sale" filter):
```javascript
const baseParams = {
  p1: p1Candidate.value,
  p2: RESA_P2,
  P_Agency_FilterId: 1,  // Required - uses default Sale filter
  P_Lang: langNum,
  P_PageSize: limit,
  P_PageNo: page,
  P_sandbox: 'true',
};
```

### Step 4: Apply Same Fix to get-property-details

Update `supabase/functions/get-property-details/index.ts` with the same GET request format and `P_Agency_FilterId` parameter.

---

## Technical Details

### API Documentation Reference

From the docs you provided:
```text
Base URL: https://webapi.resales-online.com/{Version}/{Function}
The additional Parameters must be sent by GET.

Required Parameters:
- p1: Agent's unique identifier (API Key)
- p2: Agent's unique password  
- P_Agency_FilterId: Filter ID (1=Sale, 2=Long Term Rent, etc.)
```

### Expected Working Request

```bash
curl --location 'https://webapi.resales-online.com/V6/SearchProperties?p_agency_filterid=1&p1=d123f6c72f05081edf221e871329704ef16275db&p2=YOUR_PASSWORD&P_sandbox=true'
```

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/search-properties/index.ts` | Switch to GET + add P_Agency_FilterId |
| `supabase/functions/get-property-details/index.ts` | Switch to GET + add P_Agency_FilterId |

### Verification

After implementation:
1. Deploy Edge Functions
2. Test search on `/en/properties`
3. Check logs for successful API responses
4. Verify properties display correctly
