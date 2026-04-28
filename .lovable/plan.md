## Replace SureLC "Create Your Profile" Link

### Change
In `src/pages/portal/advisor/contracting/SureLCSetup.tsx` (line 124), replace the `surelc_register` `url` value:

**From:**
```
https://surelc.surancebay.com/sbweb/login.jsp?branch=Agora%20Assurance%20Solutions%20Corp&branchEditable=off&branchRequired=on&branchVisible=on&gaId=137&gaName=Southwest%20Annuities%20Marketing%20LLC
```

**To:**
```
https://accounts.surancebay.com/oauth/authorize?redirect_uri=https:%2F%2Fsurelc.surancebay.com%2Fproducer%2Foauth%3FreturnUrl%3D%252Fprofile%252Fcontact-info%253FgaId%253D152%2526gaId%253D152%2526phone%253D7076857014%2526branch%253DEverence%252520Wealth%252520LLC%2526branchVisible%253Dtrue%2526branchEditable%253Dfalse%2526branchRequired%253Dtrue%2526dba%253DB%2526autoAdd%253Dfalse%2526requestMethod%253DGET&gaId=152&client_id=surecrmweb&response_type=code
```

### Memory update
Update `mem://portal/contracting/surelc-integration` to reflect:
- New base: `accounts.surancebay.com/oauth/authorize` (OAuth flow, `client_id=surecrmweb`)
- New `gaId=152`
- New branch: `Everence Wealth LLC` (replaces `Agora Assurance Solutions Corp`)

### Out of scope
No DB changes, no other files. Button label, videos, and screenshot upload step remain unchanged.
