export type VacationType = "vacation" | "sick" | "businessTrip";

export type ViewMode = "month" | "year";

export type AbsenceFilter = "all" | VacationType;

export type BusinessTripType = "abroad" | "ukraine" | "pryluky";

export type BusinessTripFilter = "all" | BusinessTripType;

export type VacationSubtype =
  | "annualMain"
  | "annualAdditional"
  | "personalUnpaid"
  | "social"
  | "educational"
  | "unpaid"
  | "other";

export type VacationTypeFilter = "all" | VacationSubtype;

export type VacationPeriod = {
  from: string;
  to: string;
  type?: VacationType;
  businessTripType?: BusinessTripType;
  vacationSubtype?: VacationSubtype;
  objID: number;
  objVer: number;
};

export type PersonVacation = {
  id: number;
  fullName: string;
  department: string;
  vacations: VacationPeriod[];
};

export type DocumentClickData = {
  objID: number;
  objVer: number;
};

export type CalendarProps = {
  onDocumentClick?: (data: DocumentClickData) => void;
};

export type MonthAbsenceSummary = {
  total: number;
  byType: Record<VacationType, number>;
};

export type VisibleAbsenceItem = {
  type: VacationType;
  from: Date;
  to: Date;
  days: number;
  objID: number;
  objVer: number;
  businessTripType?: BusinessTripType;
  vacationSubtype?: VacationSubtype;
};
