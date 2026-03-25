import { equipmentNames } from "../i18n/equipment";
import { ARMORS, WEAPONS } from "../types/equipment";

type EquipmentLocale = keyof typeof equipmentNames;

const ALL_EQUIPMENT = [...WEAPONS, ...ARMORS];
const EQUIPMENT_NAME_TO_ID = new Map<string, string>();

const normalizeEquipmentLocale = (locale: string): EquipmentLocale => {
  const normalized = locale.toLowerCase();

  if (normalized.startsWith("zh")) {
    return "zh";
  }

  if (normalized.startsWith("en")) {
    return "en";
  }

  return "ja";
};

for (const equipment of ALL_EQUIPMENT) {
  EQUIPMENT_NAME_TO_ID.set(equipment.id, equipment.id);
  EQUIPMENT_NAME_TO_ID.set(equipment.name, equipment.id);
}

for (const locale of Object.keys(equipmentNames) as EquipmentLocale[]) {
  for (const [equipmentId, localizedName] of Object.entries(
    equipmentNames[locale].equipment
  )) {
    EQUIPMENT_NAME_TO_ID.set(equipmentId, equipmentId);
    EQUIPMENT_NAME_TO_ID.set(localizedName, equipmentId);
  }
}

export const resolveEquipmentId = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  return EQUIPMENT_NAME_TO_ID.get(value) ?? null;
};

export const getLocalizedEquipmentName = (
  equipmentId: string | null | undefined,
  locale: string
) => {
  const resolvedId = resolveEquipmentId(equipmentId);

  if (!resolvedId) {
    return typeof equipmentId === "string" ? equipmentId : "";
  }

  const normalizedLocale = normalizeEquipmentLocale(locale);
  return (
    equipmentNames[normalizedLocale].equipment[resolvedId] ??
    ALL_EQUIPMENT.find((equipment) => equipment.id === resolvedId)?.name ??
    resolvedId
  );
};
