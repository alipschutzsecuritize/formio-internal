import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Formio } from "formiojs";

import SurfaceCard from "./components/SurfaceCard";
import JsonTree from "./components/JsonTree";
import SavedPanelsPanel from "./components/SavedPanelsPanel";
import BuilderSection from "./components/BuilderSection";
import SchemaSection from "./components/SchemaSection";
import DataSection from "./components/DataSection";

import {
  STORAGE_KEY_SCHEMA,
  STORAGE_KEY_PANELS,
  fallbackSchema,
  extractPanels,
  loadSchema,
  getComponentsPayload
} from "./utils/panelUtils";


export default function App() {
  const builderMountRef = useRef(null);
  const previewMountRef = useRef(null);
  const builderInstanceRef = useRef(null);
  const previewInstanceRef = useRef(null);

  const [schema, setSchema] = useState(() => loadSchema());
  const [submissionData, setSubmissionData] = useState({});
  const [copyStatus, setCopyStatus] = useState("");
  const [savedPanels, setSavedPanels] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PANELS);
    return stored ? JSON.parse(stored) : [];
  });

  const componentsPayload = getComponentsPayload(schema);

  // Montar el builder de Formio
  useEffect(() => {
    let active = true;

    async function mountBuilder() {
      if (!builderMountRef.current) {
        return;
      }

      builderMountRef.current.innerHTML = "";
      const builder = await Formio.builder(builderMountRef.current, loadSchema(), {
        noDefaultSubmitButton: true
      });

      if (!active) {
        if (typeof builder.destroy === "function") {
          builder.destroy(true);
        }
        return;
      }

      builderInstanceRef.current = builder;

      const syncSchema = () => {
        setSchema(builder.schema || fallbackSchema);
        setCopyStatus("");
      };

      builder.on("change", syncSchema);
      builder.on("addComponent", syncSchema);
      builder.on("removeComponent", syncSchema);
      builder.on("updateComponent", syncSchema);

      syncSchema();

      // Inyectar Saved Panels dentro del DOM de Formio
      const injectSavedPanelsInFormio = () => {
        const formComponentsContainer = builderMountRef.current?.querySelector(".formcomponents");
        
        if (formComponentsContainer && !formComponentsContainer.querySelector("#saved-panels-container")) {
          const savedPanelsContainer = document.createElement("div");
          savedPanelsContainer.id = "saved-panels-container";
          savedPanelsContainer.className = "col-xs-4 col-sm-3 col-md-2";
          savedPanelsContainer.style.padding = "12px";
          savedPanelsContainer.style.borderTop = "1px solid #ddd";
          savedPanelsContainer.style.marginTop = "12px";
          
          const title = document.createElement("div");
          title.style.fontWeight = "700";
          title.style.fontSize = "0.85rem";
          title.style.marginBottom = "8px";
          title.textContent = "📋 Saved Panels";
          
          const panelsList = document.createElement("div");
          panelsList.id = "panels-list";
          
          savedPanelsContainer.appendChild(title);
          savedPanelsContainer.appendChild(panelsList);
          formComponentsContainer.appendChild(savedPanelsContainer);
        }
      };

      // Inyectar solo una vez cuando Formio esté listo
      setTimeout(() => {
        injectSavedPanelsInFormio();
      }, 500);
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

  // Guardar schema y actualizar paneles
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHEMA, JSON.stringify(schema));
    
    const panels = extractPanels(schema);
    setSavedPanels(panels);
    localStorage.setItem(STORAGE_KEY_PANELS, JSON.stringify(panels));
    
    // Actualizar la lista de paneles en el DOM de Formio si existe
    const listContainer = document.querySelector("#panels-list");
    if (listContainer) {
      listContainer.innerHTML = "";
      if (panels.length === 0) {
        const empty = document.createElement("div");
        empty.style.padding = "8px";
        empty.style.color = "#999";
        empty.style.fontSize = "11px";
        empty.style.textAlign = "center";
        empty.textContent = "No saved panels yet.";
        listContainer.appendChild(empty);
      } else {
        panels.forEach((panel) => {
          const panelItem = document.createElement("div");
          panelItem.draggable = true;
          panelItem.style.padding = "8px";
          panelItem.style.background = "#f5f8ff";
          panelItem.style.border = "1px solid rgba(97, 118, 168, 0.2)";
          panelItem.style.cursor = "grab";
          panelItem.style.userSelect = "none";
          panelItem.style.borderRadius = "4px";
          
          panelItem.addEventListener("dragstart", (e) => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("application/json", JSON.stringify(panel.data));
          });
          
          const label = document.createElement("div");
          label.style.fontWeight = "600";
          label.style.fontSize = "11px";
          label.style.marginBottom = "4px";
          label.textContent = panel.label;
          
          const type = document.createElement("div");
          type.style.fontSize = "10px";
          type.style.color = "#666";
          type.textContent = `Type: ${panel.type}`;
          
          panelItem.appendChild(label);
          panelItem.appendChild(type);
          listContainer.appendChild(panelItem);
        });
      }
    }
  }, [schema]);

  // Renderizar preview
  useEffect(() => {
    let active = true;
    let pollInterval;

    async function renderPreview() {
      if (!previewMountRef.current) {
        return;
      }

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
      
      // Extraer datos del formulario haciendo una copia limpia
      const extractFormData = () => {
        if (form.data && typeof form.data === 'object') {
          return JSON.parse(JSON.stringify(form.data));
        }
        return {};
      };
      
      // Crear un contenedor para rastrear datos anteriores
      let lastExtractedData = JSON.stringify({});
      
      // Función de actualización que fuerza a React a detectar cambios
      const updateSubmissionData = () => {
        const newData = extractFormData();
        const newDataStr = JSON.stringify(newData);
        
        // Solo actualizar si realmente cambió
        if (newDataStr !== lastExtractedData) {
          lastExtractedData = newDataStr;
          // Forzar actualización con un nuevo objeto
          setSubmissionData({...newData});
        }
      };
      
      // Polling más frecuente y directo
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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(componentsPayload, null, 2));
      setCopyStatus("Components JSON copied to clipboard.");
    } catch {
      setCopyStatus("Could not copy automatically. Check browser permissions.");
    }
  }

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
          {/* MAIN CONTENT */}
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
