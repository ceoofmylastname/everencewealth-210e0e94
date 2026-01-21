# Del Sol Prime Homes CRM - Support Procedures

## Overview

This guide outlines support channels, common issues, and escalation procedures for the CRM system.

---

## 1. Support Channels

### 1.1 Tier 1: Self-Service

**Resources Available:**
- Agent User Guide (`CRM_AGENT_GUIDE.md`)
- Admin User Guide (`CRM_ADMIN_GUIDE.md`)
- FAQ (below)
- In-app help tooltips

**Use When:**
- Basic "how do I...?" questions
- Feature explanations
- Process clarification

### 1.2 Tier 2: Team Lead Support

**Channel:** Direct message or team meeting

**Response Time:** <2 hours during business hours

**Use When:**
- Process questions
- Workflow clarification
- Agent-to-agent issues
- Training needs

### 1.3 Tier 3: Technical Support

**Channel:** Email or support ticket

**Response Time:** 
- P1/P2: <1 hour
- P3/P4: <24 hours

**Use When:**
- System bugs
- Data issues
- Feature not working
- Performance problems

---

## 2. Frequently Asked Questions

### Login & Access

**Q: I can't log in. What should I do?**
A: 
1. Verify your email is spelled correctly
2. Try "Forgot Password" to reset
3. Clear browser cache and try again
4. Try incognito/private mode
5. Contact admin if still failing

**Q: I'm logged in but see "Access Denied"**
A: Your account may be deactivated. Contact your admin to verify your account status.

**Q: How do I change my password?**
A: Use the "Forgot Password" link on the login page, or contact admin for a password reset.

### Lead Management

**Q: Why can't I see any leads to claim?**
A: Check these possibilities:
1. No unclaimed leads matching your languages
2. You may be at maximum capacity
3. Your "Accepts New Leads" setting may be off
4. Ask admin to verify your settings

**Q: I clicked claim but it didn't work**
A: The lead was likely claimed by another agent first (race condition). The system ensures only one agent can claim each lead.

**Q: A lead doesn't match my language - why was it assigned to me?**
A: This was likely a manual admin assignment. Check with your admin for the reason.

**Q: How do I transfer a lead to another agent?**
A: Only admins can reassign leads. Contact your admin with the lead ID and reason.

### Activity Logging

**Q: I logged a call but it's not showing**
A: 
1. Refresh the page
2. Check if you received a success message
3. Wait a few seconds for real-time update
4. If still missing, try logging again

**Q: Can I edit an activity after saving?**
A: Activities are designed to be immutable for audit purposes. Add a new note with corrections if needed.

**Q: The call timer isn't working**
A: Try:
1. Refresh the page
2. Use manual duration entry as backup
3. Report the bug with browser/device details

### Calendar & Reminders

**Q: My reminder didn't notify me**
A:
1. Check if reminder time was set correctly
2. Verify email notifications are enabled
3. Check spam folder for email
4. Ensure browser notifications allowed

**Q: I completed a callback but it still shows as pending**
A: Click the "Complete" button on the reminder. Logging the call doesn't auto-complete reminders.

**Q: Can I create a reminder for another agent?**
A: No, reminders are personal. Ask the other agent to create their own reminder.

### Notifications

**Q: I'm not receiving email notifications**
A:
1. Check spam/junk folder
2. Verify your email address is correct in your profile
3. Ensure email notifications are enabled
4. Contact admin to verify system is working

**Q: The notification bell shows wrong count**
A: Refresh the page. If persistent, report as a bug.

### Admin-Specific

**Q: I can't access admin pages**
A: Verify with the technical team that your role is set to "admin" in the database.

**Q: Bulk assignment is failing**
A: Check if:
1. Agent has capacity for all selected leads
2. No network issues
3. Try smaller batches

---

## 3. Common Issues & Solutions

### 3.1 Performance Issues

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| Page loads slowly | Large dataset | Refresh, use filters |
| UI is unresponsive | Browser memory | Close other tabs, refresh |
| Actions take long | Network issues | Check internet, retry |

### 3.2 Data Issues

| Issue | Solution |
|-------|----------|
| Missing lead data | Refresh page, check filters |
| Wrong lead count | Clear filters, refresh |
| Activity not saved | Retry, check network |
| Reminder not appearing | Verify date/time, refresh calendar |

### 3.3 Notification Issues

| Issue | Solution |
|-------|----------|
| No email notifications | Check spam, verify email settings |
| No in-app notifications | Refresh page, check bell icon |
| Delayed notifications | Wait 1-2 minutes, refresh |

---

## 4. Bug Reporting

### How to Report a Bug

1. **Gather Information:**
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Steps to reproduce
   - Screenshots (if helpful)
   - Browser and device info

2. **Submit Report:**
   - Email to technical support
   - Include all gathered information

### Bug Report Template

```
**Summary:** [One-line description]

**Steps to Reproduce:**
1. Go to [page]
2. Click [button]
3. Enter [data]
4. See [error]

**Expected Result:**
[What should have happened]

**Actual Result:**
[What happened instead]

**Screenshots:**
[Attach if helpful]

**Browser/Device:**
[e.g., Chrome 120 on Windows 11, iPhone 15]

**Time of Occurrence:**
[Date and time]

**Additional Context:**
[Any other relevant information]
```

---

## 5. Escalation Procedures

### Priority Levels

| Priority | Definition | Examples | Response Target |
|----------|------------|----------|-----------------|
| P1 - Critical | System down, work blocked | Cannot log in, cannot claim | <15 minutes |
| P2 - High | Feature broken, workaround exists | Notifications failing | <1 hour |
| P3 - Medium | Issue with workaround | Minor UI bug | <4 hours |
| P4 - Low | Cosmetic, enhancement | Typo, suggestion | <24 hours |

### Escalation Path

```
Tier 1 (Self-Service)
    ↓
Tier 2 (Team Lead)
    ↓
Tier 3 (Technical Support)
    ↓
Engineering Lead
    ↓
Lovable Support (platform issues)
```

### When to Escalate

**Escalate to Technical Support if:**
- Self-service resources don't help
- Issue affects multiple users
- Data appears corrupted
- System performance degraded
- Security concern

**Escalate to Engineering Lead if:**
- P1 issue not resolved in 15 minutes
- P2 issue not resolved in 1 hour
- Issue requires code changes

---

## 6. Support Hours

### Standard Support

| Day | Hours (Europe/Madrid) |
|-----|----------------------|
| Monday - Friday | 9:00 AM - 6:00 PM |
| Saturday - Sunday | Emergency only |

### Emergency Support

For P1 issues outside business hours:
1. Send email to on-call address
2. Include "URGENT" in subject
3. Describe the issue briefly
4. Include contact phone number

---

## 7. Known Issues & Workarounds

### Current Known Issues

| Issue | Workaround | Status |
|-------|------------|--------|
| [None currently] | | |

### Recently Fixed

| Issue | Fixed Date | Notes |
|-------|------------|-------|
| [None] | | |

---

## 8. Feature Requests

### How to Submit

1. Email to technical team
2. Subject: "Feature Request: [Brief Title]"
3. Include:
   - Description of desired feature
   - Use case / problem it solves
   - Priority (nice-to-have vs essential)
   - Any mockups/examples

### Review Process

1. Request logged in backlog
2. Reviewed in weekly planning
3. Prioritized against other work
4. Scheduled if approved
5. Requester notified of decision

---

## 9. Training Resources

### New Agent Onboarding

1. Read Agent User Guide
2. Watch training video (if available)
3. Shadow experienced agent
4. Practice in test environment
5. First week: buddy system

### Ongoing Training

- Monthly tips email
- New feature announcements
- Best practices sharing

---

## 10. Feedback

### How to Give Feedback

- Direct to team lead
- Email to support
- Anonymous feedback form (if available)

### What We Want to Hear

- What's working well
- What's frustrating
- Feature ideas
- Process improvements
- Training needs

---

## Contact Directory

| Role | Contact Method |
|------|----------------|
| Team Lead | [Direct] |
| Technical Support | [Email] |
| Admin | [Email] |
| On-Call Emergency | [Phone] |

---

## Document Maintenance

- Review: Monthly
- Update: As issues/solutions arise
- Owner: Support Lead

---

*Last Updated: January 2026*
