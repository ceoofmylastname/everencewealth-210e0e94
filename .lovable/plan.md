
# Update Steven Roberts' Specializations

## Summary
Change Steven Roberts' specializations from the current value to "New Developments and International Buyers" in the database.

---

## Current State

| Field | Current Value |
|-------|---------------|
| Specializations | `["Marbella Golden Mile", "Beachfront Properties"]` |

## Updated State

| Field | New Value |
|-------|-----------|
| Specializations | `["New Developments", "International Buyers"]` |

---

## Database Change

**Table:** `team_members`

**SQL Update:**
```sql
UPDATE team_members 
SET specializations = ARRAY['New Developments', 'International Buyers']
WHERE name = 'Steven Roberts';
```

---

## Result

After this update, Steven Roberts' profile will display:
- **Specializations:** New Developments, International Buyers

This change will be reflected across all languages since the specializations are stored as base values in the database and displayed consistently on the Team page and Team Member Modal.
