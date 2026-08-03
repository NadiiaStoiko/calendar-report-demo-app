import { Box } from "@mui/material";
import Calendar from "./Calendar";
import type { DocumentClickData } from "./calendar.types";

export default function App() {
  const handleDocumentClick = ({ objID, objVer }: DocumentClickData) => {
    console.log("Clicked document:", { objID, objVer });
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        minHeight: 500,
        p: 2,
        boxSizing: "border-box",
        background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
        overflow: "hidden",
      }}
    >
      <Calendar onDocumentClick={handleDocumentClick} />
    </Box>
  );
}
