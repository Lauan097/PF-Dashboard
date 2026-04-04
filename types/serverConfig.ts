// -------- DISCORD RESOURCES --------
export interface DiscordChannel {
  id: string;
  name: string;
  position?: number;
}

export interface DiscordRole {
  id: string;
  name: string;
  position?: number;
}

// -------- PRISMA MODELS --------
export interface ServerConfig {
  id?: number;
  guildId: string;
  welcomeCh: string | null;
  goodbyeCh: string | null;
  announcementsCh: string | null;
  announcementsPreviewCh: string | null;
  pointPanelCh: string | null;
  pointOpenCh: string | null;
  pointCloseCh: string | null;
  absenceLogCh: string | null;
  WarningLogCh: string | null;
  BanLogCh: string | null;
}

export interface ServerRoleConfig {
  id?: number;
  guildId: string;
  WarningRole1: string | null;
  WarningRole2: string | null;
  WarningRole3: string | null;
}

// -------- API RESPONSE --------
export interface ServerConfigData {
  config: ServerConfig | null;
  roleConfig: ServerRoleConfig | null;
  channels: DiscordChannel[];
  roles: DiscordRole[];
  serverIcon: string | null;
}

export interface ServerConfigGetResponse {
  success: boolean;
  data?: ServerConfigData;
  error?: string;
}

export interface ServerConfigSaveResponse {
  success: boolean;
  error?: string;
}

// -------- SAVE PAYLOAD --------
export interface ServerConfigPayload {
  channels: {
    welcome: string | null;
    goodbye: string | null;
    announcements: string | null;
    announcementsPreview: string | null;
    pointPanel: string | null;
    pointOpen: string | null;
    pointClose: string | null;
    absenceLog: string | null;
    warningLog: string | null;
    banLog: string | null;
  };
  roles: {
    warningRole1: string | null;
    warningRole2: string | null;
    warningRole3: string | null;
  };
}
