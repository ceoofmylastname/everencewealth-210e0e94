-- Fix: trg_auto_advance_pipeline only fired AFTER UPDATE, but the agreement
-- form (and any first-time step completion) INSERTs the contracting_agent_steps
-- row via upsert. The trigger therefore never fired for first-time signers and
-- agents were stuck on the signing screen with pipeline_stage unchanged.
-- Rebind on INSERT OR UPDATE. The function is idempotent, so firing on
-- redundant updates of already-completed rows is harmless.
DROP TRIGGER IF EXISTS trg_auto_advance_pipeline ON contracting_agent_steps;
CREATE TRIGGER trg_auto_advance_pipeline
  AFTER INSERT OR UPDATE ON contracting_agent_steps
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION auto_advance_pipeline_stage();

-- Retroactively advance agents who signed while the trigger was broken:
-- touching completed rows re-fires the fixed trigger for each of them.
UPDATE contracting_agent_steps SET updated_at = now() WHERE status = 'completed';
