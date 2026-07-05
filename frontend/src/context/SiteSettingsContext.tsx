"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSettings } from "@/lib/api";

type Settings = Record<string, string>;

const Ctx = createContext<Settings>({});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
  }, []);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function useSiteSettings() {
  return useContext(Ctx);
}
