

## Make Kie.ai images visualize the article concept (infographic-style)

The current prompt builder asks Gemini for "professional photography of people in consultation / financial advisory offices." That's why every image looks like the same advisor-and-couple stock shot, no matter the topic. Your reference (three glass buckets labeled Taxable / Tax-Deferred / Tax-Exempt with an "IRS Lien" stamp) is a **conceptual visual metaphor** — that's the style we should be producing.

### What changes

**1. Rewrite the system prompt in `regenerate-article-image/index.ts` (the only file changing)**

Replace the current "professional photography of people" directive with a **concept-first visual metaphor** directive. The model will be told to:

- Read the headline, theme, funnel stage, and content excerpt
- Identify the **core financial concept** (tax buckets, compounding, fees eroding growth, retirement income gap, IUL ladder, etc.)
- Translate that concept into a **physical, photorealistic still-life metaphor** — glass jars, stacks of coins, scales, hourglasses, ascending staircases, umbrella/shield protection, growing plants, dominoes, locked safes, bridges over gaps, etc.
- Compose it like editorial financial-magazine photography (think *Bloomberg Businessweek* or *The Economist* photo essays): clean studio backdrop, soft directional light, shallow depth of field, premium materials (glass, brass, marble, wood)
- Use **labels on physical objects** ONLY when they clarify the metaphor (like "Taxable" etched on a glass bucket) — otherwise still no text
- Keep the existing competitor-blacklist + negative-suffix protection

**2. Concept library mapped to article themes**

Bake a small mapping into the system prompt so the model has examples to reach for:

| Article topic | Visual metaphor |
|---|---|
| Tax buckets / Roth vs Traditional | Three glass jars with coins, labeled by tax treatment |
| Hidden fees / fee drag | Coins leaking from a cracked jar; or staircase with eroding steps |
| Compounding / growth | Tree growing from a coin; ascending stack of gold bars |
| Retirement income gap | Bridge spanning a chasm; two cliffs with a gap |
| IUL / cap-and-floor | A floor and ceiling around a rising arrow |
| Insurance protection | Umbrella over a family figurine; shield over a house |
| Estate planning | Wax-sealed envelope, family tree diagram in brass |
| Annuity income stream | Steady waterfall into a vessel; pipe with continuous gold flow |
| Inflation erosion | Ice cube melting on a dollar bill; shrinking balloon |
| Sequence-of-returns risk | Domino chain over a graph; uneven stairs |

The Gemini prompt-builder will pick the closest metaphor and elaborate it with lighting, materials, and composition.

**3. Allow minimal labels on physical objects**

Currently the negative suffix bans **all** text. The reference image you uploaded has labels ("Taxable", "Tax-Deferred", "Tax-Exempt", "IRS Lien", "Tax Bill"). To allow this we'll relax the rule slightly:

- **Allowed**: short single-word labels physically embossed/etched/printed on objects in the scene (jar labels, file folder tabs, envelope stamps) — max ~3 words per label, max 4 labels in the frame
- **Still banned**: company names, brand wordmarks, watermarks, signatures, photographer credits, headlines, paragraph text, captions, brand logos

The negative suffix will be retightened to: `--no company logos, no brand names, no watermarks, no signatures, no headlines, no paragraph text` (instead of the current "no letters, no words" which prevented the bucket-labels style entirely).

**4. Update the localized metadata generator** (alt text + caption)

Now that images are conceptual still-life rather than people in offices, the alt-text generator gets a small tweak so it describes the metaphor ("Three glass jars representing the three tax buckets…") instead of "Couple meeting with advisor."

**5. Logo verification still runs**

The auto-retry verification loop is unchanged — it still bounces any image that contains a real competitor logo. We're only changing the *creative direction*, not the safety net.

### What stays the same

- Kie.ai Nano Banana 2 still does the rendering (16:9, 2K, PNG)
- Storage upload, old-image cleanup, DB update — unchanged
- Logo-detection retry loop with up to 2 retries — unchanged
- Competitor blacklist — unchanged
- No UI changes, no schema changes, no other files touched

### How you'll verify it worked

1. After the change ships, click **Regenerate** on any article at `/admin/image-health`
2. The new image should be a conceptual still-life that visually represents the article's topic — not another advisor-couple stock photo
3. Try it on a tax-bucket article specifically and you should get something close to your reference image
4. Try it on a fees article and you should get the cracked-jar / eroding-staircase metaphor

### Out of scope

- No changes to the cluster generator's first-time image creation (we can apply the same change there next, once you confirm you like the new style)
- No changes to the scan/detection logic
- No changes to UI components

