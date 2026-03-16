

## Fix Summary

### Bug 1 — `[DONE]` in UI
Already fixed. Both streaming blocks at lines 119 and 225 correctly check `if (!jsonStr || jsonStr === "[DONE]") continue;`. No code change needed.

### Bug 2 — Pinecone zero matches
The `PINECONE_INDEX_URL` secret needs to be updated to the correct index URL:
```
https://everencewealth-rv7l8s6.svc.aped-4627-b74a.pinecone.io
```

**Action:** Update the `PINECONE_INDEX_URL` secret using `update_secret`.

**Note:** After updating the URL, the PDF will likely need to be re-uploaded/re-ingested since the vectors were written to the old index. The new index may be empty.

### Technical detail
Both edge functions (`underwriting-process` and `underwriting-chat`) use the same `PINECONE_INDEX_URL` env var, so updating the secret fixes both ingestion and querying in one step.

