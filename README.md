# Form Builder Studio

Material UI redesign for a Form.io builder workspace.

It includes:

- Drag-and-drop Form.io builder
- Live preview of the generated form
- Live submission data JSON
- Cleaned components JSON in a collapsible tree
- Copy-to-clipboard for the exported components payload
- Autosave to `localStorage`

## Requirements

- Node.js 20+ recommended
- npm

## Install

```bash
cd /Users/ariellipschutz/Proyectos/securitize/formio
npm install
```

## Run in development

```bash
npm run dev
```

Open:

- [http://localhost:5173](http://localhost:5173)

## Build for production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Exported JSON behavior

The schema export is sanitized before rendering and copying:

- Output shape is `{ "components": [...] }`
- Removes `display`, `settings`, and `id`
- Removes empty values like `null`, `""`, `false`, empty arrays, and empty objects

## Persistence

The builder schema is saved automatically in browser `localStorage` under:

- `formio.builder.schema.v1`

To reset it, remove that key from DevTools and refresh the page.

## Main files

- `src/App.jsx` - main app layout and Form.io integration
- `src/main.jsx` - Material UI theme and app bootstrap
- `src/formio-overrides.css` - Form.io visual overrides inside the MUI shell
- `index.html` - app entry HTML
