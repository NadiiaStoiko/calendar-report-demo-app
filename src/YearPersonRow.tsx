import { Box, Tooltip, Typography } from "@mui/material";
import type { PersonVacation } from "./calendar.types";
import {
  ROW_HEIGHT,
  getAbsenceSummaryForMonth,
  typeColors,
} from "./vacationCalendar.utils";

type Props = {
  person: PersonVacation;
  months: Date[];
  gridTemplateColumns: string;
  onOpenDetails: (person: PersonVacation, month: Date) => void;
};

export default function YearPersonRow({
  person,
  months,
  gridTemplateColumns,
  onOpenDetails,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns,
        height: ROW_HEIGHT,
        borderBottom: "1px solid rgba(96,165,250,0.18)",
        backgroundColor: "rgba(15,23,42,0.48)",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.025)",
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 20,
          width: "100%",
          boxSizing: "border-box",
          background: "#1e293b",
          px: 1.5,
          display: "flex",
          alignItems: "center",
          borderRight: "1px solid rgba(96,165,250,0.16)",
        }}
      >
        <Typography
          noWrap
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "#e2e8f0",
          }}
        >
          {person.fullName}
        </Typography>
      </Box>

      {months.map((month) => {
        const summary = getAbsenceSummaryForMonth(person.vacations, month);

        return (
          <Box
            key={month.toISOString()}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: "1px solid rgba(148,163,184,0.11)",
            }}
          >
            {summary.total > 0 && (
              <Tooltip title="Натисніть для деталей">
                <Box
                  onClick={() => onOpenDetails(person, month)}
                  sx={{
                    width: 25,
                    height: 25,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${typeColors.businessTrip}, #828f94)`,
                    boxShadow: `0 0 12px ${typeColors.businessTrip}44`,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,

                    cursor: "pointer",
                    userSelect: "none",

                    transition: "0.2s",

                    "&:hover": {
                      filter: "brightness(1.08)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {summary.total}
                </Box>
              </Tooltip>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
