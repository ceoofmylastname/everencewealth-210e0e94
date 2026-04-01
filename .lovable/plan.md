

## Replace "Agent" with "Advisor" on Public-Facing Response Card

### What changes
Replace every user-visible occurrence of "agent" with "advisor" in `src/pages/ResponseCard.tsx`. Internal variable names stay unchanged.

### Strings to update

| Line | Current text | New text |
|------|-------------|----------|
| 28 | `"Your Agent"` | `"Your Advisor"` |
| 40 | `"Please select an agent"` | `"Please select an advisor"` |
| 336 | `"Let's start by connecting you with your agent."` | `"Let's start by connecting you with your advisor."` |
| 338 | `"Select the agent who invited you."` | `"Select the advisor who invited you."` |
| 364 | `"Select your agent…"` | `"Select your advisor…"` |
| 401 | `"No agents match your search"` | `"No advisors match your search"` |
| 448 | `"Selected Agent"` | `"Selected Advisor"` |

### File
- `src/pages/ResponseCard.tsx` — 7 string replacements, no logic changes

