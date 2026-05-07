import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSiteSettings } from "../lib/api.js";
import { defaultLocationHierarchy } from "../lib/locationHierarchyText.js";
import { setLocationHierarchy } from "../lib/locationCoverage.js";
import { defaultSiteSettings, getPalette, mergeSettings } from "../lib/siteTheme.js";

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(mergeSettings(defaultSiteSettings, data.settings || {}));
    } catch {
      setSettings(defaultSiteSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    setLocationHierarchy(settings.locationHierarchy || defaultLocationHierarchy);
  }, [settings]);

  useEffect(() => {
    const browserTitle = settings.branding?.browserTitle || settings.brandName || defaultSiteSettings.branding.browserTitle;
    const faviconUrl = settings.branding?.faviconUrl || settings.branding?.logoUrl || "";

    document.title = browserTitle;

    if (!faviconUrl) {
      return;
    }

    let link = document.querySelector("link[rel='icon']");

    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }

    link.setAttribute("href", faviconUrl);
  }, [settings]);

  const palette = useMemo(() => getPalette(settings), [settings]);

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      refreshSettings,
      palette,
      loading
    }),
    [loading, palette, settings]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);

  if (!context) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }

  return context;
};
