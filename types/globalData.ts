import { ServerConfig } from "./serverConfig";
// -------- DADOS DO SERVIDOR (BOT) --------

export interface GuildDiscordRole {
  id: string;
  name: string;
  color: string;
  position: number;
  hoist: boolean;
  managed: boolean;
  permissions: string;
}

export interface GuildDiscordChannel {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
  position: number;
}

export interface GuildDiscordEmoji {
  id: string;
  name: string | null;
  animated: boolean | null;
  url: string;
}

export interface GuildDiscordMember {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  status: string;
  activity: string | null;
  joinedAt: string;
}

export interface GuildData {
  id: string;
  name: string;
  botName: string;
  botAvatar: string;
  icon: string | null;
  banner: string | null;
  memberCount: number;
  createdAt: string;
  description: string | null;
  ownerId: string;
  serverConfig: ServerConfig | null;
  roles: GuildDiscordRole[];
  channels: GuildDiscordChannel[];
  emojis: GuildDiscordEmoji[];
  members: GuildDiscordMember[];
}

export type GuildDataResponse =
  | { success: true; data: GuildData }
  | { success: false; error: string };

// -------- PÁGINA INICIAL (ESTATÍSTICAS) --------

export interface InitialPageOverview {
  totalMembers: number;
  activeMembers: number;
  totalPointSessions: number;
  activeAbsences: number;
  totalPromotions: number;
  totalWarnings: number;
}

export interface InitialPageMemberFlow {
  last30Days: {
    joins: number;
    leaves: number;
  };
}

export interface FeatureStat {
  featureName: string;
  usageCount: number;
  guildId: string;
}

export interface UserStatEntry {
  voiceTime: number;
  messages: number;
  displayName: string;
  memberForm: {
    gameName: string | null;
    nicknameDc: string | null;
    userTag: string | null;
    rank: string | null;
    userId: string;
  };
}

export interface InitialPageData {
  overview: InitialPageOverview;
  memberFlow: InitialPageMemberFlow;
  featureStats: FeatureStat[];
  topVoiceUsers: UserStatEntry[];
  topMessageUsers: UserStatEntry[];
}

export type InitialPageResponse =
  | { success: true; data: InitialPageData }
  | { success: false; error: string };

// -------- GERENCIADOR DE PONTO --------

export interface PointManagerMember {
  id: string;
  userId: string;
  displayName: string;
  nicknameDc: string | null;
  gameName: string | null;
  rank: string | null;
  weeklyGoal: number;
  weeklyGoalDiscount: number;
  effectiveGoal: number;
  weeklySeconds: number;
  sessionCount: number;
  metGoal: boolean;
  status: string;
}

export interface PointManagerStats {
  topByWeeklyTime: { name: string; seconds: number }[];
  topBySessions: { name: string; count: number }[];
  topByVoice: { name: string; seconds: number }[];
  topByMessages: { name: string; count: number }[];
}

export interface PointManagerData {
  currentWeeklyGoal: number;
  weekStart: string;
  weekEnd: string;
  members: PointManagerMember[];
  stats: PointManagerStats;
}

export type PointManagerResponse =
  | { success: true; data: PointManagerData }
  | { success: false; error: string };

export type SetGoalResponse =
  | { success: true }
  | { success: false; error: string };
