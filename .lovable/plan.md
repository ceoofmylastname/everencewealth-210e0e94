
# Build 8 Interactive Calculators into the Tools Hub

## Current State

All 8 calculators in the database have `external_url = null`. This means every calculator card currently renders with **no action button** — they are purely decorative display cards. The calculators exist:

1. IUL vs 401k Comparison (Cash Flow)
2. Inflation Impact Calculator (Cash Flow)
3. Retirement Gap Calculator (Retirement)
4. Social Security Estimator (Retirement)
5. RMD Calculator (Retirement)
6. Life Expectancy Calculator (Life & Income)
7. Tax Bucket Optimizer (Tax Planning)
8. Estate Tax Calculator (Estate Planning)

## The Fix: Build All 8 as In-App Interactive Calculators

Rather than linking to external tools (which don't exist), we build each calculator as an interactive React component with real financial math, rendered in a modal/slide-over when the advisor clicks "Open Calculator."

Each calculator will:
- Open in a full-featured **Dialog modal** (right-side slide panel on desktop)
- Have **real input fields** (sliders + number inputs for key variables)
- Show **live computed results** as inputs change (no submit button needed)
- Use **Recharts** for visual output (already installed)
- Be **fully responsive** — stacked on mobile, two-column on desktop
- Match the existing brand green design system

---

## The 8 Calculators — Inputs & Outputs

### 1. IUL vs 401k Comparison
- **Inputs:** Age, annual contribution ($), years to retirement, tax rate, assumed growth rate
- **Output:** Side-by-side bar chart showing projected value at retirement for IUL vs 401k, with tax-equivalent comparison table showing net after-tax income

### 2. Inflation Impact Calculator
- **Inputs:** Current amount ($), inflation rate (%), years
- **Output:** Line chart showing purchasing power erosion over time; "In X years, $Y today will only buy what $Z buys today"

### 3. Retirement Gap Calculator
- **Inputs:** Current age, retirement age, current savings ($), monthly contribution ($), expected return (%), desired monthly income in retirement ($)
- **Output:** Projected savings at retirement vs. required nest egg; gap amount highlighted in red/green; bar chart visualization

### 4. Social Security Estimator
- **Inputs:** Current age, annual earnings ($), planned retirement age (62/67/70 slider)
- **Output:** Estimated monthly benefit at each claiming age, with a comparison bar chart and total lifetime benefit estimate

### 5. RMD Calculator
- **Inputs:** Age, account balance ($), account type (Traditional IRA / 401k)
- **Output:** Required minimum distribution for this year, projected RMD schedule table for next 10 years (declining balance chart)

### 6. Life Expectancy Calculator
- **Inputs:** Age, gender, smoker Y/N, health rating (excellent/good/fair), exercise frequency
- **Output:** Estimated life expectancy years, color-coded longevity score, "years of retirement income needed" derived figure

### 7. Tax Bucket Optimizer
- **Inputs:** Total investable assets ($), current tax bracket (%), projected retirement tax bracket (%), years to retirement
- **Output:** Recommended allocation across Taxable / Tax-Deferred / Tax-Exempt buckets; donut pie chart with dollar amounts per bucket

### 8. Estate Tax Calculator
- **Inputs:** Total gross estate ($), outstanding debts ($), existing life insurance ($), state selection
- **Output:** Federal taxable estate, federal estate tax due, net estate to heirs; simple summary card with color-coded results

---

## Architecture

### New Files
- `src/pages/portal/advisor/calculators/IULvsKComparison.tsx`
- `src/pages/portal/advisor/calculators/InflationImpact.tsx`
- `src/pages/portal/advisor/calculators/RetirementGap.tsx`
- `src/pages/portal/advisor/calculators/SocialSecurityEstimator.tsx`
- `src/pages/portal/advisor/calculators/RMDCalculator.tsx`
- `src/pages/portal/advisor/calculators/LifeExpectancy.tsx`
- `src-pages/portal/advisor/calculators/TaxBucketOptimizer.tsx`
- `src/pages/portal/advisor/calculators/EstateTaxCalculator.tsx`

Each exports a single React component that receives `onClose: () => void` as a prop.

### Modified Files
- `src/pages/portal/advisor/ToolsHub.tsx` — wire the "Open Calculator" button to open the correct calculator modal by matching `calculator_name` to the component map

### Calculator Card Enhancement
Each calculator card gets:
- An "Open Calculator" button (brand green, full width) that opens the modal
- A live badge showing the category color (Cash Flow = blue, Retirement = emerald, etc.)
- Estimated time label (e.g., "~2 min")

### Modal Pattern
Use `<Dialog>` from shadcn/ui with `max-w-2xl` on desktop, full-screen on mobile. The calculator renders inside with:

```
┌─────────────────────────────────────────────────────┐
│  [← Back]    IUL vs 401k Comparison        [✕]     │
├──────────────────┬──────────────────────────────────┤
│  INPUTS          │  RESULTS                         │
│  ─────────────── │  ────────────────────────────    │
│  Age: [──●──]    │  [Chart]                         │
│  Contribution:$  │                                  │
│  Years:          │  IUL: $X,XXX,XXX                 │
│  Tax Rate: %     │  401k net: $X,XXX,XXX            │
└──────────────────┴──────────────────────────────────┘
```

On mobile: inputs stack on top, results below (single column).

---

## No Database Changes Required

The calculators are purely client-side math — no API calls, no schema changes. All financial formulas run in the browser using standard React `useMemo` hooks.

---

## Technical Notes

- All calculations use standard financial formulas (compound interest, IRS RMD Uniform Lifetime Table, Social Security bend points)
- Recharts `LineChart`, `BarChart`, and `PieChart` are used for visualizations (already in dependencies)
- Sliders use the existing `@radix-ui/react-slider` (already installed)
- All components are zero-dependency additions — no new packages needed
