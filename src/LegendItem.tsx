import { Box, Typography } from "@mui/material";

type Props = {
  label: string;
  color: string;
};

export function LegendItem({ label, color }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.2,
        py: 0.5,
        borderRadius: 999,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}, #8f9597)`,
          boxShadow: `0 0 10px ${color}66`,
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: "#dbeafe",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
