

# Populate Tools Hub Data and Enhance with Modern Animated UI

## Summary

The Tools Hub currently has 2 tabs (Quoting and Calculators) but the quoting_tools table is empty, and only 8 calculators exist. This plan inserts all 8 quoting tool records, adds 7 new calculator records, creates 7 new calculator components, and redesigns the entire Tools Hub with Framer Motion animations, 3D card effects, and a sleek professional UI.

## Phase 1: Insert Quoting Tools Data

Insert 8 records into the `quoting_tools` table, linked to the correct carrier IDs:

1. Mutual of Omaha - Mobile Quote System (quick_quote)
2. Americo - Agent Portal (agent_portal, requires_login=true)
3. Americo - IUL Microsite (microsite)
4. Foresters Financial - Quote System (quick_quote)
5. Assurity - Accidental Death Quote (quick_quote)
6. Royal Neighbors - Quick Quote (quick_quote)
7. Transamerica - Immediate Solutions Quote (quick_quote)
8. F&G Life - IUL Microsite (microsite)

Each includes tool_name, tool_url, tool_type, requires_login, login_instructions (where applicable), and description.

## Phase 2: Insert New Calculator Records

Add 7 new calculator records to the `calculators` table:

| Calculator | Category | ID Range |
|---|---|---|
| Debt vs Investing | cash_flow | sort 9 |
| Purchasing Power | cash_flow | sort 10 |
| Inflation Retirement | retirement | sort 11 |
| Habits to Wealth | retirement | sort 12 |
| Lifetime Earnings | life_income | sort 13 |
| Insurance Longevity | life_income | sort 14 |
| Commission Calculator | life_income | sort 15 |

## Phase 3: Create 7 New Calculator Components

Build each calculator following the existing pattern (Props with onClose, Slider/input controls, useMemo results, brand green styling):

### Cash Flow Intelligence
- **DebtVsInvesting.tsx** - Compares effective debt rate vs investment return, recommends "pay debt" or "invest more," shows 10-year wealth difference
- **PurchasingPower.tsx** - Historical CPI-based tool showing adjusted value, % decrease, dollar loss, inflation multiple

### Retirement Intelligence
- **InflationRetirement.tsx** - Shows required income at retirement, total needed, inflation gap, cost of waiting
- **HabitsWealth.tsx** - Converts recurring spending into future wealth with opportunity cost and multiplier

### Life and Income
- **LifetimeEarnings.tsx** - Projects total career earnings with Recharts line chart of income growth
- **InsuranceLongevity.tsx** - Shows how long coverage lasts with balance depletion chart and shortfall warnings
- **CommissionCalculator.tsx** - Calculates advance vs residual split, monthly/annual projections, chargeback buffer

Each calculator will use:
- Recharts for data visualization (line/bar charts where applicable)
- Animated number counters for key results
- Insight boxes with dynamic recommendations
- Context-aware disclaimers

## Phase 4: Redesign ToolsHub.tsx with Modern Animated UI

Transform the Tools Hub into a visually stunning, animated experience:

### Quoting Tab Enhancements
- **Header section** with gradient text: "Quick Access to Quote Systems" and descriptive subtitle
- **Framer Motion staggered animations** on card grid (spring physics, 50ms stagger delay)
- **3D hover effects** using CSS perspective/transform (rotateY/rotateX on hover)
- **Gradient hover borders** that shift color per card
- **Carrier logo display** with fallback icon
- **Badge system** for tool types with color-coded pills
- **Lock icon badge** for login-required tools
- **Footer note** explaining the lock icon

### Calculators Tab Enhancements
- **Category hero titles** with taglines:
  - Cash Flow Intelligence: "See what inflation steals -- and what strategy protects"
  - Retirement Intelligence: "Plan the life you want -- not the one inflation leaves you"
  - Life and Income: "Build trust through education -- not pressure"
- **Animated category transitions** when switching filter pills
- **3D card hover** with subtle rotateY/rotateX perspective transforms
- **Gradient accent bars** on the left edge of each calculator card
- **Estimated time badges** with animated dot indicator
- **Category disclaimers** at the bottom of each section
- **Smooth card entrance** with scale-in and fade animations

### Shared Animation System
- Container variants with staggerChildren for grid items
- Individual card variants: initial hidden/scaled-down, animate visible/full-scale
- Spring-based hover lift (y: -6) with shadow elevation
- CSS perspective transforms for 3D depth on hover
- Framer Motion AnimatePresence for tab/filter transitions

## Phase 5: Update CALC_COMPONENTS Map

Extend the component registry in ToolsHub.tsx to include all 7 new calculators, mapping their database names to the new React components.

## Files to Create
- `src/pages/portal/advisor/calculators/DebtVsInvesting.tsx`
- `src/pages/portal/advisor/calculators/PurchasingPower.tsx`
- `src/pages/portal/advisor/calculators/InflationRetirement.tsx`
- `src/pages/portal/advisor/calculators/HabitsWealth.tsx`
- `src/pages/portal/advisor/calculators/LifetimeEarnings.tsx`
- `src/pages/portal/advisor/calculators/InsuranceLongevity.tsx`
- `src/pages/portal/advisor/calculators/CommissionCalculator.tsx`

## Files to Edit
- `src/pages/portal/advisor/ToolsHub.tsx` - Full redesign with Framer Motion, 3D effects, new component imports, updated category data

## Technical Notes
- All new calculators follow the existing `{ onClose: () => void }` props interface
- Framer Motion is already installed and used throughout the project
- Recharts is already installed for chart visualizations
- Brand green (#1A4D3E) remains the primary accent color
- The existing 8 calculator components remain unchanged
- Database category values (`cash_flow`, `retirement`, `life_income`) match the existing filter system

