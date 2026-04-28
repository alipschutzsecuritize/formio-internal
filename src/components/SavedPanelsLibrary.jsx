import { Box, Paper, Typography, IconButton } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";

function SavedPanelsLibrary({ panels, onDeletePanel }) {

  if (panels.length === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          background: "rgba(255, 255, 255, 0.7)",
          border: "1px solid",
          borderColor: "rgba(97, 118, 168, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BookmarkIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Saved Panels Library
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", display: "block", mb: 0 }}>
          Create a panel in the builder and it will appear here automatically. Edit the panel's title in the builder to rename it.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
        background: "rgba(255, 255, 255, 0.7)",
        border: "1px solid",
        borderColor: "rgba(97, 118, 168, 0.1)"
      }}
    >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BookmarkIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Saved Panels Library ({panels.length})
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(auto-fill, minmax(140px, 1fr))" },
            gap: 1
          }}
        >
          {panels.map((panel) => (
            <Paper
              key={panel.id}
              sx={{
                p: 1,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
                transition: "all 140ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                }
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.25, pr: 2.5 }}>
                {panel.label}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.65rem", opacity: 0.9 }}>
                {panel.type}
              </Typography>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePanel(panel.id);
                }}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  color: "white",
                  opacity: 0.7,
                  transition: "all 140ms ease",
                  "&:hover": {
                    opacity: 1,
                    background: "rgba(255, 255, 255, 0.2)"
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          ))}
        </Box>
      </Paper>
    );
}

export default SavedPanelsLibrary;
