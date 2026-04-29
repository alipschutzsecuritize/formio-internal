# Form Builder Studio v2

Material UI + Form.io workspace for building forms, previewing them live, inspecting generated JSON, and reusing saved form sections.

## Features

- Drag-and-drop Form.io builder
- Live working form preview
- Live submission data JSON
- Collapsible components JSON viewer
- Copy-to-clipboard for exported components JSON
- Autosave schema and saved panels to `localStorage`
- Saved Panels section inside the Form.io builder sidebar
- Delete button on each saved panel to hide unused panels
- Fixed component sidebar while the builder form area scrolls

## Requirements

- Node.js 20+ recommended
- npm

## Install

```bash
cd /Users/ariellipschutz/Proyectos/securitize/formio
npm install
```

## Run

```bash
npm run dev
```

Open:

- [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Exported JSON

The exported schema is sanitized before rendering/copying:

- Output shape: `{ "components": [...] }`
- Removes `display`, `settings`, and `id`
- Removes empty values like `null`, `""`, `false`, empty arrays, and empty objects

## Persistence

The app persists data in browser `localStorage`:

- `formio.builder.schema.v1` - Full Form.io schema
- `formio.builder.panels.v1` - Saved panel definitions
- `formio.builder.deletedPanels.v1` - Saved panel keys hidden via the delete button

To fully reset local data, remove those keys from DevTools and refresh.

## Documentation

- `README.md` is the quick start and user-facing feature summary.
- `ARCHITECTURE.md` is the technical design and data-flow reference.
- `AGENTS.md` is the short operational context for future agent sessions.

## Project Structure

```text
src/
  App.jsx                    Main orchestration and Form.io integration
  main.jsx                   React bootstrap and Material UI theme
  formio-overrides.css       Form.io layout/styling overrides
  components/
    BuilderSection.jsx       Builder + preview two-column section
    DataSection.jsx          Live submission data display
    JsonTree.jsx             Collapsible JSON tree
    SchemaSection.jsx        Components JSON viewer + copy action
    SurfaceCard.jsx          Shared card shell
    SavedPanelsPanel.jsx     Legacy/unmounted saved panels component
    SavedPanelsLibrary.jsx   Legacy/unmounted saved panels component
  utils/
    panelUtils.js            Schema, panel extraction, and JSON cleanup helpers
```
