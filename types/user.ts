export type MemberStatus =
  | 'PendingForm'
  | 'InAcademy'
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Exonerated';

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
  birthDate: string | null;    // ISO string

  // In-Game
  gameId: string | null;
  gameName: string | null;
  phone: string | null;
  photoUrl: string | null;
  level: number | null;
  gender: string | null;
  bloodType: string | null;
  maritalStatus: string | null;

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

  // Assinatura (base64)
  signature: string | null;
}

export interface MemberRecordResponse {
  success: true;
  data: MemberRecord;
}

export interface MemberRecordErrorResponse {
  success: false;
  error: string;
}

export type MemberRecordResult = MemberRecordResponse | MemberRecordErrorResponse;

// -------- OVERVIEW --------

export interface TimeCard {
  name: string;
  horas: number;
}

export interface WeeklyActivity {
  name: string;
  horas: number;
}

export interface MonthlyActivity {
  month: string;
  horas: number;
}

export interface ActiveShift {
  name: string;
  value: number;
  color: string;
}

export interface ConductEntry {
  id: string;
  title: string;
  date: string; // ISO string
  type: 'praise' | 'warning' | 'neutral';
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
  activeDaysData: ActiveShift[];
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

export type MemberOverviewResult = MemberOverviewResponse | MemberOverviewErrorResponse;
