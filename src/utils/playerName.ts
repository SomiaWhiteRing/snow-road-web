export const PLAYER_NAME_IDS = {
  LARA_AXES: "lara_axes",
  LARA_FLARE: "lara_flare",
} as const;

const RAW_PLAYER_NAME_MAP: Record<string, string> = {
  ララアクス: PLAYER_NAME_IDS.LARA_AXES,
  ララフレア: PLAYER_NAME_IDS.LARA_FLARE,
};

export const normalizePlayerName = (name: string): string => {
  const normalized = name.trim();
  return RAW_PLAYER_NAME_MAP[normalized] ?? normalized;
};

export const isPlayerName = (name: string, expected: string): boolean =>
  normalizePlayerName(name) === expected;
