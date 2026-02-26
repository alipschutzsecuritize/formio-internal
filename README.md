# Form.io Builder Playground

A lightweight Form.io builder playground that includes:

- Drag-and-drop form builder
- Live form preview
- Live submission data JSON
- Components JSON viewer (expand/collapse, colored)
- Copy-to-clipboard for components JSON
- Auto-save form schema to `localStorage`

## Requirements

- A modern browser (Chrome, Edge, Firefox, Safari)
- Python 3 (for a quick local static server)

## Run locally

From the project folder:

```bash
cd /Users/ariellipschutz/Proyectos/securitize/formio
python3 -m http.server 8080
```

Open:

- [http://localhost:8080](http://localhost:8080)

## How it works

- The builder (left panel) updates the live preview (right panel).
- Every component change is saved to browser `localStorage` under:
  - `formio.builder.schema.v1`
- The generated JSON panel shows a sanitized payload:
  - Shape: `{ "components": [...] }`
  - Removes noisy keys like `display`, `settings`, and `id`
  - Compacts empty values for a cleaner output

## Reset saved form

If you want a fresh start, clear the saved key in browser DevTools:

1. Open DevTools
2. Go to Application/Storage > Local Storage
3. Remove `formio.builder.schema.v1`
4. Refresh the page

## Project files

- `index.html` - page structure and CDN imports
- `styles.css` - layout and custom styles
- `app.js` - Form.io builder/preview logic, persistence, JSON rendering
