# 📧 CRM Email Subject Reference & Gmail Filter Guide for Hans

> **Last updated:** 2026-02-10
> **Sender:** `crm@notifications.delsolprimehomes.com`

---

## 📋 Complete Email Subject Line Reference

### English (EN) Leads

| Timing | Subject Line | Recipients |
|--------|-------------|------------|
| T+0 | `CRM_NEW_LEAD_EN \| New English lead – call immediately` | Steven |
| T+1 | `CRM_NEW_LEAD_EN_T1 \| Reminder 1 – lead not claimed (1 min)` | Steven |
| T+2 | `CRM_NEW_LEAD_EN_T2 \| Reminder 2 – SLA running (2 min)` | Steven |
| T+3 | `CRM_NEW_LEAD_EN_T3 \| Reminder 3 – URGENT (3 min)` | Steven |
| T+4 | `CRM_NEW_LEAD_EN_T4 \| FINAL reminder – fallback in 1 minute` | Steven |
| T+5 (Unclaimed) | `CRM_ADMIN_NO_CLAIM_EN \| No agent claimed lead within 5 minutes` | Steven (Admin) |
| T+5 (Not Called) | `CRM_ADMIN_CLAIMED_NOT_CALLED_EN \| Lead claimed but not called (SLA breach)` | Steven (Admin) |

### Dutch (NL) Leads

| Timing | Subject Line | Recipients |
|--------|-------------|------------|
| T+0 | `CRM_NEW_LEAD_NL \| New Dutch lead – call immediately` | Nederlands, Cindy |
| T+1 | `CRM_NEW_LEAD_NL_T1 \| Reminder 1 – lead not claimed (1 min)` | Nederlands, Cindy |
| T+2 | `CRM_NEW_LEAD_NL_T2 \| Reminder 2 – SLA running (2 min)` | Nederlands, Cindy |
| T+3 | `CRM_NEW_LEAD_NL_T3 \| Reminder 3 – URGENT (3 min)` | Nederlands, Cindy |
| T+4 | `CRM_NEW_LEAD_NL_T4 \| FINAL reminder – fallback in 1 minute` | Nederlands, Cindy |
| T+5 (Unclaimed) | `CRM_ADMIN_NO_CLAIM_NL \| No agent claimed lead within 5 minutes` | Steven (Admin) |
| T+5 (Not Called) | `CRM_ADMIN_CLAIMED_NOT_CALLED_NL \| Lead claimed but not called (SLA breach)` | Steven (Admin) |

### French (FR) Leads

| Timing | Subject Line | Recipients |
|--------|-------------|------------|
| T+0 | `CRM_NEW_LEAD_FR \| New French lead – call immediately` | Cedric, Nathalie, Augustin |
| T+1 | `CRM_NEW_LEAD_FR_T1 \| Reminder 1 – lead not claimed (1 min)` | Cedric, Nathalie, Augustin |
| T+2 | `CRM_NEW_LEAD_FR_T2 \| Reminder 2 – SLA running (2 min)` | Cedric, Nathalie, Augustin |
| T+3 | `CRM_NEW_LEAD_FR_T3 \| Reminder 3 – URGENT (3 min)` | Cedric, Nathalie, Augustin |
| T+4 | `CRM_NEW_LEAD_FR_T4 \| FINAL reminder – fallback in 1 minute` | Cedric, Nathalie, Augustin |
| T+5 (Unclaimed) | `CRM_ADMIN_NO_CLAIM_FR \| No agent claimed lead within 5 minutes` | Steven (Admin) |
| T+5 (Not Called) | `CRM_ADMIN_CLAIMED_NOT_CALLED_FR \| Lead claimed but not called (SLA breach)` | Steven (Admin) |

### ⭐ Finnish (FI) Leads — Hans is Admin

| Timing | Subject Line | Recipients |
|--------|-------------|------------|
| T+0 | `CRM_NEW_LEAD_FI \| New Finnish lead – call immediately` | Juho, Eetu |
| T+1 | `CRM_NEW_LEAD_FI_T1 \| Reminder 1 – lead not claimed (1 min)` | Juho, Eetu |
| T+2 | `CRM_NEW_LEAD_FI_T2 \| Reminder 2 – SLA running (2 min)` | Juho, Eetu |
| T+3 | `CRM_NEW_LEAD_FI_T3 \| Reminder 3 – URGENT (3 min)` | Juho, Eetu |
| T+4 | `CRM_NEW_LEAD_FI_T4 \| FINAL reminder – fallback in 1 minute` | Juho, Eetu |
| T+5 (Unclaimed) | `CRM_ADMIN_NO_CLAIM_FI \| No agent claimed lead within 5 minutes` | **HANS** ⭐ |
| T+5 (Not Called) | `CRM_ADMIN_CLAIMED_NOT_CALLED_FI \| Lead claimed but not called (SLA breach)` | **HANS** ⭐ |

### ⭐ Polish (PL) Leads — Hans is Admin

| Timing | Subject Line | Recipients |
|--------|-------------|------------|
| T+0 | `CRM_NEW_LEAD_PL \| New Polish lead – call immediately` | Artur |
| T+1 | `CRM_NEW_LEAD_PL_T1 \| Reminder 1 – lead not claimed (1 min)` | Artur |
| T+2 | `CRM_NEW_LEAD_PL_T2 \| Reminder 2 – SLA running (2 min)` | Artur |
| T+3 | `CRM_NEW_LEAD_PL_T3 \| Reminder 3 – URGENT (3 min)` | Artur |
| T+4 | `CRM_NEW_LEAD_PL_T4 \| FINAL reminder – fallback in 1 minute` | Artur |
| T+5 (Unclaimed) | `CRM_ADMIN_NO_CLAIM_PL \| No agent claimed lead within 5 minutes` | **HANS** ⭐ |
| T+5 (Not Called) | `CRM_ADMIN_CLAIMED_NOT_CALLED_PL \| Lead claimed but not called (SLA breach)` | **HANS** ⭐ |

---

## 📱 Hans's Routing Summary

### ✅ What Hans WILL receive

- Admin escalations for **Finnish (FI)** leads at T+5
- Admin escalations for **Polish (PL)** leads at T+5
- Both types: **Unclaimed** + **Claimed-but-not-called**

### ❌ What Hans will NOT receive

- T+0 through T+4 agent notifications for ANY language
- Admin escalations for EN, NL, FR, DE, ES, SV, DA, HU, NO (those go to Steven)

---

## 🎯 Gmail Filter Setup Instructions

### Filter 1: Finnish Admin — Unclaimed Leads

**Search query:**
```
subject:CRM_ADMIN_NO_CLAIM_FI
```

**Actions:**
- ☑️ Apply label: `🚨 ADMIN - FI Unclaimed`
- ☑️ Mark as important
- ☑️ Never send to Spam
- ☑️ Also apply filter to matching conversations

### Filter 2: Finnish Admin — Claimed But Not Called

**Search query:**
```
subject:CRM_ADMIN_CLAIMED_NOT_CALLED_FI
```

**Actions:**
- ☑️ Apply label: `⚠️ ADMIN - FI Not Called`
- ☑️ Mark as important
- ☑️ Never send to Spam

### Filter 3: Polish Admin — Unclaimed Leads

**Search query:**
```
subject:CRM_ADMIN_NO_CLAIM_PL
```

**Actions:**
- ☑️ Apply label: `🚨 ADMIN - PL Unclaimed`
- ☑️ Mark as important
- ☑️ Never send to Spam

### Filter 4: Polish Admin — Claimed But Not Called

**Search query:**
```
subject:CRM_ADMIN_CLAIMED_NOT_CALLED_PL
```

**Actions:**
- ☑️ Apply label: `⚠️ ADMIN - PL Not Called`
- ☑️ Mark as important
- ☑️ Never send to Spam

### Filter 5: All Admin Emails — Catch-All

**Search query:**
```
subject:(CRM_ADMIN_NO_CLAIM OR CRM_ADMIN_CLAIMED_NOT_CALLED)
```

**Actions:**
- ☑️ Apply label: `📊 ADMIN - All Languages`
- ☑️ Mark as important

---

## 🔔 Step-by-Step: Creating Your First Filter

1. Open **Gmail** → Click the search box at the top
2. Click the **filter icon** (sliders) on the right side of the search box
3. In **"Has the words"** field, paste: `subject:CRM_ADMIN_NO_CLAIM_FI`
4. Click **"Create filter"**
5. Check these boxes:
   - ☑️ **Apply the label** → Choose "Create new label" → Name it: `🚨 ADMIN - FI Unclaimed`
   - ☑️ **Mark as important**
   - ☑️ **Never send to Spam**
   - ☑️ **Also apply filter to matching conversations**
6. Click **"Create filter"**

Repeat for Filters 2–5 using the search queries above.

---

## 🧪 Test Plan: Finnish Lead Escalation

Create a test Finnish lead and let it go unclaimed for 5 minutes.

**Expected timeline:**

| Time | Event | Recipient |
|------|-------|-----------|
| T+0 | `CRM_NEW_LEAD_FI \| New Finnish lead – call immediately` | Juho, Eetu |
| T+1 | `CRM_NEW_LEAD_FI_T1 \| Reminder 1 – lead not claimed (1 min)` | Juho, Eetu |
| T+2 | `CRM_NEW_LEAD_FI_T2 \| Reminder 2 – SLA running (2 min)` | Juho, Eetu |
| T+3 | `CRM_NEW_LEAD_FI_T3 \| Reminder 3 – URGENT (3 min)` | Juho, Eetu |
| T+4 | `CRM_NEW_LEAD_FI_T4 \| FINAL reminder – fallback in 1 minute` | Juho, Eetu |
| T+5 | `CRM_ADMIN_NO_CLAIM_FI \| No agent claimed lead within 5 minutes` | **HANS** ⭐ |

**Verification checklist:**
- [ ] Hans does NOT receive T+0 through T+4 emails
- [ ] Hans receives the T+5 admin email
- [ ] Email is automatically labeled `🚨 ADMIN - FI Unclaimed` (if filter is set up)
- [ ] Email contains a link to the lead in the CRM admin panel
