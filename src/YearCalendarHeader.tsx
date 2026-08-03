import { Box } from "@mui/material";
import { format } from "date-fns";
import { HEADER_HEIGHT } from "./vacationCalendar.utils";

type Props = {
  months: Date[];
  gridTemplateColumns: string;
};

export default function YearCalendarHeader({
  months,
  gridTemplateColumns,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns,
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: HEADER_HEIGHT,
        background:
          "linear-gradient(90deg, #1d4ed8 0%, #2563eb 45%, #38bdf8 100%)",
        color: "#eff6ff",
        borderBottom: "1px solid rgba(147,197,253,0.22)",
        boxShadow: "0 4px 14px rgba(2,132,199,0.18)",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 31,
          background:
            "linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 55%, #0284c7 100%)",
          display: "flex",
          alignItems: "center",
          px: 1.5,
          fontWeight: 700,
          color: "#eff6ff",
          borderRight: "1px solid rgba(191,219,254,0.24)",
        }}
      >
        Працівник
      </Box>

      {months.map((month) => (
        <Box
          key={month.toISOString()}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#eff6ff",
            borderLeft: "1px solid rgba(191,219,254,0.24)",
          }}
        >
          {format(month, "MMM")}
        </Box>
      ))}
    </Box>
  );
}
