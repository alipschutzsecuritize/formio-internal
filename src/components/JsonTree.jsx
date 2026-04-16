import { Box } from "@mui/material";

function JsonTree({ value, nodeKey = "" }) {
  const isPrimitive = value === null || typeof value !== "object";

  if (isPrimitive) {
    let color = "json.string";
    if (value === null) {
      color = "text.disabled";
    } else if (typeof value === "number") {
      color = "json.number";
    } else if (typeof value === "boolean") {
      color = "json.boolean";
    }

    return (
      <Box sx={{ fontFamily: '"IBM Plex Mono", "SFMono-Regular", monospace', fontSize: 13, lineHeight: 1.55 }}>
        {nodeKey ? (
          <Box component="span" sx={{ color: nodeKey.startsWith("[") ? "text.secondary" : "json.key", fontWeight: 600 }}>
            {nodeKey.startsWith("[") ? nodeKey : `"${nodeKey}"`}
            {": "}
          </Box>
        ) : null}
        <Box component="span" sx={{ color, fontStyle: value === null ? "italic" : "normal", fontWeight: typeof value === "boolean" ? 700 : 500 }}>
          {JSON.stringify(value)}
        </Box>
      </Box>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value);

  return (
    <Box component="details" open sx={{ "& > summary": { listStyle: "none" }, "& > summary::-webkit-details-marker": { display: "none" } }}>
      <Box
        component="summary"
        sx={{
          cursor: "pointer",
          fontFamily: '"IBM Plex Mono", "SFMono-Regular", monospace',
          fontSize: 13,
          lineHeight: 1.55,
          borderRadius: 2,
          px: 0.75,
          py: 0.25,
          transition: "background-color 140ms ease",
          "&:hover": { backgroundColor: "rgba(90, 128, 255, 0.08)" }
        }}
      >
        {nodeKey ? (
          <Box component="span" sx={{ color: nodeKey.startsWith("[") ? "text.secondary" : "json.key", fontWeight: 700 }}>
            {nodeKey.startsWith("[") ? nodeKey : `"${nodeKey}"`}
            {": "}
          </Box>
        ) : null}
        <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
          {isArray ? "[ ... ]" : "{ ... }"}
        </Box>
        <Box component="span" sx={{ color: "text.secondary" }}>
          {" "}
          ({entries.length} {isArray ? "items" : "keys"})
        </Box>
      </Box>

      <Box
        sx={{
          ml: 2.25,
          pl: 1.5,
          borderLeft: "1px dashed",
          borderColor: "divider",
          display: "grid",
          gap: 0.25
        }}
      >
        {entries.map(([entryKey, entryValue]) => (
          <JsonTree
            key={isArray ? `idx-${entryKey}` : entryKey}
            nodeKey={isArray ? `[${entryKey}]` : entryKey}
            value={entryValue}
          />
        ))}
      </Box>
    </Box>
  );
}

export default JsonTree;
