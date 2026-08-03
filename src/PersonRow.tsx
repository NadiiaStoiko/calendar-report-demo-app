import { Box, Tooltip, Typography } from "@mui/material";
import { format, parseISO } from "date-fns";
import type { DocumentClickData, PersonVacation } from "./calendar.types";
import {
  ROW_HEIGHT,
  getDayIndex,
  getVisibleVacationPeriod,
  typeColors,
} from "./vacationCalendar.utils";

type Props = {
  person: PersonVacation;
  days: Date[];
  monthStart: Date;
  monthEnd: Date;
  gridTemplateColumns: string;
  daysGridTemplateColumns: string;
  onDocumentClick?: (data: DocumentClickData) => void;
};

export default function PersonVacationRow({
  person,
  days,
  monthStart,
  monthEnd,
  gridTemplateColumns,
  daysGridTemplateColumns,
  onDocumentClick,
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

      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: daysGridTemplateColumns,
          minWidth: 0,
          height: ROW_HEIGHT,
          backgroundImage: `repeating-linear-gradient(
						to right,
						transparent 0,
						transparent calc((100% / ${days.length}) - 1px),
						rgba(148,163,184,0.11) calc((100% / ${days.length}) - 1px),
						rgba(148,163,184,0.11) calc(100% / ${days.length})
					)`,
        }}
      >
        {person.vacations.map((vacation, vacationIndex) => {
          const visible = getVisibleVacationPeriod(
            vacation,
            monthStart,
            monthEnd,
          );

          if (!visible) return null;

          const startIndex = getDayIndex(visible.start, days);
          const endIndex = getDayIndex(visible.end, days);

          if (startIndex === -1 || endIndex === -1) return null;

          const daysCountInCurrentMonth = endIndex - startIndex + 1;
          const leftPercent = (startIndex / days.length) * 100;
          const widthPercent = (daysCountInCurrentMonth / days.length) * 100;

          const type = vacation.type || "businessTrip";
          const color = typeColors[type];

          return (
            <Tooltip
              key={`${person.id}-${vacationIndex}`}
              title={`${person.fullName}: ${format(
                parseISO(vacation.from),
                "dd.MM.yyyy",
              )} - ${format(parseISO(vacation.to), "dd.MM.yyyy")}`}
            >
              <Box
                onClick={() =>
                  onDocumentClick?.({
                    objID: vacation.objID,
                    objVer: vacation.objVer,
                  })
                }
                sx={{
                  position: "absolute",
                  left: `${leftPercent}%`,
                  top: 7,
                  width: `calc(${widthPercent}% - 6px)`,
                  height: 22,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${color} 0%, #9fa4a7 100%)`,
                  boxShadow: `0 0 12px ${color}44`,
                  cursor: "pointer",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,

                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",

                  transition: "0.2s",

                  "&:hover": {
                    transform: "translateY(-1px)",
                    filter: "brightness(1.08)",
                  },
                }}
              >
                {daysCountInCurrentMonth}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
