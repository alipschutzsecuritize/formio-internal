# Architecture Documentation - Form Builder Studio v2

## Overview

Form Builder Studio v2 is built with React 19 and Material-UI, featuring a modular component architecture with clean separation of concerns. The application integrates Form.io's powerful form builder with a custom panel management system.

## Core Philosophy

1. **Modularity** - Each component has a single responsibility
2. **Reusability** - Components are composable and configurable
3. **Clarity** - Code is readable, well-commented, and maintainable
4. **Performance** - Efficient state management and polling mechanisms
5. **Persistence** - All data survives browser refresh via localStorage

## Component Architecture

### 1. App.jsx (Main Container)

**Responsibilities:**
- Initialize and manage Form.io builder instance
- Manage global state (schema, submission data, panels)
- Handle schema synchronization
- Orchestrate real-time data capture from preview form
- Manage localStorage persistence
- Inject Saved Panels into Formio DOM

**State:**
```javascript
{
  schema: FormioSchema,           // Current form schema
  submissionData: Object,         // Live form submission data
  copyStatus: String,             // UI feedback for copy action
  savedPanels: Array<Panel>       // Detected/saved panels
}
```

**Key Effects:**
1. `mountBuilder` - Initialize Form.io builder on mount
2. `syncSchema` - Persist schema changes and detect panels
3. `renderPreview` - Render preview form and capture data

### 2. BuilderSection.jsx

**Responsibilities:**
- Render two-column layout
- Mount builder reference DOM node
- Mount preview form DOM node

**Props:**
- `builderMountRef` - Ref to builder container
- `previewMountRef` - Ref to preview container

**Renders:**
```
┌─────────────────────────────────┐
│  Build the form | Final result  │
├─────────────────────────────────┤
│  [Builder]      │  [Preview]    │
│  (Formio)       │  (Formio)     │
└─────────────────────────────────┘
```

### 3. SchemaSection.jsx

**Responsibilities:**
- Visualize sanitized components JSON
- Provide copy-to-clipboard functionality
- Display user feedback

**Props:**
- `componentsPayload` - Sanitized components object
- `copyStatus` - UI message state
- `onCopy` - Callback for copy action

**Features:**
- Collapsible JSON tree via JsonTree component
- Dark theme JSON display
- Copy button with status feedback

### 4. DataSection.jsx

**Responsibilities:**
- Display live submission data from preview form
- Show form data as JSON
- Display copy status messages

**Props:**
- `submissionData` - Current form submission object
- `copyStatus` - UI feedback message

**Features:**
- Pre-formatted JSON output
- Updates via polling mechanism
- Shows all fields entered in preview form

### 5. JsonTree.jsx

**Responsibilities:**
- Recursively render JSON data
- Provide expand/collapse functionality
- Color-code data types
- Maintain consistent styling

**Props:**
- `value` - Any serializable value
- `nodeKey` - Label for object/array keys (optional)

**Features:**
- Distinguishes: objects, arrays, strings, numbers, booleans, null
- Nested navigation with indentation
- Summary counts for arrays/objects
- Responsive to large data structures

### 6. SavedPanelsPanel.jsx

**Responsibilities:**
- Render list of saved panels
- Enable drag-and-drop capability
- Show panel metadata (type, label)
- Handle empty state

**Props:**
- `panels` - Array of SavedPanel objects

**Panel Object Structure:**
```javascript
{
  id: String,           // Unique identifier
  label: String,        // User-visible name
  type: String,         // panel | fieldset | columns
  data: Object,         // Full component definition
  lastUpdated: Number   // Timestamp
}
```

### 7. SurfaceCard.jsx

**Responsibilities:**
- Provide consistent container styling
- Render header with icon, title, subtitle
- Support optional right-side action button
- Enable scrollable content area

**Props:**
- `icon` - Material-UI icon component
- `title` - Primary heading
- `subtitle` - Secondary description
- `children` - Content
- `rightAction` - Action button (optional)
- `minHeight` - Custom height constraint
- `scrollable` - Enable overflow scrolling

**Styling:**
- Gradient background
- Subtle shadow and border
- Position-relative for overlays
- Responsive padding/sizing

## Utility Functions (panelUtils.js)

### extractPanels(schema)

**Purpose:** Detect all panel-like components in a schema

**Algorithm:**
1. Traverse schema.components array recursively
2. Match types: "panel", "fieldset", "columns"
3. Handle nested structures (tabs, columns, panels)
4. Generate unique IDs from component keys or timestamp
5. Return array of panel definitions

**Edge Cases:**
- Empty schema returns empty array
- Deeply nested structures handled via recursion
- Missing labels use component type as fallback

### loadSchema()

**Purpose:** Retrieve persisted schema or return fallback

**Logic:**
1. Check localStorage for STORAGE_KEY_SCHEMA
2. Validate JSON parsing
3. Verify structure (has components array)
4. Return fallback if missing or invalid

**Fallback Schema:**
```javascript
{ display: "form", components: [] }
```

### getComponentsPayload(schema)

**Purpose:** Generate sanitized components export

**Process:**
1. Extract components array from schema
2. Strip keys: display, settings, id
3. Prune empty/null values
4. Return wrapped in components object

**Sanitization Rules:**
- Remove: null, "", false
- Remove empty arrays: []
- Remove empty objects: {}
- Removes deep within nested structures

### stripKeysDeep(value, keysToStrip)

**Purpose:** Recursively remove specified keys from object trees

**Handles:**
- Arrays (maps each element)
- Objects (filters keys, recurses values)
- Primitives (returns unchanged)

### pruneCompactValue(value)

**Purpose:** Remove falsy and empty values recursively

**Behavior:**
- null, "", false → undefined
- Empty arrays → undefined
- Empty objects → undefined
- Non-empty arrays/objects → keep recursively pruned
- Other values → pass through

## Data Flow & State Management

### Schema Change Flow
```
1. User edits builder
   ↓
2. Form.io emits "change" event
   ↓
3. syncSchema() reads builder.schema
   ↓
4. setSchema() updates React state
   ↓
5. useEffect triggers on schema dependency
   ↓
6. localStorage.setItem(STORAGE_KEY_SCHEMA)
   ↓
7. extractPanels(schema)
   ↓
8. setSavedPanels(panels)
   ↓
9. Update #panels-list DOM in Formio
```

### Real-time Data Capture
```
1. User types in preview form
   ↓
2. Formio updates form.data internally
   ↓
3. Polling every 100ms:
   - Read form.data
   - Compare JSON stringified version
   - setSubmissionData() if changed
   ↓
4. React re-renders DataSection
   ↓
5. User sees updated JSON
```

### Saved Panels Injection
```
1. Form.io builder renders
   ↓
2. setTimeout 500ms to ensure DOM ready
   ↓
3. Query .formcomponents container
   ↓
4. Create #saved-panels-container div
   ↓
5. Add title and panels list
   ↓
6. Append to formcomponents
   ↓
7. Panels become draggable into builder
```

## Performance Considerations

### Polling Strategy
- **Interval:** 100ms
- **Overhead:** Minimal - only JSON stringification comparison
- **Benefit:** Captures all form changes regardless of event system

### Component Re-renders
- JsonTree: Memoization via recursive structure (not Redux)
- SavedPanelsPanel: Updates only on schema changes
- DataSection: Updates only on data changes
- SurfaceCard: Pure presentation component

### Memory Management
- Form instances cleaned up on unmount via destroy()
- Polling intervals cleared on effect cleanup
- localStorage limited to schema + panels (typically < 100KB)

## localStorage Schema

### Keys
```
formio.builder.schema.v1
└─ JSON stringified Form.io schema

formio.builder.panels.v1
└─ JSON stringified array of SavedPanel objects
```

### Data Limits
- Schema: Typically 5-50KB (form with 50-500 components)
- Panels: Typically 1-10KB (10-50 saved panels)
- Total: Rarely exceeds 100KB browser limit

## Error Handling

### Missing localStorage
- Falls back to in-memory state
- Doesn't persist across refresh

### Invalid JSON in localStorage
- Caught via try/catch in loadSchema()
- Returns fallback schema
- User work is lost (design trade-off)

### Form.io Initialization Errors
- Async errors from Formio.builder() handled
- If fails, builder doesn't render
- Preview may still work

## Testing Considerations

### Unit Tests Targets
- panelUtils functions (pure, deterministic)
- Component prop validation
- JsonTree rendering edge cases

### Integration Tests Targets
- Schema save/load cycle
- Real-time data capture accuracy
- Panel detection and injection
- localStorage persistence

### Manual Tests
- Complex nested forms (tabs + panels + columns)
- Large schemas (1000+ components)
- Drag-drop panel insertion
- Cross-browser localStorage behavior

## Future Enhancements

### Possible Improvements
1. **Undo/Redo** - Schema history stack
2. **Collaborative Editing** - WebSocket sync
3. **Custom Validation** - Pre-save schema checks
4. **Export/Import** - JSON file download
5. **Template Library** - Pre-built form templates
6. **Version Control** - Schema versioning with diffs
7. **Analytics** - Track builder usage patterns

## Deployment Checklist

- [ ] `npm run build` succeeds
- [ ] No console errors in build output
- [ ] Static files generated in `dist/`
- [ ] localStorage keys documented
- [ ] Environment variables configured (if any)
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive verified
- [ ] Performance profiled (Lighthouse)
