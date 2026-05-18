import { Box, Paper, Typography, alpha, Button } from "@mui/material";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import SurfaceCard from "./SurfaceCard";

function DataSection({ submissionData, copyStatus, onCopy }) {
  return (
    <SurfaceCard
      icon={<DataObjectRoundedIcon />}
      title="Entered data"
      rightAction={
        <Button
          variant="contained"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={onCopy}
          sx={{
            borderRadius: 999,
            px: 1.2,
            py: 0.6,
            fontWeight: 600,
            fontSize: "0.8rem",
            boxShadow: "0 14px 28px rgba(81, 131, 255, 0.22)"
          }}
        >
          Copy JSON
        </Button>
      }
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha("#7086b6", 0.18),
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(245,248,255,1) 100%)",
          minHeight: 280,
          maxHeight: 420,
          overflow: "auto"
        }}
      >
        <Box
          component="pre"
          sx={{
            m: 0,
            color: "text.primary",
            fontFamily: '"IBM Plex Mono", "SFMono-Regular", monospace',
            fontSize: 12,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}
        >
          {JSON.stringify(submissionData, null, 2)}
        </Box>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        {copyStatus || ""}
      </Typography>
    </SurfaceCard>
  );
}

export default DataSection;
