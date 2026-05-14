import { Box } from "@mui/material";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import SurfaceCard from "./SurfaceCard";

function BuilderSection({ builderMountRef, previewMountRef }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 1.2
      }}
    >
      <SurfaceCard
        icon={<DashboardCustomizeRoundedIcon />}
        title="Build the form"
        minHeight={{ xs: 520, xl: "calc(100vh - 240px)" }}
        height={{ xs: 520, xl: "calc(100vh - 240px)" }}
        scrollable
        bodySx={{ overflow: "hidden" }}
      >
        <Box ref={builderMountRef} className="formio-surface builder-theme" />
      </SurfaceCard>

      <SurfaceCard
        icon={<PlayCircleOutlineRoundedIcon />}
        title="Final result"
        minHeight={{ xs: 520, xl: "calc(100vh - 240px)" }}
        height={{ xs: 520, xl: "calc(100vh - 240px)" }}
        scrollable
      >
        <Box ref={previewMountRef} className="formio-surface preview-theme" />
      </SurfaceCard>
    </Box>
  );
}

export default BuilderSection;
