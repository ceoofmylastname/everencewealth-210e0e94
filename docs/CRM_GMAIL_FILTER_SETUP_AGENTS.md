# 📧 CRM Gmail Filter Setup — Sales Agents

> **Last updated:** 2026-02-13
> **Sender:** `crm@notifications.everencewealth.com`
> **Audience:** All sales agents (juho@, eetu@, artur@, cedric@, nathalie@, augustin@, nederlands@, cindy@, steven@, info@yenomai.com)

---

## 📁 Step 1: Create Your Label Tree

Create these 9 labels in Gmail (Settings → Labels → Create new label):

```
CRM/
├── Urgent
├── Stage-1/
│   ├── T0-Broadcast
│   ├── T1-Escalation
│   ├── T2-Escalation
│   ├── T3-Escalation
│   └── T4-Final-Warning
├── Reminders/
│   ├── 10-Min
│   └── 1-Hour
└── Actions/
    └── Reassigned
```

**How to create nested labels:**
1. Create `CRM` first
2. Create `Stage-1` and select "Nest label under: CRM"
3. Create `T0-Broadcast` and select "Nest label under: CRM/Stage-1"
4. Repeat for all sub-labels

---

## 📋 Filter Overview

| # | Filter Name | Gmail Labels Applied | Catches | Priority |
|---|------------|---------------------|---------|----------|
| 1 | T+0 New Leads | **CRM/Urgent** + **CRM/Stage-1/T0-Broadcast** | Brand new leads | 🔴 CRITICAL |
| 2 | T+1 Reminder | **CRM/Stage-1/T1-Escalation** + **CRM/Reminders/10-Min** | 1st reminder (1 min) | 🟡 HIGH |
| 3 | T+2 Reminder | **CRM/Stage-1/T2-Escalation** + **CRM/Reminders/10-Min** | 2nd reminder (2 min) | 🟡 HIGH |
| 4 | T+3 Reminder | **CRM/Stage-1/T3-Escalation** + **CRM/Reminders/1-Hour** | 3rd reminder – urgent (3 min) | 🟠 URGENT |
| 5 | T+4 Final Warning | **CRM/Stage-1/T4-Final-Warning** | Last chance before admin escalation | 🔴 CRITICAL |
| 6 | Reassigned Leads | **CRM/Actions/Reassigned** | Lead reassigned to you | 🟡 HIGH |

> **Note:** Filters 2, 3, and 4 apply **two labels each** — a stage label AND a reminder label — so you can view leads by escalation stage or by timing.

---

## FILTER 1: T+0 — New Leads (CRM/Urgent + CRM/Stage-1/T0-Broadcast)

**What it catches:** Brand new leads requiring immediate response.

**Gmail search query:**
```
from:crm@notifications.everencewealth.com subject:(CRM_NEW_LEAD_EN | CRM_NEW_LEAD_NL | CRM_NEW_LEAD_FR | CRM_NEW_LEAD_FI | CRM_NEW_LEAD_PL | CRM_NEW_LEAD_DE | CRM_NEW_LEAD_ES | CRM_NEW_LEAD_SV | CRM_NEW_LEAD_DA | CRM_NEW_LEAD_HU | CRM_NEW_LEAD_NO) -subject:T1 -subject:T2 -subject:T3 -subject:T4
```

**Filter actions:**
- ☑️ Apply label: **CRM/Urgent**
- ☑️ Apply label: **CRM/Stage-1/T0-Broadcast**
- ☑️ Mark as important
- ☑️ Star the message
- ☑️ Never send to spam

**📱 Mobile notification:** Loudest/most urgent ringtone

**Example subjects:**
- `CRM_NEW_LEAD_FI | New Finnish lead – call immediately`
- `CRM_NEW_LEAD_EN | New English lead – call immediately`

> ⚠️ **Important:** Gmail only allows ONE label per filter rule. You need to create **two separate filters** with the same search query — one applying `CRM/Urgent` and one applying `CRM/Stage-1/T0-Broadcast`.

---

## FILTER 2: T+1 — First Reminder (CRM/Stage-1/T1-Escalation + CRM/Reminders/10-Min)

**What it catches:** First reminder — lead not yet claimed after 1 minute.

**Gmail search query:**
```
from:crm@notifications.everencewealth.com subject:(CRM_NEW_LEAD_EN_T1 | CRM_NEW_LEAD_NL_T1 | CRM_NEW_LEAD_FR_T1 | CRM_NEW_LEAD_FI_T1 | CRM_NEW_LEAD_PL_T1 | CRM_NEW_LEAD_DE_T1 | CRM_NEW_LEAD_ES_T1 | CRM_NEW_LEAD_SV_T1 | CRM_NEW_LEAD_DA_T1 | CRM_NEW_LEAD_HU_T1 | CRM_NEW_LEAD_NO_T1)
```

**Filter actions (create two filters with same query):**

*Filter 2a:*
- ☑️ Apply label: **CRM/Stage-1/T1-Escalation**
- ☑️ Mark as important
- ☑️ Never send to spam

*Filter 2b:*
- ☑️ Apply label: **CRM/Reminders/10-Min**
- ☑️ Never send to spam

**📱 Mobile notification:** Moderate alert

**Example subjects:**
- `CRM_NEW_LEAD_FI_T1 | Reminder 1 – lead not claimed (1 min)`
- `CRM_NEW_LEAD_EN_T1 | Reminder 1 – lead not claimed (1 min)`

---

## FILTER 3: T+2 — Second Reminder (CRM/Stage-1/T2-Escalation + CRM/Reminders/10-Min)

**What it catches:** Second reminder — lead still not claimed after 2 minutes.

**Gmail search query:**
```
from:crm@notifications.everencewealth.com subject:(CRM_NEW_LEAD_EN_T2 | CRM_NEW_LEAD_NL_T2 | CRM_NEW_LEAD_FR_T2 | CRM_NEW_LEAD_FI_T2 | CRM_NEW_LEAD_PL_T2 | CRM_NEW_LEAD_DE_T2 | CRM_NEW_LEAD_ES_T2 | CRM_NEW_LEAD_SV_T2 | CRM_NEW_LEAD_DA_T2 | CRM_NEW_LEAD_HU_T2 | CRM_NEW_LEAD_NO_T2)
```

**Filter actions (create two filters with same query):**

*Filter 3a:*
- ☑️ Apply label: **CRM/Stage-1/T2-Escalation**
- ☑️ Mark as important
- ☑️ Never send to spam

*Filter 3b:*
- ☑️ Apply label: **CRM/Reminders/10-Min**
- ☑️ Never send to spam

**📱 Mobile notification:** Moderate alert

**Example subjects:**
- `CRM_NEW_LEAD_FI_T2 | Reminder 2 – SLA running (2 min)`
- `CRM_NEW_LEAD_EN_T2 | Reminder 2 – SLA running (2 min)`

---

## FILTER 4: T+3 — Urgent Reminder (CRM/Stage-1/T3-Escalation + CRM/Reminders/1-Hour)

**What it catches:** Third reminder — getting urgent, 3 minutes elapsed.

**Gmail search query:**
```
from:crm@notifications.everencewealth.com subject:(CRM_NEW_LEAD_EN_T3 | CRM_NEW_LEAD_NL_T3 | CRM_NEW_LEAD_FR_T3 | CRM_NEW_LEAD_FI_T3 | CRM_NEW_LEAD_PL_T3 | CRM_NEW_LEAD_DE_T3 | CRM_NEW_LEAD_ES_T3 | CRM_NEW_LEAD_SV_T3 | CRM_NEW_LEAD_DA_T3 | CRM_NEW_LEAD_HU_T3 | CRM_NEW_LEAD_NO_T3)
```

**Filter actions (create two filters with same query):**

*Filter 4a:*
- ☑️ Apply label: **CRM/Stage-1/T3-Escalation**
- ☑️ Mark as important
- ☑️ Star the message
- ☑️ Never send to spam

*Filter 4b:*
- ☑️ Apply label: **CRM/Reminders/1-Hour**
- ☑️ Never send to spam

**📱 Mobile notification:** Urgent alert ringtone

**Example subjects:**
- `CRM_NEW_LEAD_FI_T3 | Reminder 3 – URGENT (3 min)`
- `CRM_NEW_LEAD_EN_T3 | Reminder 3 – URGENT (3 min)`

---

## FILTER 5: T+4 — Final Warning (CRM/Stage-1/T4-Final-Warning)

**What it catches:** Fourth and final reminder — admin escalation imminent.

**Gmail search query:**
```
from:crm@notifications.everencewealth.com subject:(CRM_NEW_LEAD_EN_T4 | CRM_NEW_LEAD_NL_T4 | CRM_NEW_LEAD_FR_T4 | CRM_NEW_LEAD_FI_T4 | CRM_NEW_LEAD_PL_T4 | CRM_NEW_LEAD_DE_T4 | CRM_NEW_LEAD_ES_T4 | CRM_NEW_LEAD_SV_T4 | CRM_NEW_LEAD_DA_T4 | CRM_NEW_LEAD_HU_T4 | CRM_NEW_LEAD_NO_T4)
```

**Filter actions:**
- ☑️ Apply label: **CRM/Stage-1/T4-Final-Warning**
- ☑️ Mark as important
- ☑️ Star the message
- ☑️ Never send to spam

**📱 Mobile notification:** Emergency/critical ringtone

**Example subjects:**
- `CRM_NEW_LEAD_FI_T4 | FINAL reminder – fallback in 1 minute`
- `CRM_NEW_LEAD_EN_T4 | FINAL reminder – fallback in 1 minute`

---

## FILTER 6: Reassigned Leads (CRM/Actions/Reassigned)

**What it catches:** Leads that have been reassigned to you by an admin.

> 🚧 **Note:** This label is reserved for future use. The reassignment notification email subject pattern will be added here once confirmed. For now, create the label so it's ready.

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

### Step 4: For Dual-Label Filters (Filters 1–4)
Since Gmail only allows one label per filter rule, you must create **two filters** with the same search query:
1. Create the first filter → apply the **stage label** (e.g., CRM/Stage-1/T1-Escalation)
2. Create a second filter with the **same query** → apply the **reminder/urgency label** (e.g., CRM/Reminders/10-Min)

### Step 5: Verify
1. Find a matching email in your inbox
2. Confirm **both labels** were applied correctly
3. If not, edit the filter and adjust the query

---

## 📱 Mobile Notification Setup

### Android (Gmail App)
1. Gmail app → **Settings** → Select account
2. Tap **Manage labels**
3. Find each CRM label → Tap it
4. Enable **Label notifications**
5. Tap **Sound** → Choose ringtone per label

**Recommended ringtone priority:**
| Label | Ringtone |
|-------|----------|
| CRM/Urgent | 🔊 Loudest/emergency |
| CRM/Stage-1/T4-Final-Warning | 🔊 Emergency |
| CRM/Stage-1/T3-Escalation | 🔔 Urgent |
| CRM/Reminders/10-Min | 🔔 Moderate |
| CRM/Reminders/1-Hour | 🔔 Urgent |
| CRM/Actions/Reassigned | 🔔 Moderate |

### iOS (Gmail App)
1. Gmail app → **Settings** → Select account
2. Tap **Label settings**
3. Find each CRM label → Enable notifications
4. Note: iOS does not support per-label ringtones

---

## ✅ Verification Checklist

After setting up all filters:

- [ ] Filter 1: CRM/Urgent + CRM/Stage-1/T0-Broadcast applied to T+0 new lead emails
- [ ] Filter 2: CRM/Stage-1/T1-Escalation + CRM/Reminders/10-Min applied to T+1 reminders
- [ ] Filter 3: CRM/Stage-1/T2-Escalation + CRM/Reminders/10-Min applied to T+2 reminders
- [ ] Filter 4: CRM/Stage-1/T3-Escalation + CRM/Reminders/1-Hour applied to T+3 reminders
- [ ] Filter 5: CRM/Stage-1/T4-Final-Warning applied to T+4 final warnings
- [ ] Filter 6: CRM/Actions/Reassigned label created (filter pending)
- [ ] Mobile notifications enabled for CRM/Urgent label
- [ ] Mobile notifications enabled for CRM/Reminders labels
- [ ] End-to-end test with a real lead confirms correct label sequence

---

## 🎯 Quick Reference: Subject → Label Mapping

| Email Subject Pattern | Gmail Labels | Priority |
|----------------------|-------------|----------|
| `CRM_NEW_LEAD_XX \| New...` | CRM/Urgent + CRM/Stage-1/T0-Broadcast | 🔴 CRITICAL |
| `CRM_NEW_LEAD_XX_T1 \|...` | CRM/Stage-1/T1-Escalation + CRM/Reminders/10-Min | 🟡 HIGH |
| `CRM_NEW_LEAD_XX_T2 \|...` | CRM/Stage-1/T2-Escalation + CRM/Reminders/10-Min | 🟡 HIGH |
| `CRM_NEW_LEAD_XX_T3 \|...` | CRM/Stage-1/T3-Escalation + CRM/Reminders/1-Hour | 🟠 URGENT |
| `CRM_NEW_LEAD_XX_T4 \|...` | CRM/Stage-1/T4-Final-Warning | 🔴 CRITICAL |

*Where XX = EN, NL, FR, FI, PL, DE, ES, SV, DA, HU, NO*
