export type MemberStatus =
  | "PendingForm"
  | "InAcademy"
  | "Active"
  | "Inactive"
  | "Suspended"
  | "Exonerated";

export interface MemberRecord {
  id: string;
  guildId: string;

  // Discord / Pessoal
  userId: string;
  userTag: string | null;
  nicknameDc: string | null;
  nicknameOoc: string | null;
  realName: string | null;
  realPhone: string | null;
  email: string | null;
  birthDate: string | null; // ISO string
  cityAndState: string | null;
  workStatus: string | null;
  availableShifts: string | null;

  // In-Game
  gameId: string | null;
  gameName: string | null;
  phone: string | null;
  photoUrl: string | null;
  level: number | null;
  backgrounds: boolean | null;
  gender: string | null;
  bloodType: string | null;
  maritalStatus: string | null;
  signature: string | null;

  // Institucional
  internalId: string | null;
  registration: string | null;
  rank: string | null;
  department: string | null;
  unit: string | null;
  admissionDate: string | null; // ISO string
  status: MemberStatus;
  supervisorId: string | null;
  accessLevel: number | null;
  weaponPermit: boolean | null;

  // Qualificações
  specializations: unknown;
  awards: unknown;
  internalNotes: string | null;

  // Academia
  academyStartDate: string | null; // ISO string
  academyEndDate: string | null; // ISO string
  academyResult: "Approved" | "Failed" | "Withdrawn" | null;
  academyNumber: string | null;
}

export interface MemberRecordResponse {
  success: true;
  data: MemberRecord;
}

export interface MemberRecordErrorResponse {
  success: false;
  error: string;
}

export type MemberRecordResult =
  | MemberRecordResponse
  | MemberRecordErrorResponse;

// -------- OVERVIEW --------
export interface TimeCard {
  name: string;
  value: number;
  suffix: string;
}

export interface WeeklyActivity {
  name: string;
  horas: number;
}

export interface MonthlyActivity {
  month: string;
  horas: number;
}

export type WeeklyGoalStatus =
  | "no_goal"
  | "not_started"
  | "in_progress"
  | "completed";

export interface WeeklyGoalData {
  goalHours: number;
  currentWeekHours: number;
  sessionsThisWeek: number;
  status: WeeklyGoalStatus;
  goalMetAt: string | null;
  goalMetDay: string | null;
  isRecord: boolean;
  bestWeekHours: number;
  progressPercent: number;
}

export interface ConductEntry {
  id: string;
  title: string;
  description?: string;
  oldRole?: string | null;
  newRole?: string | null;
  date: string;
  type: "praise" | "warning" | "neutral";
}

export interface TopPartner {
  id: number;
  name: string;
  tag: string;
  patrols: number;
}

export interface MemberOverview {
  timeCards: TimeCard[];
  weeklyActivity: WeeklyActivity[];
  monthlyActivity: MonthlyActivity[];
  weeklyGoal: WeeklyGoalData;
  conductHistory: ConductEntry[];
  topPartners: TopPartner[];
}

export interface MemberOverviewResponse {
  success: true;
  data: MemberOverview;
}

export interface MemberOverviewErrorResponse {
  success: false;
  error: string;
}

export type MemberOverviewResult =
  | MemberOverviewResponse
  | MemberOverviewErrorResponse;
