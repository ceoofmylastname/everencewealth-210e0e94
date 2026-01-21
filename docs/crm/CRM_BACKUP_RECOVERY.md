# Del Sol Prime Homes CRM - Backup & Recovery Procedures

## Overview

This document outlines backup strategies, data recovery procedures, and disaster recovery plans for the CRM system.

---

## 1. Backup Types

### 1.1 Automatic Backups (Lovable Cloud)

Lovable Cloud (Supabase) provides automatic backups:

| Feature | Details |
|---------|---------|
| Frequency | Daily |
| Retention | 7 days |
| Type | Full database snapshot |
| Location | Managed by Lovable/Supabase |
| Restoration | Via Lovable support |

### 1.2 Manual Data Exports

For additional safety, perform manual exports:

#### Export via Lovable Cloud Backend

1. Open Lovable project
2. Click "Backend" button
3. Navigate to each CRM table:
   - crm_agents
   - crm_leads
   - crm_activities
   - crm_reminders
   - crm_lead_notes
   - crm_notifications
4. Export as CSV or JSON
5. Store in secure location

#### Recommended Export Schedule

| Export | Frequency | Retention |
|--------|-----------|-----------|
| Full data export | Weekly | 4 weeks |
| Lead data only | Daily | 2 weeks |
| Pre-deployment | Before changes | Until verified |

### 1.3 Code Backups

Code is automatically backed up via:
- Lovable version history
- GitHub integration (if connected)

---

## 2. Backup Procedures

### 2.1 Pre-Deployment Backup

Before any major changes:

```
1. Export all CRM tables
2. Save exports with timestamp: crm_backup_YYYYMMDD_HHMM
3. Document current state:
   - Lead count
   - Agent count
   - Recent activity count
4. Save Lovable version number
5. Proceed with deployment
```

### 2.2 Weekly Backup Checklist

| Task | Owner | Completed |
|------|-------|-----------|
| Export crm_leads table | | ☐ |
| Export crm_agents table | | ☐ |
| Export crm_activities table | | ☐ |
| Verify file integrity | | ☐ |
| Store in secure location | | ☐ |
| Delete backups older than 4 weeks | | ☐ |

### 2.3 Backup Storage

Store backups in:
- Secure cloud storage (Google Drive, OneDrive)
- Encrypted if contains PII
- Access limited to authorized personnel
- Off-site from primary system

---

## 3. Recovery Procedures

### 3.1 Code Rollback (Lovable)

If the application has issues after deployment:

1. Open Lovable project
2. Go to version history
3. Find the last working version
4. Click "Restore this version"
5. Verify application works
6. Test critical functions

### 3.2 Database Restore (Lovable Cloud)

For database issues requiring restore:

1. **Contact Lovable Support**
   - Email: support@lovable.dev
   - Describe the issue
   - Request point-in-time restore
   - Specify target time (within 7-day window)

2. **Wait for Confirmation**
   - Support will verify request
   - Confirm restore time
   - Execute restore

3. **Post-Restore Verification**
   - Verify data integrity
   - Check lead counts
   - Test key functions
   - Confirm no data corruption

### 3.3 Manual Data Restore (from Export)

If you need to restore from a manual export:

```sql
-- Example: Restore leads from CSV
-- This requires Lovable Cloud SQL access or support assistance

-- 1. Truncate existing data (CAUTION!)
-- TRUNCATE TABLE crm_leads;

-- 2. Import from CSV
-- Use Lovable backend import feature or support

-- 3. Verify counts match
SELECT COUNT(*) FROM crm_leads;
```

**Note:** Manual restores may require Lovable support assistance.

---

## 4. Data Loss Scenarios

### 4.1 Accidental Deletion

**Scenario:** Single lead or batch of leads accidentally deleted/archived

**Recovery:**
1. Check if data is archived (not deleted)
   - Archived leads can be unarchived
2. If deleted, restore from automatic backup
3. Contact Lovable support for point-in-time restore

**Prevention:**
- Use archive instead of delete
- Add confirmation dialogs
- Limit delete permissions

### 4.2 Corrupted Data

**Scenario:** Data appears corrupted or incorrect

**Detection Signs:**
- Missing fields
- Incorrect values
- Broken relationships
- Unexpected nulls

**Recovery:**
1. Identify scope of corruption
2. Determine when corruption occurred
3. Request point-in-time restore to before corruption
4. Verify restored data
5. Re-apply legitimate changes made after corruption

### 4.3 Agent Account Loss

**Scenario:** Agent cannot access account

**Recovery:**
1. Check if agent is deactivated
2. Verify auth user exists
3. Reset password if needed
4. Restore from backup if account deleted

### 4.4 Activity History Loss

**Scenario:** Activity records are missing

**Impact:** Loss of communication history

**Recovery:**
1. Check database for activities
2. Request restore if deleted
3. Manually reconstruct from email/call logs if needed

---

## 5. Disaster Recovery Plan

### 5.1 Disaster Categories

| Category | Examples | Impact |
|----------|----------|--------|
| Level 1 | Minor data issue | <10 records affected |
| Level 2 | Moderate outage | Feature unavailable <4h |
| Level 3 | Major outage | System down <24h |
| Level 4 | Catastrophic | Complete data loss |

### 5.2 Recovery Time Objectives (RTO)

| Disaster Level | RTO Target |
|----------------|------------|
| Level 1 | 1 hour |
| Level 2 | 4 hours |
| Level 3 | 24 hours |
| Level 4 | 48-72 hours |

### 5.3 Recovery Point Objectives (RPO)

| Backup Type | RPO |
|-------------|-----|
| Automatic (Lovable) | 24 hours |
| Daily manual export | 24 hours |
| Weekly full export | 7 days |

### 5.4 Disaster Recovery Steps

#### Level 1: Minor Data Issue
1. Identify affected records
2. Restore from most recent backup
3. Verify fix
4. Document incident

#### Level 2: Moderate Outage
1. Notify affected users
2. Diagnose issue
3. Rollback code if needed
4. Restore data if needed
5. Test functionality
6. Resume operations
7. Post-incident review

#### Level 3: Major Outage
1. Activate incident response team
2. Communicate to all users
3. Contact Lovable support
4. Execute recovery plan
5. Verify all systems
6. Gradual resumption
7. Full post-mortem

#### Level 4: Catastrophic
1. Emergency team activation
2. All-hands communication
3. Lovable support escalation
4. Use latest available backup
5. Accept potential data loss
6. Manual data reconstruction
7. Full audit and review

---

## 6. Testing Recovery Procedures

### 6.1 Quarterly Recovery Drill

| Task | Status |
|------|--------|
| Schedule maintenance window | ☐ |
| Create test environment | ☐ |
| Export production data | ☐ |
| Perform test restore | ☐ |
| Verify data integrity | ☐ |
| Test critical functions | ☐ |
| Document results | ☐ |
| Identify improvements | ☐ |

### 6.2 Recovery Drill Checklist

1. **Preparation**
   - [ ] Notify team of drill
   - [ ] Ensure recent backup available
   - [ ] Prepare test environment

2. **Execution**
   - [ ] Simulate data loss scenario
   - [ ] Execute recovery procedure
   - [ ] Time the recovery

3. **Verification**
   - [ ] Check all tables restored
   - [ ] Verify record counts
   - [ ] Test lead claiming
   - [ ] Test activity logging
   - [ ] Test calendar functionality

4. **Documentation**
   - [ ] Record recovery time
   - [ ] Note any issues encountered
   - [ ] Update procedures if needed

---

## 7. Contacts

### Internal Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Technical Lead | | | |
| Database Admin | | | |
| On-Call | | | |

### External Contacts

| Service | Contact |
|---------|---------|
| Lovable Support | support@lovable.dev |
| Emergency | [Lovable status page] |

---

## 8. Document Maintenance

### Review Schedule

- [ ] Monthly: Verify backup procedures working
- [ ] Quarterly: Conduct recovery drill
- [ ] Annually: Full disaster recovery review

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-21 | Initial creation |

---

## Appendix: Quick Reference

### Immediate Actions for Data Loss

```
1. STOP - Don't make changes that could worsen the situation
2. DOCUMENT - Note what happened, when, what's affected
3. CONTACT - Reach out to technical lead
4. ASSESS - Determine scope and severity
5. RECOVER - Follow appropriate recovery procedure
6. VERIFY - Confirm data is restored correctly
7. REVIEW - Post-incident analysis
```

### Backup Commands (Reference)

```bash
# These are conceptual - actual implementation via Lovable backend

# Export table to CSV
# Access via Lovable Backend > Table > Export

# Restore from backup
# Contact Lovable support for point-in-time restore

# Verify backup integrity
# Download backup, check record counts, spot-check data
```

---

*Last Updated: January 2026*
