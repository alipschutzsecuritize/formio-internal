import { Box, Paper, Typography, alpha } from "@mui/material";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import SurfaceCard from "./SurfaceCard";

function DataSection({ submissionData, copyStatus }) {
  return (
    <SurfaceCard
      icon={<DataObjectRoundedIcon />}
      title="Entered data"
      subtitle="Live submission payload captured from the preview form."
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha("#7086b6", 0.18),
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(245,248,255,1) 100%)",
          minHeight: 360,
          maxHeight: 560,
          overflow: "auto"
        }}
      >
        <Box
          component="pre"
          sx={{
            m: 0,
            color: "text.primary",
            fontFamily: '"IBM Plex Mono", "SFMono-Regular", monospace',
            fontSize: 13,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}
        >
          {JSON.stringify(submissionData, null, 2)}
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {copyStatus || "Copy status will appear here after exporting the schema."}
      </Typography>
    </SurfaceCard>
  );
}

export default DataSection;
