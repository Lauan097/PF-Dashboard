export interface GuildData {
  id: string;
  name: string;
  icon: string | null;
  membersCount: number;
  rolesCount: number;
  channelsCount: number;
}

export type BotResponse =
  | { success: false; error: string }
  | { success?: never; isAdmin: boolean; guilds: GuildData[] };

// API /api/verify?type=checkSession
export interface SessionCheckResponse {
  success: boolean;
  isAdmin?: boolean;
  guilds?: GuildData[];
  error?: string;
}