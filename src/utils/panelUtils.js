const STORAGE_KEY_SCHEMA = "formio.builder.schema.v1";
const STORAGE_KEY_PANELS = "formio.builder.panels.v1";

const fallbackSchema = {
  display: "form",
  components: []
};

export function extractPanels(schema) {
  const panels = [];
  let panelCount = 0;
  
  function traverse(components, parentPath = []) {
    if (!Array.isArray(components)) return;
    
    components.forEach((component, index) => {
      const currentPath = [...parentPath, index];
      
      if (component.type === "panel" || component.type === "fieldset" || component.type === "columns") {
        panelCount++;
        const panelCopy = JSON.parse(JSON.stringify(component));
        
        // Generate a consistent key using component properties
        // Priority: component.key > component.id > generated from path + type + title
        let panelKey = component.key;
        if (!panelKey && component.id) {
          panelKey = component.id;
        }
        if (!panelKey) {
          // Generate from title/label if available (more consistent than random)
          const label = component.title || component.label;
          if (label) {
            panelKey = `${component.type}_${label.toLowerCase().replace(/\s+/g, '_')}`;
          } else {
            // Fallback: use path (will be consistent as long as structure doesn't change)
            panelKey = `${component.type}_${currentPath.join('_')}`;
          }
        }
        
        // Try to get a meaningful title/label from various properties
        let displayTitle = 
          component.title || 
          component.label || 
          component.display ||
          component.key || 
          component.placeholder ||
          (component.properties && component.properties.displayTitle) ||
          (component.properties && component.properties.legend);
        
        // If still no title or it's generic, use counter
        if (!displayTitle || displayTitle === "Untitled" || displayTitle.trim() === "" || displayTitle === "Panel" || displayTitle === "Fieldset" || displayTitle === "Columns") {
          displayTitle = `${component.type.charAt(0).toUpperCase() + component.type.slice(1)} ${panelCount}`;
        }
        
        panels.push({
          id: panelKey,
          key: panelKey,
          title: displayTitle,
          label: displayTitle,
          type: component.type,
          data: panelCopy,
          lastUpdated: Date.now()
        });
      }
      
      if (component.components && Array.isArray(component.components)) {
        traverse(component.components, [...currentPath, "components"]);
      }
      if (component.columns && Array.isArray(component.columns)) {
        component.columns.forEach((column, colIndex) => {
          if (column.components) {
            traverse(column.components, [...currentPath, "columns", colIndex, "components"]);
          }
        });
      }
    });
  }
  
  traverse(schema.components || []);
  return panels;
}

export function loadSchema() {
  const rawSchema = localStorage.getItem(STORAGE_KEY_SCHEMA);
  if (!rawSchema) {
    return fallbackSchema;
  }

  try {
    const parsed = JSON.parse(rawSchema);
    if (!parsed || !Array.isArray(parsed.components)) {
      return fallbackSchema;
    }

    return parsed;
  } catch {
    return fallbackSchema;
  }
}

export function stripKeysDeep(value, keysToStrip) {
  if (Array.isArray(value)) {
    return value.map((item) => stripKeysDeep(item, keysToStrip));
  }

  if (value && typeof value === "object") {
    const cleaned = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (keysToStrip.has(key)) {
        continue;
      }
      cleaned[key] = stripKeysDeep(nestedValue, keysToStrip);
    }
    return cleaned;
  }

  return value;
}

export function pruneCompactValue(value) {
  if (Array.isArray(value)) {
    const compactArray = value
      .map((item) => pruneCompactValue(item))
      .filter((item) => item !== undefined);
    return compactArray.length ? compactArray : undefined;
  }

  if (value && typeof value === "object") {
    const compactObject = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const compactNested = pruneCompactValue(nestedValue);
      if (compactNested !== undefined) {
        compactObject[key] = compactNested;
      }
    }

    return Object.keys(compactObject).length ? compactObject : undefined;
  }

  if (value === null || value === "" || value === false) {
    return undefined;
  }

  return value;
}

export function getComponentsPayload(schema) {
  const keysToStrip = new Set(["display", "settings", "id"]);
  const components = Array.isArray(schema?.components) ? schema.components : [];
  const cleanedComponents = stripKeysDeep(components, keysToStrip);
  const compactComponents = pruneCompactValue(cleanedComponents) || [];

  return { components: compactComponents };
}

export { STORAGE_KEY_SCHEMA, STORAGE_KEY_PANELS, fallbackSchema };
