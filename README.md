# Form Builder Studio v2

A modern Material UI redesign for Form.io builder workspace with a clean, modular architecture.

## ✨ Features

- **Drag-and-drop Form.io builder** - Full form component editor
- **Live preview** - See your form render in real-time as you build
- **Real-time data capture** - Live JSON display of form submissions
- **Saved Panels** - Save and reuse form panels, fieldsets, and column layouts
- **Schema visualization** - Collapsible JSON tree for components
- **Copy-to-clipboard** - Export sanitized components payload
- **Auto-save** - Schema and panels persist to `localStorage`
- **Hot-reload** - Instant updates during development
- **No rounded borders** - Clean, modern aesthetic

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

The builder schema and saved panels are automatically persisted to `localStorage`:

- `formio.builder.schema.v1` - Full form schema with all components
- `formio.builder.panels.v1` - Array of saved panel definitions

To reset, remove these keys from DevTools and refresh the page.

## Architecture

### Directory Structure

```
src/
├── App.jsx                    # Main app container, form orchestration
├── main.jsx                   # React bootstrap, Material-UI theme
├── formio-overrides.css       # Form.io styling overrides
│
├── components/                # Modular UI components
│   ├── SurfaceCard.jsx        # Reusable content container with header
│   ├── BuilderSection.jsx     # Two-column layout: builder + preview
│   ├── SchemaSection.jsx      # JSON schema viewer with copy button
│   ├── DataSection.jsx        # Live form submission data display
│   ├── JsonTree.jsx           # Collapsible JSON tree visualizer
│   └── SavedPanelsPanel.jsx   # Saved panels list with drag support
│
└── utils/
    └── panelUtils.js          # Utility functions for panel management
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| **App.jsx** | Orchestrates Form.io builder, manages state, syncs schema changes, captures form data |
| **BuilderSection** | Renders side-by-side builder and preview forms |
| **SchemaSection** | Displays sanitized components JSON with copy functionality |
| **DataSection** | Shows live submission data updated in real-time |
| **JsonTree** | Recursively renders expandable/collapsible JSON nodes |
| **SavedPanelsPanel** | Lists saved panels with drag-and-drop into builder |
| **SurfaceCard** | Wrapper component for consistent card styling across sections |

### Utilities (panelUtils.js)

| Function | Purpose |
|----------|---------|
| `extractPanels(schema)` | Recursively finds panel/fieldset/columns in schema, returns array |
| `loadSchema()` | Retrieves schema from localStorage or returns fallback |
| `getComponentsPayload(schema)` | Sanitizes components: strips display/settings/id, removes empty values |
| `stripKeysDeep(value, keysToStrip)` | Deep recursive key removal from objects |
| `pruneCompactValue(value)` | Removes null, empty strings, false, empty arrays/objects |

### Data Flow

```
Form.io Builder → syncSchema() → setSchema()
                                    ↓
                          extractPanels()
                                    ↓
                              setSavedPanels()
                          localStorage + UI Update
                                    ↓
                          Preview Form Renders
                                    ↓
                          Polling every 100ms → form.data
                                    ↓
                          setSubmissionData() → real-time update
```

### Key Features Deep Dive

#### Saved Panels
- Auto-detect panels, fieldsets, and column layouts from schema
- Display in sidebar under main Form.io components
- Drag any saved panel directly into the builder
- Persistent across sessions via localStorage
- Update automatically when schema changes

#### Real-time Data Sync
- Polling mechanism reads `form.data` every 100ms
- Changes detected via JSON stringification comparison
- Updates "Entered data" section with zero lag
- Works for all component types (text, selects, radios, etc.)

#### Schema Export
Sanitized JSON component payload:
- Removes `display`, `settings`, `id` fields
- Removes null, empty strings, false boolean, empty arrays, empty objects
- Output shape: `{ "components": [...] }`
- Copy-to-clipboard ready

## Main Files

- **src/App.jsx** - Main orchestration and Form.io integration
- **src/components/** - 6 modular, reusable React components
- **src/utils/panelUtils.js** - Shared utilities for schema/panel management
- **src/main.jsx** - Material-UI theme and app bootstrap
- **src/formio-overrides.css** - Form.io visual tweaks in MUI shell
- **index.html** - HTML entry point
