

## Plan: Add footnote rules to STRICT OUTPUT RULES

**What changes:** Insert 4 new bullet points after line 139 (the "Never ask clarifying questions" rule) in the system prompt, before the blank line that precedes `RESPONSE FORMAT:`.

**Lines affected:** 139-140 in `supabase/functions/underwriting-chat/index.ts`

**New content after line 139:**
```
- When carrier guidelines use footnote references such as "See '*' Below" or "See '#' Below", always look up and include the full footnote text in your answer. Never give a decision without reading what the footnote says.
- The '#' footnote for diabetes in American Amicable Term Made Simple means: eligible for Standard coverage IF not diagnosed before age 35, not on insulin, no tobacco in past 12 months, and not combined with overweight, gout, retinopathy, or protein in urine. This is NOT an automatic decline.
- The '*' footnote for high blood pressure means: eligible if controlled with two or fewer medications. Three or more medications = decline.
- Never summarize a footnote reference as a decline unless the footnote itself says decline.
```

**Post-edit:** Redeploy the `underwriting-chat` edge function.

