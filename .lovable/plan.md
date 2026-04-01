

## Add a Bold Headline Above the Agent Selector on Step 1

### What changes
Add a prominent, attention-grabbing headline at the top of step 0 (case 0), rendered **before** the existing "YOUR AGENT" header block. This creates a visual hook that draws users in before they see the agent selector.

### Design
- A large, bold headline in the brand dark green (`text-[#1A4D3E]`) — something like:
  > **"Ready to Take Control of Your Financial Future?"**
- Rendered at `text-2xl sm:text-4xl font-extrabold` with generous bottom margin
- Optional subtle gold accent underline or highlight on a key word
- Sits above the existing icon + "YOUR AGENT" label + "Who invited you…" heading, giving the page a clear visual hierarchy:
  1. Big emotional headline (new)
  2. Step label + question + dropdown (existing)

### Implementation
**`src/pages/ResponseCard.tsx`** — inside `case 0:` return block (~line 329), add a headline `div` before `{header(...)}`:

```tsx
<div className="text-center mb-10">
  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1A4D3E] leading-tight">
    Ready to Take Control of<br />
    <span className="text-[#C8A96E]">Your Financial Future?</span>
  </h1>
  <p className="text-gray-400 text-sm mt-3">Let's start by connecting you with your agent.</p>
</div>
```

The gold-colored second line creates a luxury feel consistent with the existing design system.

### File
- `src/pages/ResponseCard.tsx` — ~6 lines added inside case 0

