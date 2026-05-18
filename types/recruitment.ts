export type RecruitmentStatus = "Upcoming" | "Open" | "InProgress" | "Closed";
export type AcademyResult = "Approved" | "Failed" | "Withdrawn";

export interface AcademyParticipant {
  id: string;
  guildId: string;
  userId: string;
  userTag: string;
  recruitmentId: string;
  gameName: string | null;
  gameId: string | null;
  gamePhone: string | null;
  antecedents: string | null;
  academyNumber: string;
  startDate: string;
  endDate: string | null;
  result: AcademyResult | null;
  discord: {
    username: string;
    avatar: string;
  }
}

export interface Recruitment {
  id: string;
  guildId: string;
  edition: string;
  status: RecruitmentStatus;
  oppeningDate: string;
  closingDate: string;
  requirements: string;
  location: string;
  additionalInfo: string | null;
  openedById: string;
  openedByTag: string;
  participants: AcademyParticipant[];
  createdAt: string;
  updatedAt: string;
  closedAt: string;
}

export interface RecruitmentPageData {
  recruitments: Recruitment[];
}

export type RecruitmentResponse =
  | { success: true; data: RecruitmentPageData }
  | { success: false; error: string };

export type CreateRecruitmentResponse =
  | { success: true; data: Recruitment }
  | { success: false; error: string };

export type UpdateStatusResponse =
  | { success: true; data: Recruitment }
  | { success: false; error: string };

export interface CreateRecruitmentPayload {
  edition: string;
  oppeningDate: string;
  closingDate: string;
  requirements: string;
  location: string;
  additionalInfo?: string;
}

export interface UpdateStatusPayload {
  recruitmentId: string;
  newStatus: RecruitmentStatus;
}
