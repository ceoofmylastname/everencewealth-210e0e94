# Del Sol Prime Homes CRM - Security Checklist

## Overview

Comprehensive security checklist for the CRM system covering database, authentication, API, and application security.

---

## 1. Database Security

### 1.1 Row Level Security (RLS)

| Table | RLS Enabled | Policies Tested | Status |
|-------|-------------|-----------------|--------|
| crm_agents | ☐ | ☐ | |
| crm_leads | ☐ | ☐ | |
| crm_activities | ☐ | ☐ | |
| crm_reminders | ☐ | ☐ | |
| crm_lead_notes | ☐ | ☐ | |
| crm_notifications | ☐ | ☐ | |

### 1.2 RLS Policy Verification

#### crm_agents
- [ ] SELECT: Agents see only own record OR admin sees all
- [ ] UPDATE: Agents update only own record OR admin updates any
- [ ] INSERT: Only via create-crm-agent function (service role)
- [ ] DELETE: Only via delete-crm-agent function (service role)

#### crm_leads
- [ ] SELECT: Agents see assigned leads OR unclaimed+language match
- [ ] UPDATE: Agents update only assigned leads
- [ ] INSERT: Only via register-crm-lead function (service role)
- [ ] DELETE: Disabled (archive instead)

#### crm_activities
- [ ] SELECT: Agents see own activities OR admin sees all
- [ ] INSERT: Agents insert for assigned leads only
- [ ] UPDATE: Limited to own activities
- [ ] DELETE: Disabled (immutable audit trail)

#### crm_reminders
- [ ] SELECT: Agents see own reminders only
- [ ] INSERT: Agents create for assigned leads
- [ ] UPDATE: Agents update own reminders
- [ ] DELETE: Agents delete own reminders

#### crm_notifications
- [ ] SELECT: Agents see own notifications only
- [ ] UPDATE: Agents mark own as read
- [ ] DELETE: Agents delete own notifications

### 1.3 Database Functions Security

| Function | SECURITY DEFINER? | SET search_path? | Status |
|----------|-------------------|------------------|--------|
| claim_lead | Yes (required) | SET search_path = public | ☐ |
| notify_lead_claimed | Yes | SET search_path = public | ☐ |
| is_crm_agent | No | SET search_path = public | ☐ |
| can_access_lead | No | SET search_path = public | ☐ |

### 1.4 Known Linter Issues to Address

| Issue | Severity | Resolution |
|-------|----------|------------|
| Security Definer Views | ERROR | Review and change to INVOKER if possible |
| Function Search Path Mutable | WARN | Add SET search_path = 'public' |
| Extension in Public | WARN | Move to separate schema if possible |
| RLS Policy Always True | WARN | Review INSERT policies, add conditions |

---

## 2. Authentication Security

### 2.1 Password Requirements

- [ ] Minimum 8 characters enforced
- [ ] Mixed case recommended
- [ ] Special characters recommended
- [ ] No common passwords allowed
- [ ] Password hashing handled by Supabase (bcrypt)

### 2.2 Session Management

- [ ] Session expiry configured (24 hours default)
- [ ] Secure cookie settings
- [ ] HttpOnly cookies
- [ ] SameSite=Strict or Lax
- [ ] Token refresh working

### 2.3 Login Security

- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts (if configured)
- [ ] Brute force protection
- [ ] Login audit logging
- [ ] Inactive account blocking

### 2.4 Multi-Factor Authentication

- [ ] MFA available (Supabase feature)
- [ ] MFA encouraged for admin accounts
- [ ] Recovery codes documented

---

## 3. API Security

### 3.1 API Key Management

| Key Type | Usage | Exposure Risk |
|----------|-------|---------------|
| anon key | Client-side, authenticated requests | Public (okay) |
| service_role key | Edge functions only | NEVER expose |

- [ ] anon key used in client code
- [ ] service_role key only in edge functions
- [ ] No keys committed to git
- [ ] Keys in environment variables only

### 3.2 Edge Function Security

| Function | Auth Required | Input Validation | Rate Limited |
|----------|---------------|------------------|--------------|
| register-crm-lead | No (webhook) | Yes | Consider |
| claim-lead | Yes | Yes | Yes |
| send-lead-notification | Internal | N/A | N/A |
| create-crm-agent | Admin only | Yes | Yes |
| delete-crm-agent | Admin only | Yes | Yes |

- [ ] All inputs validated before processing
- [ ] SQL injection prevented (parameterized queries)
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include secrets

### 3.3 CORS Configuration

- [ ] CORS headers set appropriately
- [ ] Allowed origins restricted in production
- [ ] Credentials handled properly

---

## 4. Application Security

### 4.1 Input Validation

| Input Type | Validation | Status |
|------------|------------|--------|
| Email | Valid format | ☐ |
| Phone | Valid format, E.164 | ☐ |
| Names | Sanitized, length limit | ☐ |
| Notes | Sanitized, XSS prevention | ☐ |
| URLs | Valid format, allowed domains | ☐ |

### 4.2 XSS Prevention

- [ ] React escapes output by default
- [ ] dangerouslySetInnerHTML avoided or sanitized
- [ ] User input never used as raw HTML
- [ ] CSP headers configured

### 4.3 CSRF Protection

- [ ] Supabase handles via JWT
- [ ] State-changing requests require auth
- [ ] No GET requests with side effects

### 4.4 Clickjacking Protection

- [ ] X-Frame-Options header set
- [ ] CSP frame-ancestors configured

---

## 5. Data Protection

### 5.1 Sensitive Data Handling

| Data Type | Classification | Protection |
|-----------|----------------|------------|
| Email addresses | PII | RLS, encryption at rest |
| Phone numbers | PII | RLS, encryption at rest |
| Names | PII | RLS, encryption at rest |
| Passwords | Sensitive | Hashed (bcrypt), never stored plain |
| Conversation data | PII | RLS, encryption at rest |

### 5.2 Encryption

- [ ] Encryption at rest (Supabase default)
- [ ] Encryption in transit (HTTPS enforced)
- [ ] TLS 1.2+ for all connections
- [ ] Database connections use SSL

### 5.3 Data Retention

- [ ] Data retention policy defined
- [ ] Archived leads handled appropriately
- [ ] Audit logs retained per policy
- [ ] GDPR compliance considered

### 5.4 Data Access Logging

- [ ] Database queries logged (Supabase)
- [ ] API access logged
- [ ] Admin actions audited
- [ ] Failed login attempts logged

---

## 6. GDPR Compliance

### 6.1 Data Subject Rights

- [ ] Right to access (export data)
- [ ] Right to rectification (edit data)
- [ ] Right to erasure (delete data)
- [ ] Right to portability (export formats)

### 6.2 Consent

- [ ] Consent obtained before collecting data
- [ ] Consent documented
- [ ] Easy consent withdrawal

### 6.3 Data Processing

- [ ] Lawful basis identified
- [ ] Data minimization practiced
- [ ] Purpose limitation followed
- [ ] Storage limitation defined

---

## 7. Third-Party Security

### 7.1 Resend (Email)

- [ ] API key secured in secrets
- [ ] From address verified
- [ ] SPF/DKIM configured
- [ ] No PII in email logs

### 7.2 Slack (Optional)

- [ ] Bot token secured in secrets
- [ ] Minimal permissions requested
- [ ] Channel IDs validated

### 7.3 Dependencies

- [ ] NPM audit run regularly
- [ ] No known vulnerabilities
- [ ] Dependencies up to date
- [ ] Lock file committed

---

## 8. Infrastructure Security

### 8.1 Lovable Cloud

- [ ] Project access restricted to team
- [ ] No public database exposure
- [ ] Edge functions protected
- [ ] Secrets management used

### 8.2 Network Security

- [ ] HTTPS enforced everywhere
- [ ] HSTS enabled
- [ ] No mixed content
- [ ] Secure WebSocket connections

### 8.3 Monitoring

- [ ] Error logging enabled
- [ ] Suspicious activity alerts
- [ ] Failed auth attempts monitored
- [ ] Rate limiting alerts

---

## 9. Incident Response

### 9.1 Detection

- [ ] Monitoring for anomalies
- [ ] Alerts for suspicious activity
- [ ] Regular log review

### 9.2 Response Plan

1. **Identify** - Determine scope of incident
2. **Contain** - Limit damage, revoke tokens if needed
3. **Eradicate** - Remove threat
4. **Recover** - Restore normal operations
5. **Learn** - Post-incident review

### 9.3 Communication

- [ ] Incident response contacts defined
- [ ] Escalation path documented
- [ ] User notification plan (if data breach)

---

## 10. Security Testing

### 10.1 Pre-Launch Testing

- [ ] RLS policy testing (all tables)
- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts
- [ ] Input validation testing
- [ ] SQL injection testing
- [ ] XSS testing

### 10.2 Ongoing Testing

- [ ] Quarterly security review
- [ ] Dependency vulnerability scanning
- [ ] Access control audits
- [ ] Penetration testing (if budget allows)

---

## 11. Security Configuration Checklist

### Required Actions

- [ ] All RLS policies enabled and tested
- [ ] Service role key secured (edge functions only)
- [ ] All edge functions validate inputs
- [ ] Error messages sanitized
- [ ] Logging configured (no secrets)
- [ ] HTTPS enforced
- [ ] Dependencies audited

### Recommended Actions

- [ ] Enable MFA for admin accounts
- [ ] Set up security alerts
- [ ] Regular access reviews
- [ ] Security training for team
- [ ] Incident response drill

---

## Sign-Off

| Section | Reviewed By | Date | Status |
|---------|-------------|------|--------|
| Database Security | | | ☐ |
| Authentication | | | ☐ |
| API Security | | | ☐ |
| Application Security | | | ☐ |
| Data Protection | | | ☐ |
| GDPR Compliance | | | ☐ |
| Third-Party Security | | | ☐ |
| Infrastructure | | | ☐ |

**Security Approval:** _________________ Date: _________
