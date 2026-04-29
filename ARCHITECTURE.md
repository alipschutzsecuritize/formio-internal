# Architecture

This app is a Vite + React + Material UI shell around `formiojs`.

The core design choice is to let Form.io own the builder and preview internals, while React owns page layout, state persistence, JSON display, copy actions, and integration glue.

## Runtime Flow

```text
Form.io builder
  -> builder change events
  -> React schema state
  -> localStorage schema persistence
  -> panel extraction
  -> preview form re-render
  -> components JSON viewer update

Preview form
  -> Form.io internal data
  -> 100ms polling
  -> React submissionData state
  -> Entered Data JSON update
```

## Main Modules

- `src/App.jsx` mounts Form.io, owns schema/submission/saved panel state, syncs localStorage, renders preview, and handles saved panel deletion.
- `src/components/BuilderSection.jsx` keeps the top-level builder + preview two-column structure.
- `src/components/SchemaSection.jsx` renders the cleaned components payload and copy action.
- `src/components/DataSection.jsx` renders live preview submission data.
- `src/components/JsonTree.jsx` renders collapsible JSON nodes.
- `src/components/SurfaceCard.jsx` provides the shared MUI shell for each section.
- `src/utils/panelUtils.js` contains pure helpers for panel extraction and JSON cleanup.
- `src/formio-overrides.css` contains Form.io-specific layout and styling overrides.

## Saved Panels

Saved panels are not rendered as a separate visible React panel. They are injected into Form.io's native builder sidebar as a custom builder group titled `Saved Panels`.

Panel lifecycle:

```text
schema changes
  -> extractPanels(schema)
  -> filter deleted panel keys
  -> merge new/updated saved panels
  -> persist formio.builder.panels.v1
```

Important behavior:

- The Form.io builder must be mounted once. Do not add `savedPanels` as a dependency to the builder mount effect.
- Saved panel delete buttons are injected into the Form.io sidebar item title HTML.
- Clicking the delete button removes that sidebar item from the current DOM and stores its key in `formio.builder.deletedPanels.v1`.
- Deleted panel keys prevent auto-extraction from immediately recreating hidden panels.

## Layout

The main structure remains:

```text
Build the form | Final result
JSON schema    | Entered data
```

Inside the Form.io builder:

```text
.formcomponents | .formarea
component list  | scrollable builder canvas
```

The component list stays available while the builder canvas scrolls. This behavior is controlled in `src/formio-overrides.css`, not in React.

## Persistence

Browser `localStorage` keys:

- `formio.builder.schema.v1` stores the full Form.io schema.
- `formio.builder.panels.v1` stores saved panel definitions.
- `formio.builder.deletedPanels.v1` stores saved panel keys hidden with the delete button.

Reset all local state by removing those keys in browser DevTools and refreshing.

## Exported JSON

The export payload shape is:

```json
{
  "components": []
}
```

Cleanup rules live in `src/utils/panelUtils.js`:

- remove `display`, `settings`, and `id`
- remove `null`
- remove empty strings
- remove `false`
- remove empty arrays
- remove empty objects

## Form Data Capture

The preview form uses Form.io's internal `form.data`. The app polls every 100ms and only updates React state when the serialized data changes.

This polling approach is intentionally pragmatic because some Form.io components do not emit React-friendly events consistently.

## Files To Treat Carefully

- `src/App.jsx`: small dependency changes can remount Form.io and interrupt editing.
- `src/formio-overrides.css`: Bootstrap/Form.io classes can override widths and scroll behavior unexpectedly.
- `src/utils/panelUtils.js`: changes affect saved panel extraction and exported JSON shape.

## Verification

Run after behavior or layout changes:

```bash
npm run build
```

Expected current caveat: Vite reports a large bundle warning because `formiojs` is large.
