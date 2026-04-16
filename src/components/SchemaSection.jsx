import { Box, Button, Paper, alpha } from "@mui/material";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import SurfaceCard from "./SurfaceCard";
import JsonTree from "./JsonTree";

function SchemaSection({ componentsPayload, copyStatus, onCopy }) {
  return (
    <SurfaceCard
      icon={<DataObjectRoundedIcon />}
      title="JSON Components (Schema)"
      subtitle="Sanitized output without display, settings, or noisy empty values."
      rightAction={
        <Button
          variant="contained"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={onCopy}
          sx={{
            borderRadius: 999,
            px: 2,
            py: 1.1,
            fontWeight: 700,
            boxShadow: "0 14px 28px rgba(81, 131, 255, 0.22)"
          }}
        >
          Copy components JSON
        </Button>
      }
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha("#7086b6", 0.18),
          background:
            "linear-gradient(180deg, rgba(14, 21, 38, 0.98) 0%, rgba(18, 30, 53, 0.98) 100%)",
          color: "common.white",
          minHeight: 360,
          maxHeight: 560,
          overflow: "auto"
        }}
      >
        <JsonTree value={componentsPayload} />
      </Paper>
    </SurfaceCard>
  );
}

export default SchemaSection;
