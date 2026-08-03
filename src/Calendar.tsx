import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  addMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";

import CalendarHeader from "./CalendarHeader";
import YearCalendarHeader from "./YearCalendarHeader";
import YearPersonRow from "./YearPersonRow";
import PersonVacationRow from "./PersonRow";
import type {
  AbsenceFilter,
  BusinessTripFilter,
  VacationTypeFilter,
  CalendarProps,
  PersonVacation,
  ViewMode,
} from "./calendar.types";
import {
  NAME_COL_WIDTH,
  getVisibleAbsencesForMonth,
  typeColors,
} from "./vacationCalendar.utils";
import { LegendItem } from "./LegendItem";
import {
  ButtonsContent,
  CalendarColText,
  DropdownsContent,
  LegendContent,
  reportContent,
} from "./enums";
import { people } from "./assets/mockData";

export default function Calendar({ onDocumentClick }: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [absenceFilter, setAbsenceFilter] = useState<AbsenceFilter>("all");
  const [businessTripFilter, setBusinessTripFilter] =
    useState<BusinessTripFilter>("all");
  const [vacationTypeFilter, setVacationTypeFilter] =
    useState<VacationTypeFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 6));

  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    person: PersonVacation | null;
    month: Date | null;
  }>({
    open: false,
    person: null,
    month: null,
  });
  const showBusinessTripTypeColumn = absenceFilter === "businessTrip";
  const showVacationTypeColumn = absenceFilter === "vacation";

  const departments = useMemo(() => {
    return Array.from(new Set(people.map((person) => person.department)));
  }, []);

  const employees = useMemo(() => {
    return people.filter((person) => {
      const matchesDepartment =
        departmentFilter === "all" || person.department === departmentFilter;

      const matchesAbsenceType =
        absenceFilter === "all" ||
        person.vacations.some((vacation) => {
          const matchesType =
            (vacation.type ?? "businessTrip") === absenceFilter;

          const matchesBusinessTripType =
            absenceFilter !== "businessTrip" ||
            businessTripFilter === "all" ||
            vacation.businessTripType === businessTripFilter;

          const matchesVacationType =
            absenceFilter !== "vacation" ||
            vacationTypeFilter === "all" ||
            vacation.vacationSubtype === vacationTypeFilter;

          return matchesType && matchesBusinessTripType && matchesVacationType;
        });

      return matchesDepartment && matchesAbsenceType;
    });
  }, [departmentFilter, absenceFilter, businessTripFilter, vacationTypeFilter]);

  const filteredPeople = useMemo(() => {
    return people
      .filter((person) => {
        const matchesDepartment =
          departmentFilter === "all" || person.department === departmentFilter;

        const matchesEmployee =
          employeeFilter === "all" || person.id === Number(employeeFilter);

        return matchesDepartment && matchesEmployee;
      })
      .map((person) => ({
        ...person,
        vacations: person.vacations.filter((vacation) => {
          const matchesAbsenceType =
            absenceFilter === "all" ||
            (vacation.type ?? "businessTrip") === absenceFilter;

          const matchesBusinessTripType =
            absenceFilter !== "businessTrip" ||
            businessTripFilter === "all" ||
            vacation.businessTripType === businessTripFilter;

          const matchesVacationType =
            absenceFilter !== "vacation" ||
            vacationTypeFilter === "all" ||
            vacation.vacationSubtype === vacationTypeFilter;

          return (
            matchesAbsenceType && matchesBusinessTripType && matchesVacationType
          );
        }),
      }))
      .filter(
        (person) => absenceFilter === "all" || person.vacations.length > 0,
      );
  }, [
    departmentFilter,
    employeeFilter,
    absenceFilter,
    businessTripFilter,
    vacationTypeFilter,
  ]);

  const groupedPeople = useMemo(() => {
    return filteredPeople.reduce<Record<string, PersonVacation[]>>(
      (acc, person) => {
        if (!acc[person.department]) acc[person.department] = [];
        acc[person.department].push(person);
        return acc;
      },
      {},
    );
  }, [filteredPeople]);

  const monthStart = useMemo(
    () => startOfMonth(selectedMonth),
    [selectedMonth],
  );
  const monthEnd = useMemo(() => endOfMonth(selectedMonth), [selectedMonth]);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });
  }, [monthStart, monthEnd]);

  const yearMonths = useMemo(() => {
    return eachMonthOfInterval({
      start: startOfYear(selectedMonth),
      end: endOfYear(selectedMonth),
    });
  }, [selectedMonth]);

  const gridTemplateColumns = `${NAME_COL_WIDTH} minmax(0, 1fr)`;
  const daysGridTemplateColumns = `repeat(${days.length}, minmax(20px, 1fr))`;
  const yearGridTemplateColumns = `${NAME_COL_WIDTH} repeat(12, minmax(48px, 1fr))`;

  const isYearMode = viewMode === "year";

  const activeGridTemplateColumns = isYearMode
    ? yearGridTemplateColumns
    : gridTemplateColumns;

  const dialogRows = useMemo(() => {
    if (!detailsDialog.person || !detailsDialog.month) return [];

    return getVisibleAbsencesForMonth(
      detailsDialog.person.vacations,
      detailsDialog.month,
    );
  }, [detailsDialog]);

  const closeDialog = () => {
    setDetailsDialog({
      open: false,
      person: null,
      month: null,
    });
  };

  const selectSx = {
    fontSize: 12,
    color: "#e2e8f0",

    ".MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(96,165,250,0.35)",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#60a5fa",
    },

    ".MuiSvgIcon-root": {
      color: "#bfdbfe",
    },

    ".MuiSelect-select": {
      py: 1,
    },
  };

  const formControlSx = {
    minWidth: 220,

    ".MuiInputLabel-root": {
      fontSize: 12,
      color: "#bfdbfe",
    },

    ".MuiSelect-select": {
      fontSize: 12,
      py: 1,
    },
  };

  const menuProps = {
    slotProps: {
      paper: {
        sx: {
          background: "#1e293b",
          color: "#e2e8f0",
        },
      },
    },
  };

  const buttonSx = {
    fontSize: 12,
    textTransform: "none",
    borderRadius: 2,
    color: "#dbeafe",
    borderColor: "rgba(96,165,250,0.35)",
    background: "rgba(30,41,59,0.45)",
    "&:hover": {
      borderColor: "#60a5fa",
      background: "rgba(255,255,255,0.035)",
    },
    "&:active": {
      transform: "scale(0.97)",
    },
  };

  return (
    <Paper
      sx={{
        width: "100%",
        height: "100%",
        maxHeight: 700,
        minHeight: 500,
        borderRadius: 3,
        overflow: "hidden",
        p: 2,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #16213e 0%, #1e3a5f 100%)",
        border: "1px solid rgba(96,165,250,0.18)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#e2e8f0",
          fontWeight: 700,
          fontSize: {
            xs: 16,
            md: 20,
          },
          mb: 2,
          flexShrink: 0,
        }}
      >
        {reportContent.title}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={formControlSx}>
          <InputLabel>{reportContent.departmentLabel}</InputLabel>

          <Select
            value={departmentFilter}
            label={reportContent.departmentLabel}
            onChange={(event) => {
              setDepartmentFilter(event.target.value);
              setEmployeeFilter("all");
            }}
            MenuProps={menuProps}
            sx={selectSx}
          >
            <MenuItem value="all" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.allDepartments}
            </MenuItem>

            {departments.map((department) => (
              <MenuItem
                key={department}
                value={department}
                sx={{ fontSize: 12, minHeight: 32 }}
              >
                {department}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={formControlSx}>
          <InputLabel>{reportContent.employeeLabel}</InputLabel>

          <Select
            value={employeeFilter}
            label={reportContent.employeeLabel}
            onChange={(event) => setEmployeeFilter(event.target.value)}
            MenuProps={menuProps}
            sx={selectSx}
          >
            <MenuItem value="all" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.allEmployees}
            </MenuItem>

            {employees.map((person) => (
              <MenuItem
                key={person.id}
                value={String(person.id)}
                sx={{ fontSize: 12, minHeight: 32 }}
              >
                {person.fullName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={formControlSx}>
          <InputLabel>{reportContent.absenceTypeLabel}</InputLabel>

          <Select
            value={absenceFilter}
            label={reportContent.absenceTypeLabel}
            onChange={(event) => {
              const nextAbsenceFilter = event.target.value as AbsenceFilter;
              setAbsenceFilter(nextAbsenceFilter);
              setEmployeeFilter("all");

              if (nextAbsenceFilter !== "businessTrip") {
                setBusinessTripFilter("all");
              }

              if (nextAbsenceFilter !== "vacation") {
                setVacationTypeFilter("all");
              }
            }}
            MenuProps={menuProps}
            sx={selectSx}
          >
            <MenuItem value="all" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.allAbsenceTypes}
            </MenuItem>

            <MenuItem value="vacation" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.vacation}
            </MenuItem>

            <MenuItem value="sick" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.sick}
            </MenuItem>

            <MenuItem value="businessTrip" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.businessTrip}
            </MenuItem>
          </Select>
        </FormControl>

        {absenceFilter === "businessTrip" && (
          <FormControl size="small" sx={formControlSx}>
            <InputLabel>{reportContent.businessTripTypeLabel}</InputLabel>

            <Select
              value={businessTripFilter}
              label={reportContent.businessTripTypeLabel}
              onChange={(event) => {
                setBusinessTripFilter(event.target.value as BusinessTripFilter);
                setEmployeeFilter("all");
              }}
              MenuProps={menuProps}
              sx={selectSx}
            >
              <MenuItem value="all" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.allBusinessTripTypes}
              </MenuItem>

              <MenuItem value="abroad" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.abroad}
              </MenuItem>

              <MenuItem value="ukraine" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.ukraine}
              </MenuItem>

              <MenuItem value="pryluky" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.pryluky}
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {absenceFilter === "vacation" && (
          <FormControl size="small" sx={formControlSx}>
            <InputLabel>{reportContent.vacationTypeLabel}</InputLabel>

            <Select
              value={vacationTypeFilter}
              label={reportContent.vacationTypeLabel}
              onChange={(event) => {
                setVacationTypeFilter(event.target.value as VacationTypeFilter);
                setEmployeeFilter("all");
              }}
              MenuProps={menuProps}
              sx={selectSx}
            >
              <MenuItem value="all" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.allVacationTypes}
              </MenuItem>
              <MenuItem value="annualMain" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.annualMain}
              </MenuItem>
              <MenuItem
                value="annualAdditional"
                sx={{ fontSize: 12, minHeight: 32 }}
              >
                {DropdownsContent.annualAdditional}
              </MenuItem>
              <MenuItem
                value="personalUnpaid"
                sx={{ fontSize: 12, minHeight: 32 }}
              >
                {DropdownsContent.personalUnpaid}
              </MenuItem>
              <MenuItem value="social" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.social}
              </MenuItem>
              <MenuItem
                value="educational"
                sx={{ fontSize: 12, minHeight: 32 }}
              >
                {DropdownsContent.educational}
              </MenuItem>
              <MenuItem value="unpaid" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.unpaid}
              </MenuItem>
              <MenuItem value="other" sx={{ fontSize: 12, minHeight: 32 }}>
                {DropdownsContent.other}
              </MenuItem>
            </Select>
          </FormControl>
        )}

        <FormControl size="small" sx={formControlSx}>
          <InputLabel>{reportContent.periodLabel}</InputLabel>

          <Select
            value={viewMode}
            label={reportContent.periodLabel}
            onChange={(event) => setViewMode(event.target.value as ViewMode)}
            MenuProps={menuProps}
            sx={selectSx}
          >
            <MenuItem value="month" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.monthByDays}
            </MenuItem>

            <MenuItem value="year" sx={{ fontSize: 12, minHeight: 32 }}>
              {DropdownsContent.yearByMonths}
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {viewMode === "month" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            gap: 1,
            flexShrink: 0,
            mb: 1,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
            onClick={() => setSelectedMonth((prev) => subMonths(prev, 1))}
            sx={buttonSx}
          >
            {ButtonsContent.past}
          </Button>

          <Typography
            sx={{
              minWidth: 80,
              maxWidth: 85,
              textAlign: "center",
              fontWeight: 400,
              color: "#bfdbfe",
            }}
          >
            {format(selectedMonth, "MM.yyyy")}
          </Typography>

          <Button
            size="small"
            variant="outlined"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
            onClick={() => setSelectedMonth((prev) => addMonths(prev, 1))}
            sx={buttonSx}
          >
            {ButtonsContent.next}
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => setSelectedMonth(new Date())}
            sx={{
              fontSize: 12,
              textTransform: "none",
              borderRadius: 2,
              background:
                "linear-gradient(90deg, #1d4ed8 0%, #2563eb 45%, #38bdf8 100%)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(30,136,229,0.4)",
              "&:hover": {
                background: "linear-gradient(90deg, #1976d2, #2196f3)",
              },
              "&:active": {
                transform: "scale(0.97)",
              },
            }}
          >
            {ButtonsContent.current}
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          mt: 1,
          mb: 1,
        }}
      >
        <LegendItem
          label={LegendContent.vacation}
          color={typeColors.vacation}
        />

        <LegendItem label={LegendContent.sick} color={typeColors.sick} />

        <LegendItem
          label={LegendContent.businessTrip}
          color={typeColors.businessTrip}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          border: "1px solid rgba(96,165,250,0.38)",
          boxShadow: `
						inset 0 0 0 1px rgba(191,219,254,0.06),
						0 0 18px rgba(59,130,246,0.10)
					`,
          borderRadius: 3,
          overflow: "hidden",
          background: "rgba(30,41,59,0.62)",
          backdropFilter: "blur(8px)",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            borderRadius: 2,
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: "calc(100% - 1px)",
              minWidth: 0,
              border: "1px solid rgba(96,165,250,0.18)",
            }}
          >
            {isYearMode ? (
              <YearCalendarHeader
                months={yearMonths}
                gridTemplateColumns={yearGridTemplateColumns}
              />
            ) : (
              <CalendarHeader
                days={days}
                gridTemplateColumns={gridTemplateColumns}
                daysGridTemplateColumns={daysGridTemplateColumns}
              />
            )}

            {Object.entries(groupedPeople).map(
              ([department, departmentPeople]) => (
                <Box key={department}>
                  <Box
                    sx={{
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: activeGridTemplateColumns,
                      height: 34,
                      background:
                        "linear-gradient(90deg, rgba(37,99,235,0.28), rgba(14,165,233,0.18))",
                      borderBottom: "1px solid rgba(96,165,250,0.24)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Box
                      sx={{
                        position: "sticky",
                        left: 0,
                        zIndex: 22,
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#eff6ff",
                        background: "transparent",
                        boxSizing: "border-box",
                      }}
                    >
                      {department}
                    </Box>

                    <Box />
                  </Box>

                  {departmentPeople.map((person) =>
                    isYearMode ? (
                      <YearPersonRow
                        key={person.id}
                        person={person}
                        months={yearMonths}
                        gridTemplateColumns={yearGridTemplateColumns}
                        onOpenDetails={(person, month) =>
                          setDetailsDialog({
                            open: true,
                            person,
                            month,
                          })
                        }
                      />
                    ) : (
                      <PersonVacationRow
                        key={person.id}
                        person={person}
                        days={days}
                        monthStart={monthStart}
                        monthEnd={monthEnd}
                        gridTemplateColumns={gridTemplateColumns}
                        daysGridTemplateColumns={daysGridTemplateColumns}
                        onDocumentClick={onDocumentClick}
                      />
                    ),
                  )}
                </Box>
              ),
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={detailsDialog.open}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(15,23,42,0.28)",
              backdropFilter: "blur(2px)",
            },
          },
          paper: {
            sx: {
              background: "linear-gradient(180deg, #1e3a5f 0%, #16213e 100%)",
              color: "#e2e8f0",
              borderRadius: 3,
              border: "1px solid rgba(96,165,250,0.35)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            position: "relative",
            pr: 6,
            fontSize: 16,
            fontWeight: 700,
            color: "#eff6ff",
            borderBottom: "1px solid rgba(96,165,250,0.18)",
            background:
              "linear-gradient(90deg, rgba(37,99,235,0.32), rgba(14,165,233,0.18))",
          }}
        >
          Деталі неявок: {detailsDialog.person?.fullName}
          <IconButton
            onClick={closeDialog}
            size="small"
            sx={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#bfdbfe",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.06)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 2,
            background: "rgba(15,23,42,0.28)",
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontSize: 13,
              color: "#bfdbfe",
            }}
          >
            Період:{" "}
            {detailsDialog.month ? format(detailsDialog.month, "MM.yyyy") : ""}
          </Typography>

          <Table
            size="small"
            sx={{
              border: "1px solid rgba(96,165,250,0.22)",
              borderRadius: 2,
              overflow: "hidden",
              "& .MuiTableCell-root": {
                borderBottom: "1px solid rgba(96,165,250,0.14)",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(90deg, rgba(37,99,235,0.24), rgba(14,165,233,0.12))",
                }}
              >
                <TableCell
                  sx={{ color: "#bfdbfe", fontSize: 12, fontWeight: 700 }}
                >
                  {CalendarColText.apsType}
                </TableCell>
                <TableCell
                  sx={{ color: "#bfdbfe", fontSize: 12, fontWeight: 700 }}
                >
                  {" "}
                  {CalendarColText.from}
                </TableCell>
                <TableCell
                  sx={{ color: "#bfdbfe", fontSize: 12, fontWeight: 700 }}
                >
                  {CalendarColText.to}
                </TableCell>
                <TableCell
                  sx={{ color: "#bfdbfe", fontSize: 12, fontWeight: 700 }}
                  align="right"
                >
                  {CalendarColText.days}
                </TableCell>
                {showBusinessTripTypeColumn && (
                  <TableCell
                    sx={{ color: "#bfdbfe", fontSize: 12, fontWeight: 700 }}
                  >
                    {CalendarColText.tripType}
                  </TableCell>
                )}
                {showVacationTypeColumn && (
                  <TableCell
                    sx={{ color: "#bfdbfe", fontSize: 12, fontWeight: 700 }}
                  >
                    {CalendarColText.vacType}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {dialogRows.map((row, index) => {
                const rowColor = typeColors[row.type];

                const label =
                  row.type === "businessTrip"
                    ? DropdownsContent.businessTrip
                    : row.type === "sick"
                      ? DropdownsContent.sick
                      : DropdownsContent.vacation;

                return (
                  <TableRow
                    key={index}
                    onClick={() =>
                      onDocumentClick?.({
                        objID: row.objID,
                        objVer: row.objVer,
                      })
                    }
                    sx={{
                      backgroundColor: "rgba(15,23,42,0.24)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.035)",
                      },
                    }}
                  >
                    <TableCell sx={{ fontSize: 12 }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.8,
                          px: 1,
                          py: 0.35,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: rowColor,
                            boxShadow: `0 0 8px ${rowColor}66`,
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: rowColor,
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ color: "#e2e8f0", fontSize: 12 }}>
                      {format(row.from, "dd.MM.yyyy")}
                    </TableCell>

                    <TableCell sx={{ color: "#e2e8f0", fontSize: 12 }}>
                      {format(row.to, "dd.MM.yyyy")}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color: "#eff6ff",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {row.days}
                    </TableCell>

                    {showBusinessTripTypeColumn && (
                      <TableCell sx={{ color: "#e2e8f0", fontSize: 12 }}>
                        {row.businessTripType === "abroad"
                          ? DropdownsContent.abroad
                          : row.businessTripType === "ukraine"
                            ? DropdownsContent.ukraine
                            : row.businessTripType === "pryluky"
                              ? DropdownsContent.pryluky
                              : "—"}
                      </TableCell>
                    )}

                    {showVacationTypeColumn && (
                      <TableCell sx={{ color: "#e2e8f0", fontSize: 12 }}>
                        {row.vacationSubtype === "annualMain"
                          ? DropdownsContent.annualMain
                          : row.vacationSubtype === "annualAdditional"
                            ? DropdownsContent.annualAdditional
                            : row.vacationSubtype === "personalUnpaid"
                              ? DropdownsContent.personalUnpaid
                              : row.vacationSubtype === "social"
                                ? DropdownsContent.social
                                : row.vacationSubtype === "educational"
                                  ? DropdownsContent.educational
                                  : row.vacationSubtype === "unpaid"
                                    ? DropdownsContent.unpaid
                                    : row.vacationSubtype === "other"
                                      ? DropdownsContent.other
                                      : "—"}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
