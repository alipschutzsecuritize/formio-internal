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
            "linear-gradient(180deg, rgba(14, 21, 38, 0.98) 0%, rgba(18, 30, 53, 0.98) 100%)",
          color: "common.white",
          minHeight: 280,
          maxHeight: 420,
          overflow: "auto"
        }}
      >
        <JsonTree value={componentsPayload} />
      </Paper>
    </SurfaceCard>
  );
}

export default SchemaSection;
