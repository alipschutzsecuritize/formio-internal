# AGENTS.md

## Project Context

This is a Vite + React + Material UI app wrapping `formiojs`.

Primary goal: let users build Form.io forms, preview them live, inspect/copy a cleaned components JSON payload, and reuse panels/fieldsets/columns through a Saved Panels section in the Form.io builder sidebar.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Important Files

- `src/App.jsx` mounts Form.io, syncs schema, handles preview, saved panels, and localStorage.
- `src/formio-overrides.css` controls Form.io layout and sidebar behavior.
- `src/utils/panelUtils.js` extracts panels and sanitizes exported JSON.
- `src/components/BuilderSection.jsx` owns the builder/preview two-column layout.
- `README.md` is the quick start and feature summary.
- `ARCHITECTURE.md` is the technical design and data-flow reference.

## LocalStorage Keys

- `formio.builder.schema.v1` stores the full Form.io schema.
- `formio.builder.panels.v1` stores saved panel definitions.
- `formio.builder.deletedPanels.v1` stores saved panel keys hidden by the delete button.

## Editing Notes

- Do not remount the Form.io builder when `savedPanels` changes. Remounting interrupts editing and looks like constant refresh.
- Saved panels are currently injected into Form.io's native builder sidebar config. The visible Saved Panels list is not a separate React panel.
- The delete X for saved panels removes the current DOM item and persists the deletion key so auto-extraction does not immediately recreate it.
- Keep the builder structure as two top-level columns: builder on the left, preview on the right.
- Inside the builder, `.formcomponents` is the component list and `.formarea` is the scrollable form canvas.
- Run `npm run build` after behavior or layout changes.
