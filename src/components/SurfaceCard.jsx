import { useEffect, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  alpha
} from "@mui/material";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";

function SurfaceCard({
  icon,
  title,
  subtitle,
  children,
  rightAction,
  minHeight,
  height,
  scrollable = false,
  bodySx
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isMaximized) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMaximized]);

  const resolvedMinHeight = isMaximized ? "auto" : minHeight;
  const resolvedHeight = isMaximized ? "calc(100vh - 16px)" : height;

  return (
    <Paper
      elevation={0}
      sx={{
        position: isMaximized ? "fixed" : "relative",
        inset: isMaximized ? 8 : "auto",
        zIndex: isMaximized ? 1500 : "auto",
        overflow: "hidden",
        borderRadius: 6,
        border: "1px solid",
        borderColor: alpha("#7d8db3", 0.18),
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,250,255,0.98) 100%)",
        minHeight: resolvedMinHeight,
        height: resolvedHeight,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 50px rgba(16, 24, 40, 0.08)"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(82, 175, 255, 0.12), transparent 32%), radial-gradient(circle at bottom left, rgba(21, 182, 122, 0.08), transparent 30%)",
          pointerEvents: "none"
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 0.8,
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          px: 1.5,
          py: 0.8,
          position: "relative"
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 0.8,
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              background: "linear-gradient(135deg, rgba(81, 131, 255, 0.16), rgba(39, 198, 125, 0.12))",
              border: "1px solid rgba(81, 131, 255, 0.18)"
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ letterSpacing: "-0.03em" }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          {rightAction}
          <Tooltip title={isMaximized ? "Restore size" : "Maximize card"}>
            <IconButton
              size="small"
              onClick={() => setIsMaximized((current) => !current)}
              sx={{
                border: "1px solid",
                borderColor: alpha("#7d8db3", 0.28),
                backgroundColor: alpha("#ffffff", 0.84)
              }}
            >
              {isMaximized ? (
                <CloseFullscreenRoundedIcon fontSize="small" />
              ) : (
                <OpenInFullRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      <Box
        className={scrollable ? "scroll-panel" : undefined}
        sx={{
          p: 1.2,
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: scrollable ? "auto" : "visible",
          ...bodySx
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

export default SurfaceCard;
