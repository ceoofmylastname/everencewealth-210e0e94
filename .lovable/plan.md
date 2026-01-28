

# Update Property Inquiry Modal Form

## Current State

The property inquiry modal (`RetargetingPropertyModal.tsx`) currently has these form fields:

| Field | Type | Current |
|-------|------|---------|
| Full Name | Text input | ✓ |
| WhatsApp Number | Phone input | ✓ |
| Your Questions (Optional) | Textarea | ✓ |

**Issues:**
1. Missing "I'm interested in" dropdown
2. Missing consent checkbox
3. Hardcoded English text (title, labels, button)
4. Different form structure from the reference design

---

## Target Design (from screenshots)

The new form should match this structure:

| Field | Type |
|-------|------|
| Full Name | Text input with "Your full name" placeholder |
| WhatsApp / SMS Number | Phone input with country selector |
| I'm interested in | Dropdown (Apartments, Villas, Both) |
| Consent checkbox | "I agree to receive property updates via WhatsApp/SMS" |
| Button | "Send me the details" |

---

## Implementation Plan

### 1. Add New Translation Keys

Add modal-specific translations to `src/lib/retargetingTranslations.ts` for all 10 languages:

```typescript
// Property Modal specific
propertyModalTitle: "Receive project details via WhatsApp or SMS — at your convenience.",
propertyModalButton: "Send me the details",
propertyModalConsent: "I agree to receive property updates via WhatsApp/SMS",
propertyModalPrivacy: "We respect your privacy. No spam, ever.",
```

| Key | EN | NL | DE | FR | ... |
|-----|----|----|----|----|-----|
| propertyModalTitle | Receive project details via WhatsApp or SMS — at your convenience. | Ontvang projectdetails via WhatsApp of SMS — op uw gemak. | Erhalten Sie Projektdetails per WhatsApp oder SMS — ganz nach Ihrem Wunsch. | Recevez les détails du projet par WhatsApp ou SMS — à votre convenance. | ... |
| propertyModalButton | Send me the details | Stuur mij de details | Schicken Sie mir die Details | Envoyez-moi les détails | ... |
| propertyModalConsent | I agree to receive property updates via WhatsApp/SMS | Ik ga akkoord met het ontvangen van vastgoedupdates via WhatsApp/SMS | Ich stimme zu, Immobilien-Updates per WhatsApp/SMS zu erhalten | J'accepte de recevoir des mises à jour immobilières par WhatsApp/SMS | ... |
| propertyModalPrivacy | We respect your privacy. No spam, ever. | Wij respecteren uw privacy. Nooit spam. | Wir respektieren Ihre Privatsphäre. Niemals Spam. | Nous respectons votre vie privée. Jamais de spam. | ... |

### 2. Update Form Schema

Update the Zod validation schema to include new fields:

```typescript
const formSchema = z.object({
  fullName: z.string().min(2, "Name is too short").max(100),
  whatsapp: z.string().min(6, "Phone number is required"),
  interest: z.string().min(1, "Please select an option"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to continue" }),
  }),
});
```

### 3. Update Form Component

Replace the "Your Questions" textarea with:

**Interest Dropdown:**
```tsx
<Select value={interest} onValueChange={setInterest}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    {t.formInterestOptions.map((option, index) => (
      <SelectItem key={index} value={option}>
        {option}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Consent Checkbox:**
```tsx
<div className="flex items-start gap-3">
  <Checkbox
    id="consent"
    checked={consent}
    onCheckedChange={setConsent}
  />
  <div>
    <label htmlFor="consent" className="text-sm text-landing-navy/80">
      {t.propertyModalConsent}
    </label>
    <p className="text-xs text-landing-navy/50">{t.propertyModalPrivacy}</p>
  </div>
</div>
```

### 4. Update CRM Lead Data

Update the `registerCrmLead` call to include the interest selection:

```typescript
await registerCrmLead({
  // ... existing fields
  interest: `${property.internal_name} - ${formData.interest}`,
  // Remove: message: data.questions
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/retargetingTranslations.ts` | Add `propertyModalTitle`, `propertyModalButton`, `propertyModalConsent`, `propertyModalPrivacy` for all 10 languages |
| `src/components/retargeting/RetargetingPropertyModal.tsx` | Replace form structure with interest dropdown + consent checkbox, update schema, add state management for new fields |

---

## Visual Comparison

**Before (Current):**
```
┌─────────────────────────────────────┐
│  Inquire About This Property        │
├─────────────────────────────────────┤
│  [Property Card]                    │
├─────────────────────────────────────┤
│  Full Name *                        │
│  ┌───────────────────────────────┐  │
│  │ John Smith                    │  │
│  └───────────────────────────────┘  │
│                                     │
│  WhatsApp Number *                  │
│  ┌───────────────────────────────┐  │
│  │ 🇪🇸 +34                        │  │
│  └───────────────────────────────┘  │
│                                     │
│  Your Questions (Optional)          │
│  ┌───────────────────────────────┐  │
│  │ Any specific questions...     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Send Inquiry             │  │
│  └───────────────────────────────┘  │
│                                     │
│  By submitting, you agree...        │
└─────────────────────────────────────┘
```

**After (New Design):**
```
┌─────────────────────────────────────┐
│  Receive project details via        │
│  WhatsApp or SMS — at your          │
│  convenience.                       │
├─────────────────────────────────────┤
│  [Property Card]                    │
├─────────────────────────────────────┤
│  Full Name *                        │
│  ┌───────────────────────────────┐  │
│  │ Your full name                │  │
│  └───────────────────────────────┘  │
│                                     │
│  WhatsApp / SMS Number *            │
│  ┌───────────────────────────────┐  │
│  │ 🇪🇸 +34 xxx xxx xxxx          │  │
│  └───────────────────────────────┘  │
│                                     │
│  I'm interested in                  │
│  ┌───────────────────────────────┐  │
│  │ Both                       ▼  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ☑ I agree to receive property     │
│    updates via WhatsApp/SMS         │
│    We respect your privacy. No spam.│
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Send me the details         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Expected Outcome

1. Property modal matches the reference design with interest dropdown and consent checkbox
2. All text is localized for all 10 supported languages
3. Form data (including interest selection) routes correctly to CRM
4. Consent is required before submission

