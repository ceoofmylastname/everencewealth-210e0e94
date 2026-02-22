

# Agent Agreement: Full Document with Signatures and Storage

## Overview
Replace the placeholder "Coming Soon" dialog with the full Independent Agent Agreement document. The agent reads and signs it; the signed agreement is stored for admins to later countersign.

## What Gets Built

### 1. New Database Table: `contracting_agreements`
Stores each signed agreement with signature data, timestamps, and status.

| Column | Type | Purpose |
|---|---|---|
| id | uuid (PK) | Unique record |
| agent_id | uuid (FK contracting_agents) | Which agent signed |
| agent_signature | text | Base64 data URL of agent signature |
| agent_initials | text | Base64 data URL of agent initials |
| agent_signed_at | timestamptz | When agent signed |
| company_signature | text | Base64 data URL of admin/company signature |
| company_initials | text | Base64 data URL of company initials |
| company_signed_by | uuid | Which admin signed |
| company_signed_at | timestamptz | When admin signed |
| consultant_name | text | Auto-populated agent full name |
| effective_date | date | Auto-populated current date |
| status | text | 'pending_agent' / 'pending_company' / 'fully_executed' |
| pdf_storage_path | text | Path to saved PDF in storage bucket (future) |
| created_at / updated_at | timestamptz | Timestamps |

RLS policies: agents can view/insert their own; admins can view all and update company signature fields.

### 2. Replace Placeholder Dialog with Full Agreement Component
A new component `AgentAgreementForm` replaces the "Coming Soon" dialog. It renders:

- **Full agreement text** (all 23 sections from the screenshots) as a scrollable document
- **Dynamic fields auto-filled**: current date, agent's full name in the header and signature block
- **Signature block at the bottom** with:
  - "Consultant Signature" -- uses the existing `SignaturePad` component (agent must draw)
  - "Consultant Initials" -- a smaller `SignaturePad` for initials
  - "Company Signature" and "Company Initials" -- shown as blank/pending (labeled "Signed by Everence Wealth admin")
  - Date field auto-populated
- **Submit button** -- enabled only when both signature and initials are provided
- On submit:
  - Saves record to `contracting_agreements` with status `pending_company`
  - Marks the "Agreement Signed" contracting step (id: `979518e9-...`) as completed in `contracting_agent_steps`
  - This triggers the existing `auto_advance_pipeline_stage` function to move the agent from `agreement_pending` to `surelc_setup`
  - Agent is then shown the regular `AgentDashboard` checklist (Step 2 of 2)

### 3. Admin Agreement Management
On the admin/contracting dashboard, agreements with `status = 'pending_company'` will be accessible:

- Admins can view the signed agreement and add company signature/initials
- Once the admin signs, the status updates to `fully_executed`
- All agreement records are viewable in the admin portal for record keeping

### 4. Agreement Text Content
The full agreement text from the screenshots (Sections I through XXIII plus Exhibit A) will be embedded as styled HTML within the component. Key sections:
- I. Term
- II. Performance of Services
- III. Compensation (A-D)
- IV. Conflicts of Interest
- V. Equipment, Tools, and Training
- VI. Confidential Information: Records
- VII. No Solicitation
- VIII. Unique Nature of Consultant's Services
- IX. Independent Contractor Relationship
- X. Ownership of Company Names, Service Marks, and Materials
- XI. Indemnification
- XII. Termination
- XIII. Agent Release
- XIV. Resolution of Disputes
- XV. Entire Agreement
- XVI. Severability
- XVII. Representation by Counsel
- XVIII. Notices
- XIX. Waiver
- XX. Assignment
- XXI. Governing Law
- XXII. Forum Selection
- XXIII. Execution in Counterparts
- Exhibit A: Carrier Schedule

## Technical Details

| Item | Detail |
|---|---|
| New DB table | `contracting_agreements` with RLS |
| New component | `src/pages/portal/advisor/contracting/AgentAgreementForm.tsx` |
| Modified file | `AgentWelcome.tsx` -- replaces placeholder dialog with real agreement form |
| Reused component | `SignaturePad` from `src/components/portal/SignaturePad.tsx` |
| Storage | Agreement data saved to `contracting_agreements` table |
| Pipeline trigger | Marking step `979518e9-9044-404d-bf94-3cc44d7c78cf` as completed auto-advances pipeline |
| Admin view | Admin dashboard gets an "Agreements" section to view/countersign |

## Flow Summary

```text
Agent logs in
  --> Sees Welcome page (Step 1 of 2)
  --> Clicks "Review Agent Agreement"
  --> Full agreement opens (scrollable, with their name/date pre-filled)
  --> Agent signs (signature + initials via drawing pad)
  --> Clicks "Sign & Submit"
  --> Agreement saved, step marked complete, pipeline advances
  --> Agent sees regular onboarding checklist (Step 2 of 2)

Admin later:
  --> Views pending agreements in admin portal
  --> Adds company signature/initials
  --> Agreement becomes "fully executed"
```

