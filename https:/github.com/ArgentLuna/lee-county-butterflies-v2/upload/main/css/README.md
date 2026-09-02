# Cape Coral butterflies **v2**

This is **v2** of the Lee County / Cape Coral butterfly field guide (static site).

- **OG (unchanged):** https://argentluna.github.io/lee-county-butterflies/
- This v2 site must **never replace** OG. Ship it to a **new** public GitHub Pages repo only.
- **GitHub Pages only.** No Vercel. No custom domain purchase.

## What is new in v2

Cached public iNaturalist layer (no API keys):

- `data/inat-lee-recent.json` — research-grade butterfly observations in Lee County (place_id 2583), last ~28 days
- `data/inat-lee-species-counts.json` — species counts for the same window
- Home page **"Seen lately in Lee County"** section (loads those JSON files via `fetch`)

First-ship species pages are still the locked 20 from OG. Taxa that appear in iNat but are not in those 20 are shown as name + count only (no new pages, no invented facts).

## Open locally

```
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/

`fetch` for the iNat caches needs a local server (file:// will fail soft).

## Layout

- `index.html` — home list + Seen lately strip
- `species/` — one HTML page per first-ship species (20)
- `data/species.json` — guide copy fields
- `data/inat-lee-*.json` — cached iNat public API snapshots
- `css/guide.css`
- `js/guide.js` — filters, chips, Seen lately render
- `img/` — species images
