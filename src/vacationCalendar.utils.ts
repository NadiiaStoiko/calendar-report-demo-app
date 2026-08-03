import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  max,
  min,
  parseISO,
  startOfMonth,
} from "date-fns";
import type {
  MonthAbsenceSummary,
  VacationPeriod,
  VacationType,
  VisibleAbsenceItem,
} from "./calendar.types";

export const NAME_COL_WIDTH = "clamp(180px, 22%, 230px)";
export const ROW_HEIGHT = 36;
export const HEADER_HEIGHT = 36;

export const typeColors: Record<VacationType, string> = {
  vacation: "#42a5f5",
  sick: "#ef5350",
  businessTrip: "#59c078",
};

export function getVisibleVacationPeriod(
  vacation: VacationPeriod,
  monthStart: Date,
  monthEnd: Date,
) {
  const vacationStart = parseISO(vacation.from);
  const vacationEnd = parseISO(vacation.to);

  if (isAfter(vacationStart, monthEnd) || isBefore(vacationEnd, monthStart)) {
    return null;
  }

  return {
    start: max([vacationStart, monthStart]),
    end: min([vacationEnd, monthEnd]),
  };
}

export function getDayIndex(date: Date, days: Date[]) {
  return days.findIndex(
    (day) => format(day, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
  );
}

export function getAbsenceSummaryForMonth(
  vacations: VacationPeriod[],
  monthDate: Date,
): MonthAbsenceSummary {
  const result: MonthAbsenceSummary = {
    total: 0,
    byType: {
      vacation: 0,
      sick: 0,
      businessTrip: 0,
    },
  };

  getVisibleAbsencesForMonth(vacations, monthDate).forEach((item) => {
    result.total += item.days;
    result.byType[item.type] += item.days;
  });

  return result;
}

export function getVisibleAbsencesForMonth(
  vacations: VacationPeriod[],
  monthDate: Date,
): VisibleAbsenceItem[] {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  return vacations
    .map((vacation) => {
      const vacationStart = parseISO(vacation.from);
      const vacationEnd = parseISO(vacation.to);

      if (
        isAfter(vacationStart, monthEnd) ||
        isBefore(vacationEnd, monthStart)
      ) {
        return null;
      }

      const visibleStart = max([vacationStart, monthStart]);
      const visibleEnd = min([vacationEnd, monthEnd]);
      const type = vacation.type || "businessTrip";

      return {
        type,
        from: visibleStart,
        to: visibleEnd,
        days: differenceInCalendarDays(visibleEnd, visibleStart) + 1,
        objID: vacation.objID,
        objVer: vacation.objVer,
        businessTripType: vacation.businessTripType,
        vacationSubtype: vacation.vacationSubtype,
      };
    })
    .filter(Boolean) as VisibleAbsenceItem[];
}
