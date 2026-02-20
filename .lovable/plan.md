

# Auto-Create Income Transaction from Sale Commissions

## What Changes

When an agent logs a sale, the system will automatically insert a matching income transaction into `advisor_transactions` so it appears on the Data tab.

### Commission Logic
- **Monthly premium selected**: Income = annual premium x 75% (i.e., monthly x 12 x 0.75)
- **Annual premium selected**: Income = annual premium x 100%

### Transaction Details
The auto-created transaction will include:
- Type: "income"
- Amount: calculated commission (75% or 100% of annual)
- Category: "Commission"
- Account Name: carrier name (e.g., "F&G", "Moo")
- Memo: "Auto: [Carrier] - [Product Type] ([premium mode])"
- Transaction Date: today's date

## Technical Details

### File Modified
- `src/pages/portal/advisor/PerformanceTracker.tsx`

### Change Location
The `handleSaleSubmit` function (lines 231-240) will be updated. After the sale is successfully inserted, a second insert into `advisor_transactions` will run automatically:

```typescript
// After successful sale insert:
const commissionAmount = newSale.premium_mode === "monthly"
  ? annual * 0.75   // 75% of annualized premium
  : annual;          // 100% of annual premium

await supabase.from("advisor_transactions").insert({
  advisor_id: advisorId,
  type: "income",
  amount: commissionAmount,
  category: "Commission",
  account_name: newSale.carrier,
  memo: `Auto: ${newSale.carrier} - ${newSale.product_type} (${newSale.premium_mode})`,
  transaction_date: new Date().toISOString().split("T")[0],
});
```

After the transaction is created, both the sales and transactions lists will be reloaded so the Data tab immediately reflects the new income entry.

No database schema changes are needed -- the existing `advisor_transactions` table already supports this.

