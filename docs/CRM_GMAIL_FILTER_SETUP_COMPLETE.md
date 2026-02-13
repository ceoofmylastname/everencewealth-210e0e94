# 📧 CRM Gmail Filter Setup Guide

> **Last updated:** 2026-02-13
> **Sender:** `crm@notifications.delsolprimehomes.com`
> **Labels required:** 6 (already created)

---

## 📋 Filter Overview

| # | Gmail Label | Catches | Priority |
|---|------------|---------|----------|
| 1 | CRM/Urgent | T+0 new leads | 🔴 CRITICAL |
| 2 | CRM/Reminders/10-Min | T+1 and T+2 reminders | 🟡 HIGH |
| 3 | CRM/Reminders/1-Hour | T+3 urgent reminders | 🟠 URGENT |
| 4 | CRM/Admin/Stage-1-Breach | T+4 final warnings | 🔴 CRITICAL |
| 5 | CRM/Admin/Stage-2-Breach | T+5 admin escalations | 🔴 ADMIN |
| 6 | CRM/Admin/Form-Submissions | Website form entries | 🟢 INFO |

---

## FILTER 1: CRM/Urgent (T+0 — NEW LEADS)

**What it catches:** Brand new leads requiring immediate response.

**Gmail search query:**
```
subject:(CRM_NEW_LEAD_EN | CRM_NEW_LEAD_NL | CRM_NEW_LEAD_FR | CRM_NEW_LEAD_FI | CRM_NEW_LEAD_PL | CRM_NEW_LEAD_DE | CRM_NEW_LEAD_ES | CRM_NEW_LEAD_SV | CRM_NEW_LEAD_DA | CRM_NEW_LEAD_HU | CRM_NEW_LEAD_NO) -subject:T1 -subject:T2 -subject:T3 -subject:T4
```

**Filter actions:**
- ☑️ Apply label: **CRM/Urgent**
- ☑️ Mark as important
- ☑️ Star the message
- ☑️ Never send to spam

**📱 Mobile notification:** Loudest/most urgent ringtone

**Example subjects:**
- `CRM_NEW_LEAD_FI | New Finnish lead – call immediately`
- `CRM_NEW_LEAD_EN | New English lead – call immediately`
- `CRM_NEW_LEAD_NL | New Dutch lead – call immediately`

---

## FILTER 2: CRM/Reminders/10-Min (T+1 and T+2 — EARLY REMINDERS)

**What it catches:** First two reminder emails if lead wasn't claimed.

**Gmail search query:**
```
subject:(CRM_NEW_LEAD_EN_T1 | CRM_NEW_LEAD_NL_T1 | CRM_NEW_LEAD_FR_T1 | CRM_NEW_LEAD_FI_T1 | CRM_NEW_LEAD_PL_T1 | CRM_NEW_LEAD_DE_T1 | CRM_NEW_LEAD_ES_T1 | CRM_NEW_LEAD_SV_T1 | CRM_NEW_LEAD_DA_T1 | CRM_NEW_LEAD_HU_T1 | CRM_NEW_LEAD_NO_T1 | CRM_NEW_LEAD_EN_T2 | CRM_NEW_LEAD_NL_T2 | CRM_NEW_LEAD_FR_T2 | CRM_NEW_LEAD_FI_T2 | CRM_NEW_LEAD_PL_T2 | CRM_NEW_LEAD_DE_T2 | CRM_NEW_LEAD_ES_T2 | CRM_NEW_LEAD_SV_T2 | CRM_NEW_LEAD_DA_T2 | CRM_NEW_LEAD_HU_T2 | CRM_NEW_LEAD_NO_T2)
```

**Filter actions:**
- ☑️ Apply label: **CRM/Reminders/10-Min**
- ☑️ Mark as important
- ☑️ Never send to spam

**📱 Mobile notification:** Moderate alert ringtone

**Example subjects:**
- `CRM_NEW_LEAD_FI_T1 | Reminder 1 – lead not claimed (1 min)`
- `CRM_NEW_LEAD_FI_T2 | Reminder 2 – SLA running (2 min)`
- `CRM_NEW_LEAD_EN_T1 | Reminder 1 – lead not claimed (1 min)`

---

## FILTER 3: CRM/Reminders/1-Hour (T+3 — URGENT REMINDER)

**What it catches:** Third reminder — getting urgent.

**Gmail search query:**
```
subject:(CRM_NEW_LEAD_EN_T3 | CRM_NEW_LEAD_NL_T3 | CRM_NEW_LEAD_FR_T3 | CRM_NEW_LEAD_FI_T3 | CRM_NEW_LEAD_PL_T3 | CRM_NEW_LEAD_DE_T3 | CRM_NEW_LEAD_ES_T3 | CRM_NEW_LEAD_SV_T3 | CRM_NEW_LEAD_DA_T3 | CRM_NEW_LEAD_HU_T3 | CRM_NEW_LEAD_NO_T3)
```

**Filter actions:**
- ☑️ Apply label: **CRM/Reminders/1-Hour**
- ☑️ Mark as important
- ☑️ Star the message
- ☑️ Never send to spam

**📱 Mobile notification:** Urgent alert ringtone

**Example subjects:**
- `CRM_NEW_LEAD_FI_T3 | Reminder 3 – URGENT (3 min)`
- `CRM_NEW_LEAD_EN_T3 | Reminder 3 – URGENT (3 min)`

---

## FILTER 4: CRM/Admin/Stage-1-Breach (T+4 — FINAL WARNING)

**What it catches:** Fourth and final reminder before admin escalation.

**Gmail search query:**
```
subject:(CRM_NEW_LEAD_EN_T4 | CRM_NEW_LEAD_NL_T4 | CRM_NEW_LEAD_FR_T4 | CRM_NEW_LEAD_FI_T4 | CRM_NEW_LEAD_PL_T4 | CRM_NEW_LEAD_DE_T4 | CRM_NEW_LEAD_ES_T4 | CRM_NEW_LEAD_SV_T4 | CRM_NEW_LEAD_DA_T4 | CRM_NEW_LEAD_HU_T4 | CRM_NEW_LEAD_NO_T4)
```

**Filter actions:**
- ☑️ Apply label: **CRM/Admin/Stage-1-Breach**
- ☑️ Mark as important
- ☑️ Star the message
- ☑️ Never send to spam

**📱 Mobile notification:** Emergency/critical ringtone

**Example subjects:**
- `CRM_NEW_LEAD_FI_T4 | FINAL reminder – fallback in 1 minute`
- `CRM_NEW_LEAD_EN_T4 | FINAL reminder – fallback in 1 minute`

---

## FILTER 5: CRM/Admin/Stage-2-Breach (T+5 — SLA BREACH)

**What it catches:** Lead went unclaimed OR was claimed but not called — admin escalation.

**Gmail search query:**
```
subject:(CRM_ADMIN_NO_CLAIM | CRM_ADMIN_CLAIMED_NOT_CALLED)
```

**Filter actions:**
- ☑️ Apply label: **CRM/Admin/Stage-2-Breach**
- ☑️ Mark as important
- ☑️ Star the message
- ☑️ Never send to spam

**📱 Mobile notification:** Admin alert ringtone

**Example subjects:**
- `CRM_ADMIN_NO_CLAIM_FI | No agent claimed lead within 5 minutes`
- `CRM_ADMIN_CLAIMED_NOT_CALLED_FI | Lead claimed but not called (SLA breach)`
- `CRM_ADMIN_NO_CLAIM_EN | No agent claimed lead within 5 minutes`

**NOTE:** Primarily for admin users (Hans/Steven). Regular agents rarely see these.

---

## FILTER 6: CRM/Admin/Form-Submissions (WEBSITE FORMS)

**What it catches:** Direct form submissions from the website.

**Gmail search query:**
```
subject:"Form Submission" from:crm@notifications.delsolprimehomes.com
```

**Filter actions:**
- ☑️ Apply label: **CRM/Admin/Form-Submissions**
- ☑️ Never send to spam

**📱 Mobile notification:** Optional — moderate notification

**Example subjects:**
- `📬 Form Submission: John Doe (Website) - 🇬🇧 EN`
- `📬 Form Submission: Jane Smith (Landing page fi) - 🇫🇮 FI`

---

## 🔧 How to Create Each Filter

### Step 1: Open Gmail Filter Creator
1. Click the **search box** at the top of Gmail
2. Click the **filter icon** (sliders) on the right side

### Step 2: Enter Search Query
1. In the **"Has the words"** field, paste the search query from the filter section above
2. Click **"Create filter"** at the bottom

### Step 3: Configure Actions
1. Check the boxes listed in the filter's actions
2. For **"Apply label"**, select the matching label from the dropdown
3. Click **"Create filter"**

### Step 4: Verify
1. Find a matching email in your inbox
2. Confirm the label was applied correctly
3. If not, edit the filter and adjust the query

Repeat for all 6 filters.

---

## 📱 Mobile Notification Setup

### Android (Gmail App)
1. Gmail app → **Settings** → Select account
2. Tap **Manage labels**
3. Find each CRM label → Tap it
4. Enable **Label notifications**
5. Tap **Sound** → Choose ringtone per label

### iOS (Gmail App)
1. Gmail app → **Settings** → Select account
2. Tap **Label settings**
3. Find each CRM label → Enable notifications
4. Note: iOS does not support per-label ringtones

---

## ✅ Verification Checklist

After setting up all 6 filters:

- [ ] Filter 1: CRM/Urgent catches T+0 new lead emails
- [ ] Filter 2: CRM/Reminders/10-Min catches T+1 and T+2 reminders
- [ ] Filter 3: CRM/Reminders/1-Hour catches T+3 reminders
- [ ] Filter 4: CRM/Admin/Stage-1-Breach catches T+4 final warnings
- [ ] Filter 5: CRM/Admin/Stage-2-Breach catches T+5 admin escalations
- [ ] Filter 6: CRM/Admin/Form-Submissions catches website form submissions
- [ ] Mobile notifications work for each label
- [ ] End-to-end test with a real lead confirms correct label sequence

---

## 🎯 Quick Reference: Subject → Label Mapping

| Email Subject Pattern | Gmail Label | Priority |
|----------------------|-------------|----------|
| `CRM_NEW_LEAD_XX \| New...` | CRM/Urgent | 🔴 CRITICAL |
| `CRM_NEW_LEAD_XX_T1 \|...` | CRM/Reminders/10-Min | 🟡 HIGH |
| `CRM_NEW_LEAD_XX_T2 \|...` | CRM/Reminders/10-Min | 🟡 HIGH |
| `CRM_NEW_LEAD_XX_T3 \|...` | CRM/Reminders/1-Hour | 🟠 URGENT |
| `CRM_NEW_LEAD_XX_T4 \|...` | CRM/Admin/Stage-1-Breach | 🔴 CRITICAL |
| `CRM_ADMIN_NO_CLAIM_XX \|...` | CRM/Admin/Stage-2-Breach | 🔴 ADMIN |
| `CRM_ADMIN_CLAIMED_NOT_CALLED_XX \|...` | CRM/Admin/Stage-2-Breach | 🔴 ADMIN |
| `📬 Form Submission...` | CRM/Admin/Form-Submissions | 🟢 INFO |

*Where XX = EN, NL, FR, FI, PL, DE, ES, SV, DA, HU, NO*
