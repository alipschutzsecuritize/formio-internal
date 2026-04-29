import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { Formio } from "formiojs";

import SurfaceCard from "./components/SurfaceCard";
import JsonTree from "./components/JsonTree";
import BuilderSection from "./components/BuilderSection";
import SchemaSection from "./components/SchemaSection";
import DataSection from "./components/DataSection";

import {
  STORAGE_KEY_SCHEMA,
  STORAGE_KEY_PANELS,
  fallbackSchema,
  extractPanels
} from "./utils/panelUtils";

const STORAGE_KEY_DELETED_PANELS = "formio.builder.deletedPanels.v1";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildSavedPanelTitle(panel) {
  const title = escapeHtml(panel.title || panel.label || panel.type);
  const type = escapeHtml(panel.type || "panel");

  return `
    <span class="saved-panel-builder-item">
      <span class="saved-panel-builder-text">
        <span class="saved-panel-builder-title">${title}</span>
        <span class="saved-panel-builder-type">${type}</span>
      </span>
      <button
        class="saved-panel-delete"
        type="button"
        aria-label="Delete saved panel"
        data-panel-key="${escapeHtml(panel.key)}"
      >&times;</button>
    </span>
  `;
}

export default function App() {
  // ============================================
  // REFS
  // ============================================
  const builderMountRef = useRef(null);
  const previewMountRef = useRef(null);
  const builderInstanceRef = useRef(null);
  const previewInstanceRef = useRef(null);
  const componentToAddRef = useRef(null);
  const savedPanelsRef = useRef([]);
  const deletedPanelKeysRef = useRef([]);

  // ============================================
  // STATE
  // ============================================
  const [schema, setSchema] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCHEMA);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { display: 'form', components: [] };
      }
    }
    return { display: 'form', components: [] };
  });

  const [submissionData, setSubmissionData] = useState({});
  const [copyStatus, setCopyStatus] = useState("");

  const [savedPanels, setSavedPanels] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PANELS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [deletedPanelKeys, setDeletedPanelKeys] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DELETED_PANELS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  savedPanelsRef.current = savedPanels;
  deletedPanelKeysRef.current = deletedPanelKeys;

  // ============================================
  // DERIVED VALUES
  // ============================================
  const componentsPayload = { components: schema?.components || [] };

  // ============================================
  // EFFECTS
  // ============================================

  // Mount Formio builder with Saved Panels section
  useEffect(() => {
    let active = true;

    async function mountBuilder() {
      if (!builderMountRef.current) return;

      builderMountRef.current.innerHTML = "";

      // Build pre-defined components from saved panels
      const preDefinedComponents = {};
      savedPanelsRef.current.forEach((panel) => {
        preDefinedComponents[panel.key] = {
          title: buildSavedPanelTitle(panel),
          key: panel.key,
          schema: panel.data || {}
        };
      });

      // Configure builder
      const builderConfig = {
        noDefaultSubmitButton: true
      };

      if (Object.keys(preDefinedComponents).length > 0) {
        builderConfig.builder = {
          premium: {
            title: 'Saved Panels',
            weight: 5,
            components: preDefinedComponents
          }
        };
      }

      const builder = await Formio.builder(builderMountRef.current, schema || {}, builderConfig);

      if (!active) {
        if (typeof builder.destroy === "function") {
          builder.destroy(true);
        }
        return;
      }

      builderInstanceRef.current = builder;

      // Sync builder changes to React state
      const syncSchema = () => {
        const newSchema = builder.schema || {
          display: 'form',
          components: []
        };
        setSchema(newSchema);
        setCopyStatus("");
      };

      builder.on("change", syncSchema);
      builder.on("addComponent", syncSchema);
      builder.on("removeComponent", syncSchema);
      builder.on("updateComponent", syncSchema);

      const handleSavedPanelDelete = (event) => {
        const deleteButton = event.target.closest(".saved-panel-delete");
        if (!deleteButton) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const panelKey = deleteButton.dataset.panelKey;
        if (!panelKey) {
          return;
        }

        deleteButton.closest("[ref='sidebar-component'], .formcomponent")?.remove();

        setSavedPanels((currentPanels) => {
          const nextPanels = currentPanels.filter((panel) => panel.key !== panelKey);
          localStorage.setItem(STORAGE_KEY_PANELS, JSON.stringify(nextPanels));
          return nextPanels;
        });

        setDeletedPanelKeys((currentKeys) => {
          const nextKeys = Array.from(new Set([...currentKeys, panelKey]));
          localStorage.setItem(STORAGE_KEY_DELETED_PANELS, JSON.stringify(nextKeys));
          return nextKeys;
        });
      };

      builderMountRef.current.addEventListener("click", handleSavedPanelDelete, true);

      syncSchema();

      return () => {
        builderMountRef.current?.removeEventListener("click", handleSavedPanelDelete, true);
      };
    }

    const cleanupPromise = mountBuilder();

    return () => {
      active = false;
      cleanupPromise?.then((cleanup) => cleanup?.());
      if (builderInstanceRef.current && typeof builderInstanceRef.current.destroy === "function") {
        builderInstanceRef.current.destroy(true);
        builderInstanceRef.current = null;
      }
    };
  }, []);

  // Save schema to localStorage and auto-extract panels
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHEMA, JSON.stringify(schema));

    // Auto-extract panels from schema as they're created
    const deletedKeys = new Set(deletedPanelKeysRef.current);
    const extractedPanels = extractPanels(schema).filter((panel) => !deletedKeys.has(panel.key));
    
    if (extractedPanels.length > 0) {
      // Merge with existing panels - UPDATE existing ones if content changed
      const currentPanels = savedPanelsRef.current;
      const updatedPanels = currentPanels.map(existingPanel => {
        // Find if this panel exists in the extracted ones
        const extractedVersion = extractedPanels.find(ep => ep.key === existingPanel.key);
        if (extractedVersion) {
          // Update the panel data with current version from schema
          return {
            ...existingPanel,
            data: extractedVersion.data,
            label: extractedVersion.label,
            title: extractedVersion.title,
            lastUpdated: Date.now()
          };
        }
        return existingPanel;
      });

      // Add new panels that don't exist yet
      const existingKeys = new Set(updatedPanels.map(p => p.key));
      const newPanels = extractedPanels.filter(ep => !existingKeys.has(ep.key));

      const merged = [...updatedPanels, ...newPanels];
      const hasChanged = JSON.stringify(currentPanels) !== JSON.stringify(merged);
      if (!hasChanged) {
        return;
      }

      setSavedPanels(merged);
      localStorage.setItem(STORAGE_KEY_PANELS, JSON.stringify(merged));
    }
  }, [schema]);

  // Mount and update preview form
  useEffect(() => {
    let active = true;
    let pollInterval;

    async function renderPreview() {
      if (!previewMountRef.current) return;

      if (previewInstanceRef.current && typeof previewInstanceRef.current.destroy === "function") {
        previewInstanceRef.current.destroy(true);
      }

      previewMountRef.current.innerHTML = "";
      const form = await Formio.createForm(previewMountRef.current, schema);

      if (!active) {
        if (typeof form.destroy === "function") {
          form.destroy(true);
        }
        return;
      }

      previewInstanceRef.current = form;

      const extractFormData = () => {
        if (form.data && typeof form.data === 'object') {
          return JSON.parse(JSON.stringify(form.data));
        }
        return {};
      };

      let lastExtractedData = JSON.stringify({});

      const updateSubmissionData = () => {
        const newData = extractFormData();
        const newDataStr = JSON.stringify(newData);

        if (newDataStr !== lastExtractedData) {
          lastExtractedData = newDataStr;
          setSubmissionData({ ...newData });
        }
      };

      pollInterval = setInterval(() => {
        if (!active) {
          clearInterval(pollInterval);
          return;
        }
        updateSubmissionData();
      }, 100);
    }

    renderPreview();

    return () => {
      active = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (previewInstanceRef.current && typeof previewInstanceRef.current.destroy === "function") {
        previewInstanceRef.current.destroy(true);
      }
    };
  }, [schema]);

  // ============================================
  // HANDLERS
  // ============================================
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(componentsPayload, null, 2));
      setCopyStatus("Components JSON copied to clipboard.");
    } catch {
      setCopyStatus("Could not copy automatically. Check browser permissions.");
    }
  }



  // ============================================
  // RENDER
  // ============================================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1.25, md: 2 },
        py: { xs: 1.25, md: 2 },
        background:
          "radial-gradient(circle at top left, rgba(80, 102, 255, 0.14), transparent 28%), radial-gradient(circle at right top, rgba(0, 209, 178, 0.16), transparent 30%), linear-gradient(180deg, #f5f8ff 0%, #f3f6fb 52%, #eef4ef 100%)"
      }}
    >
      <Box sx={{ width: "100%", mx: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr" },
            gap: 2,
            minHeight: "100vh"
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}
          >
            <BuilderSection builderMountRef={builderMountRef} previewMountRef={previewMountRef} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
                gap: 2
              }}
            >
              <SchemaSection 
                componentsPayload={componentsPayload} 
                copyStatus={copyStatus}
                onCopy={handleCopy}
              />
              <DataSection 
                submissionData={submissionData} 
                copyStatus={copyStatus}
              />
            </Box>


          </Box>
        </Box>
      </Box>
    </Box>
  );
}
