import { Box, Paper, Typography } from "@mui/material";

function SavedPanelsPanel({ panels }) {
  if (panels.length === 0) {
    return (
      <Box sx={{ p: 1, color: "text.secondary", fontSize: 11, textAlign: "center" }}>
        No panels yet.<br/>Create a panel to save it.
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, maxHeight: 400, overflowY: "auto" }}>
      {panels.map((panel) => (
        <Paper
          key={panel.id}
          draggable
          onDragStart={(e) => {
            const componentData = JSON.parse(JSON.stringify(panel.data));
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("application/json", JSON.stringify(componentData));
          }}
          sx={{
            p: 1,
            background: "#f5f8ff",
            border: "1px solid",
            borderColor: "rgba(97, 118, 168, 0.2)",
            cursor: "grab",
            userSelect: "none",
            transition: "all 140ms ease",
            "&:hover": {
              background: "#eff3ff",
              borderColor: "rgba(79, 111, 255, 0.4)",
              transform: "translateY(-1px)",
              boxShadow: "0 2px 8px rgba(79, 111, 255, 0.1)"
            },
            "&:active": {
              cursor: "grabbing"
            }
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.25 }}>
            {panel.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            {panel.type}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

export default SavedPanelsPanel;
