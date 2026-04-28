import { Box, Paper, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function SavedPanelsPanel({ panels, onDeletePanel }) {
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
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
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.25 }}>
              {panel.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              {panel.type}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePanel(panel.id);
            }}
            sx={{
              ml: 0.5,
              flex: 'none',
              color: "text.secondary",
              "&:hover": {
                color: "error.main",
                background: "rgba(244, 67, 54, 0.08)"
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Paper>
      ))}
    </Box>
  );
}

export default SavedPanelsPanel;
