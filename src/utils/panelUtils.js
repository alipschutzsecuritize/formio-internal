const STORAGE_KEY_SCHEMA = "formio.builder.schema.v1";
const STORAGE_KEY_PANELS = "formio.builder.panels.v1";

const fallbackSchema = {
  display: "form",
  components: []
};

export function extractPanels(schema) {
  const panels = [];
  
  function traverse(components, parentPath = []) {
    if (!Array.isArray(components)) return;
    
    components.forEach((component, index) => {
      const currentPath = [...parentPath, index];
      
      if (component.type === "panel" || component.type === "fieldset" || component.type === "columns") {
        const panelCopy = JSON.parse(JSON.stringify(component));
        panels.push({
          id: component.key || `${component.type}_${Date.now()}_${Math.random()}`,
          label: component.label || component.title || `${component.type} ${index + 1}`,
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
