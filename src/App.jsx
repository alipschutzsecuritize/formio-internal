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


export default function App() {
  // ============================================
  // REFS
  // ============================================
  const builderMountRef = useRef(null);
  const previewMountRef = useRef(null);
  const builderInstanceRef = useRef(null);
  const previewInstanceRef = useRef(null);
  const componentToAddRef = useRef(null);

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
      savedPanels.forEach((panel) => {
        preDefinedComponents[panel.key] = {
          title: panel.title || panel.label || panel.type,
          key: panel.key,
          icon: 'bookmark',
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

      syncSchema();
    }

    mountBuilder();

    return () => {
      active = false;
      if (builderInstanceRef.current && typeof builderInstanceRef.current.destroy === "function") {
        builderInstanceRef.current.destroy(true);
        builderInstanceRef.current = null;
      }
    };
  }, []);

  // Save schema and extracted panels to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHEMA, JSON.stringify(schema));

    const panels = extractPanels(schema);
    if (panels.length > 0) {
      localStorage.setItem(STORAGE_KEY_PANELS, JSON.stringify(panels));
      setSavedPanels(panels);
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
      <Box sx={{ maxWidth: 1800, mx: "auto" }}>
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
