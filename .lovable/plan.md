

# Fix Hans's Role in CRM Routing Configuration

## Current Blocker

The database is returning connection timeout errors on all queries. This plan requires two sequential steps that depend on live data, so it cannot be fully executed until the database recovers.

## Step 1: Query Agent IDs

Once the database is available, run:

```text
SELECT id, email, name 
FROM crm_agents 
WHERE email IN (
  'steven@delsolprimehomes.com',
  'hans@delsolprimehomes.com',
  'nederlands@delsolprimehomes.com',
  'cindy@delsolprimehomes.com',
  'cedric@delsolprimehomes.com',
  'nathalie@delsolprimehomes.com',
  'augustin@delsolprimehomes.com',
  'juho@delsolprimehomes.com',
  'eetu@delsolprimehomes.com',
  'artur@delsolprimehomes.com'
);
```

And query the current config:

```text
SELECT id, language, agent_ids, fallback_admin_id 
FROM crm_round_robin_config 
ORDER BY language;
```

## Step 2: Update Each Language Row

Using the UUIDs from Step 1, execute 6 UPDATE statements (one per language). The template for each:

| Language | agent_ids | fallback_admin_id |
|----------|-----------|-------------------|
| en | `{steven_id}` | `steven_id` |
| de | `{}` (empty array) | `steven_id` |
| nl | `{nederlands_id, cindy_id}` | `steven_id` |
| fr | `{cedric_id, nathalie_id, augustin_id}` | `steven_id` |
| fi | `{juho_id, eetu_id}` | `hans_id` |
| pl | `{artur_id}` | `hans_id` |

```text
-- Template (IDs filled after Step 1):
UPDATE crm_round_robin_config SET agent_ids = '{...}', fallback_admin_id = '...' WHERE language = 'en';
UPDATE crm_round_robin_config SET agent_ids = '{...}', fallback_admin_id = '...' WHERE language = 'de';
UPDATE crm_round_robin_config SET agent_ids = '{...}', fallback_admin_id = '...' WHERE language = 'nl';
UPDATE crm_round_robin_config SET agent_ids = '{...}', fallback_admin_id = '...' WHERE language = 'fr';
UPDATE crm_round_robin_config SET agent_ids = '{...}', fallback_admin_id = '...' WHERE language = 'fi';
UPDATE crm_round_robin_config SET agent_ids = '{...}', fallback_admin_id = '...' WHERE language = 'pl';
```

## Step 3: Verify

```text
SELECT rr.language, rr.agent_ids, rr.fallback_admin_id,
  (SELECT email FROM crm_agents WHERE id = rr.fallback_admin_id) as admin_email
FROM crm_round_robin_config rr
ORDER BY rr.language;
```

## What Changes

- Hans is removed from `agent_ids` for EN, DE, NL, FR (no more T+0 to T+4 alerts for those languages)
- Hans remains as `fallback_admin_id` for FI and PL only (T+5 admin escalation)
- Any unknown agents ("John Melvin", "bryd mel") are removed from all arrays
- Steven becomes `fallback_admin_id` for EN, DE, NL, FR

## What Does NOT Change

- No code changes to any edge functions
- No schema changes
- Agent records in `crm_agents` table remain untouched
- Routing logic in `register-crm-lead` and alarm functions stays the same

## Note

This plan will be implemented as soon as the database connection recovers. The UUIDs must be looked up live — they cannot be hardcoded without verification.

