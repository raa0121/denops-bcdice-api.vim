export type RollRes = {
  "ok": boolean;
  "text": string;
  "secret": boolean;
  "success": boolean;
  "failure": boolean;
  "critical": boolean;
  "fumble": boolean;
  "rands": Rand[];
};

export type Rand = {
  "kind": string;
  "sides": number;
  "value": number;
};

export type VersionRes = {
  "api": string;
  "bcdice": string;
};

export type AdminRes = {
  "name": string;
  "url": string;
  "email": string;
};

export type GameSystemRes = {
  "game_system": GameSystem[];
};

export type GameSystem = {
  "id": string;
  "name": string;
  "sort_key": string;
};

export type GameSystemInfoRes = {
  "ok": boolean;
  "id": string;
  "name": string;
  "sort_key": string;
  "command_pattern": string;
  "help_message": string;
};
