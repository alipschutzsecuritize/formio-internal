import { Box, Divider, Paper, Typography, alpha } from "@mui/material";

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
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 6,
        border: "1px solid",
        borderColor: alpha("#7d8db3", 0.18),
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,250,255,0.98) 100%)",
        minHeight,
        height,
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
          gap: 1.5,
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          position: "relative"
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1.25,
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
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
            <Typography variant="h5" sx={{ letterSpacing: "-0.03em" }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        {rightAction}
      </Box>

      <Divider />

      <Box
        className={scrollable ? "scroll-panel" : undefined}
        sx={{
          p: 2,
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
