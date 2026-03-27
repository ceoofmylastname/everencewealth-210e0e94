

## Replace SureLC Registration Link

**What's changing**: One link replacement in the contracting flow.

**File**: `src/pages/portal/advisor/contracting/SureLCSetup.tsx` (line 124)

**Current link**:
```
https://accounts.surancebay.com/oauth/authorize?redirect_uri=https:%2F%2Fsurelc.surancebay.com%2Fproducer%2Foauth%3FreturnUrl%3D%252Fprofile%252Fcontact-info%253FgaId%253D1031%2526gaId%253D1031%2526branch%253DAgora%252520Assurance%252520Solutions%2526branchVisible%253Dtrue%2526branchEditable%253Dfalse%2526branchRequired%253Dtrue%2526autoAdd%253Dfalse%2526requestMethod%253DGET&gaId=1031&client_id=surecrmweb&response_type=code&sessionId=ce45a5e2-44f3-47c7-898e-8235eff1096c&trigger_link=z7aLxcldHoywJvFk94z4
```

**New link**:
```
https://surelc.surancebay.com/sbweb/login.jsp?branch=Agora%20Assurance%20Solutions%20Corp&branchEditable=off&branchRequired=on&branchVisible=on&gaId=137&gaName=Southwest%20Annuities%20Marketing%20LLC
```

**Note on old references**: The old email (`contracting@lifecoatimo.com`), phone (`530-635-0793`), and "Life Co IMO" name do not appear anywhere in the current codebase — they've already been removed in prior updates. No additional cleanup needed.

