

## Update Name: "Admin User" → "John Melvin"

### What needs to change
Your name "Admin User" exists in **two database tables** that both need updating:

1. **portal_users** — `id: e82dd92c...` — `first_name: Admin, last_name: User` → `first_name: John, last_name: Melvin`
2. **advisors** — `id: 2202819c...` — `first_name: Admin, last_name: User` → `first_name: John, last_name: Melvin`

### How
Two simple UPDATE statements using the database insert tool. No code changes needed — the UI already reads these fields dynamically.

### Result
Your name will display as "John Melvin" everywhere: the sidebar, settings page, response card submissions, and anywhere else your profile appears.

