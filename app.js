const STORAGE_KEY_SCHEMA = "formio.builder.schema.v1";

const fallbackSchema = {
  display: "form",
  components: []
};

const builderElement = document.getElementById("builder");
const previewElement = document.getElementById("preview");
const submissionJsonElement = document.getElementById("submission-json");
const schemaJsonElement = document.getElementById("schema-json");
const copySchemaButton = document.getElementById("copy-schema");
const copyStatusElement = document.getElementById("copy-status");

let builderInstance;
let formInstance;
let currentSchema = loadSchema();
let currentSubmissionData = {};

function getComponentsOnly() {
  return Array.isArray(currentSchema?.components) ? currentSchema.components : [];
}

function stripKeysDeep(value, keysToStrip) {
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

function pruneCompactValue(value) {
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

function getComponentsPayload() {
  const keysToStrip = new Set(["display", "settings", "id"]);
  const cleanedComponents = stripKeysDeep(getComponentsOnly(), keysToStrip);
  const compactComponents = pruneCompactValue(cleanedComponents) || [];
  return { components: compactComponents };
}

function loadSchema() {
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

function saveSchema(schema) {
  localStorage.setItem(STORAGE_KEY_SCHEMA, JSON.stringify(schema));
}

function formatPrimitive(value) {
  return JSON.stringify(value);
}

function appendKeyNode(target, keyLabel) {
  if (!keyLabel) {
    return;
  }

  const keySpan = document.createElement("span");
  const isArrayIndex = keyLabel.startsWith("[");
  keySpan.className = isArrayIndex ? "json-index" : "json-key";
  keySpan.textContent = isArrayIndex ? keyLabel : `"${keyLabel}"`;
  target.appendChild(keySpan);
  target.append(": ");
}

function appendPrimitiveNode(target, value) {
  const primitiveSpan = document.createElement("span");
  if (value === null) {
    primitiveSpan.className = "json-null";
  } else if (typeof value === "string") {
    primitiveSpan.className = "json-string";
  } else if (typeof value === "number") {
    primitiveSpan.className = "json-number";
  } else if (typeof value === "boolean") {
    primitiveSpan.className = "json-boolean";
  } else {
    primitiveSpan.className = "json-value";
  }
  primitiveSpan.textContent = formatPrimitive(value);
  target.appendChild(primitiveSpan);
}

function buildJsonTreeNode(value, keyLabel = "") {
  const wrapper = document.createElement("div");
  wrapper.className = "json-tree-node";

  if (value === null || typeof value !== "object") {
    appendKeyNode(wrapper, keyLabel);
    appendPrimitiveNode(wrapper, value);
    return wrapper;
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value);

  const details = document.createElement("details");
  details.className = "json-tree-details";
  details.open = true;

  const summary = document.createElement("summary");
  const previewCount = isArray ? `${value.length} items` : `${entries.length} keys`;
  appendKeyNode(summary, keyLabel);

  const tokenSpan = document.createElement("span");
  tokenSpan.className = "json-summary-token";
  tokenSpan.textContent = isArray ? "[ ... ]" : "{ ... }";
  summary.appendChild(tokenSpan);

  summary.append(` `);
  const metaSpan = document.createElement("span");
  metaSpan.className = "json-summary-meta";
  metaSpan.textContent = `(${previewCount})`;
  summary.appendChild(metaSpan);
  details.appendChild(summary);

  const children = document.createElement("div");
  children.className = "json-tree-children";

  for (const [entryKey, entryValue] of entries) {
    const childNode = buildJsonTreeNode(entryValue, isArray ? `[${entryKey}]` : entryKey);
    children.appendChild(childNode);
  }

  details.appendChild(children);
  wrapper.appendChild(details);

  return wrapper;
}

function renderSchemaTree(payload) {
  schemaJsonElement.innerHTML = "";
  schemaJsonElement.appendChild(buildJsonTreeNode(payload));
}

function updateJsonViews() {
  const componentsPayload = getComponentsPayload();
  renderSchemaTree(componentsPayload);
  submissionJsonElement.textContent = JSON.stringify(currentSubmissionData, null, 2);
}

async function renderPreview(schema) {
  if (formInstance && typeof formInstance.destroy === "function") {
    formInstance.destroy(true);
  }

  previewElement.innerHTML = "";
  formInstance = await Formio.createForm(previewElement, schema);

  formInstance.on("change", (event) => {
    currentSubmissionData = event.data || {};
    updateJsonViews();
  });
}

function attachBuilderEvents() {
  const persistAndRerender = async () => {
    currentSchema = builderInstance.schema || fallbackSchema;
    saveSchema(currentSchema);
    await renderPreview(currentSchema);
    updateJsonViews();
  };

  builderInstance.on("change", persistAndRerender);
  builderInstance.on("addComponent", persistAndRerender);
  builderInstance.on("removeComponent", persistAndRerender);
  builderInstance.on("updateComponent", persistAndRerender);
}

async function copySchemaToClipboard() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(getComponentsPayload(), null, 2));
    copyStatusElement.textContent = "Components JSON copied to clipboard.";
  } catch {
    copyStatusElement.textContent = "Could not copy automatically. Check browser permissions.";
  }
}

async function init() {
  builderInstance = await Formio.builder(builderElement, currentSchema, {
    noDefaultSubmitButton: true
  });

  attachBuilderEvents();
  await renderPreview(currentSchema);
  updateJsonViews();
}

copySchemaButton.addEventListener("click", copySchemaToClipboard);
init();
