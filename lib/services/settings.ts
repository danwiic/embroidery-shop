import { prisma } from "@/lib/prisma";

let cache: Record<string, string> | null = null;

export const getSettings = async (): Promise<Record<string, string>> => {
  if (cache) return cache;
  const rows = await prisma.shopSetting.findMany();
  cache = {};
  for (const r of rows) cache[r.key] = r.value;
  return cache;
};

export const getSetting = async (key: string, defaultValue = ""): Promise<string> => {
  const settings = await getSettings();
  return settings[key] ?? defaultValue;
};

export const clearSettingsCache = () => {
  cache = null;
};
