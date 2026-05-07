import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  adminLogin,
  deleteSubmission,
  getSubmissions,
  resetSiteSettings,
  updateSiteSettings,
  uploadAdminMedia
} from "../lib/api.js";
import { clearAdminAccess, getAdminAccess, grantAdminAccess } from "../lib/adminAccess.js";
import { useSiteSettings } from "../context/SiteSettingsContext.jsx";
import {
  backgroundOptions,
  defaultSiteSettings,
  paletteOptions,
  patternOptions
} from "../lib/siteTheme.js";
import {
  buildLocationHierarchyStats,
  defaultLocationHierarchy,
  defaultLocationHierarchyText,
  getCountyPreviewRows,
  parseLocationHierarchyText,
  serializeLocationHierarchy
} from "../lib/locationHierarchyText.js";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  downloadSubmissionsExcel,
  formatSubmissionCoverage,
  formatSubmissionCounties,
  formatSubmissionLicenses,
  formatSubmissionRowText
} from "../lib/submissionAdmin.js";

const storageKey = "kerea-admin-token";
const animationOptions = ["none", "pulse", "float", "shake", "breathe"];
const loadAnimationOptions = ["none", "rise", "stagger"];

const toMultiline = (items, fallback) => (items && items.length ? items : fallback).join("\n");
const serializeFooterLinks = (links = []) =>
  links.map((link) => `${link.label || ""} | ${link.href || ""}`).join("\n");

const createEditorState = (settings) => ({
  brandName: settings.brandName,
  supportLabel: settings.supportLabel,
  heroBadge: settings.heroBadge,
  heroTitle: settings.heroTitle,
  heroDescription: settings.heroDescription,
  heroPrimaryCta: settings.heroPrimaryCta,
  heroSecondaryCta: settings.heroSecondaryCta,
  formPageTitle: settings.formPageTitle,
  formPageDescription: settings.formPageDescription,
  formBanner: settings.formBanner,
  whyItMattersTitle: settings.whyItMattersTitle,
  whyItMattersBody: settings.whyItMattersBody,
  successTitle: settings.successTitle,
  successBodyConsented: settings.successBodyConsented,
  successBodyDeclined: settings.successBodyDeclined,
  footerEnabled: settings.footer?.enabled ?? defaultSiteSettings.footer.enabled,
  footerLayout: settings.footer?.layout || defaultSiteSettings.footer.layout,
  footerTitle: settings.footer?.title || defaultSiteSettings.footer.title,
  footerBody: settings.footer?.body || settings.footer?.description || defaultSiteSettings.footer.body,
  footerLinksText: serializeFooterLinks(
    settings.footer?.links?.length
      ? settings.footer.links
      : [
          { label: settings.footer?.primaryLinkLabel, href: settings.footer?.primaryLinkHref },
          { label: settings.footer?.secondaryLinkLabel, href: settings.footer?.secondaryLinkHref }
        ].filter((link) => link.label && link.href).length
        ? [
            { label: settings.footer?.primaryLinkLabel, href: settings.footer?.primaryLinkHref },
            { label: settings.footer?.secondaryLinkLabel, href: settings.footer?.secondaryLinkHref }
          ].filter((link) => link.label && link.href)
        : defaultSiteSettings.footer.links
  ),
  footerNote: settings.footer?.note || settings.footer?.copyright || defaultSiteSettings.footer.note,
  logoUrl: settings.branding?.logoUrl || "",
  logoAlt: settings.branding?.logoAlt || defaultSiteSettings.branding.logoAlt,
  faviconUrl: settings.branding?.faviconUrl || "",
  browserTitle: settings.branding?.browserTitle || defaultSiteSettings.branding.browserTitle,
  heroStats: (settings.heroStats?.length ? settings.heroStats : defaultSiteSettings.heroStats).map((item) => ({
    value: item.value || "",
    label: item.label || ""
  })),
  highlightsText: toMultiline(settings.landingHighlights, defaultSiteSettings.landingHighlights),
  tipsText: toMultiline(settings.formTips, defaultSiteSettings.formTips),
  howItWorksTitle: settings.howItWorksTitle || defaultSiteSettings.howItWorksTitle,
  howItWorksSteps: (settings.howItWorksSteps?.length ? settings.howItWorksSteps : defaultSiteSettings.howItWorksSteps).map((item) => ({
    title: item.title || "",
    body: item.body || ""
  })),
  locationHierarchyText: serializeLocationHierarchy(settings.locationHierarchy || defaultLocationHierarchy),
  palette: settings.theme.palette,
  heroLayout: settings.theme.heroLayout,
  backgroundStyle: settings.theme.backgroundStyle,
  pattern: settings.theme.pattern,
  patternsEnabled: settings.theme.patternsEnabled,
  patternMotion: settings.theme.patternMotion,
  mobileBackgroundStyle: settings.theme.mobileBackgroundStyle || settings.theme.backgroundStyle,
  desktopBackgroundStyle: settings.theme.desktopBackgroundStyle || settings.theme.backgroundStyle,
  mobilePattern: settings.theme.mobilePattern || settings.theme.pattern,
  desktopPattern: settings.theme.desktopPattern || settings.theme.pattern,
  mobilePatternsEnabled: settings.theme.mobilePatternsEnabled ?? settings.theme.patternsEnabled,
  desktopPatternsEnabled: settings.theme.desktopPatternsEnabled ?? settings.theme.patternsEnabled,
  mobilePatternMotion: settings.theme.mobilePatternMotion ?? settings.theme.patternMotion,
  desktopPatternMotion: settings.theme.desktopPatternMotion ?? settings.theme.patternMotion,
  mobileCtaTrace: settings.theme.mobileCtaTrace ?? settings.theme.mobileCtaTraceEnabled ?? true,
  desktopCtaTrace: settings.theme.desktopCtaTrace ?? settings.theme.desktopCtaTraceEnabled ?? true,
  mobileCtaAnimation: settings.theme.mobileCtaAnimation || settings.theme.mobileCtaMotion || "pulse",
  desktopCtaAnimation: settings.theme.desktopCtaAnimation || settings.theme.desktopCtaMotion || "pulse",
  mobileHeroAnimation: settings.theme.mobileHeroAnimation || settings.theme.mobileBrandMotion || "float",
  desktopHeroAnimation: settings.theme.desktopHeroAnimation || settings.theme.desktopBrandMotion || "shake",
  mobileLoadAnimation: settings.theme.mobileLoadAnimation || settings.theme.mobileSurfaceMotion || "rise",
  desktopLoadAnimation: settings.theme.desktopLoadAnimation || settings.theme.desktopSurfaceMotion || "stagger",
  ctaPulse: settings.theme.ctaPulse,
  formTipsLayout: settings.theme.formTipsLayout,
  primary: settings.theme.colors?.primary || defaultSiteSettings.theme.colors.primary,
  primaryDeep: settings.theme.colors?.primaryDeep || defaultSiteSettings.theme.colors.primaryDeep,
  primarySoft: settings.theme.colors?.primarySoft || defaultSiteSettings.theme.colors.primarySoft,
  accent: settings.theme.colors?.accent || defaultSiteSettings.theme.colors.accent,
  accentStrong: settings.theme.colors?.accentStrong || defaultSiteSettings.theme.colors.accentStrong,
  pageBackground: settings.theme.colors?.pageBackground || defaultSiteSettings.theme.colors.pageBackground,
  pageBackgroundAlt: settings.theme.colors?.pageBackgroundAlt || defaultSiteSettings.theme.colors.pageBackgroundAlt,
  surfaceBackground: settings.theme.colors?.surfaceBackground || defaultSiteSettings.theme.colors.surfaceBackground,
  surfaceMuted: settings.theme.colors?.surfaceMuted || defaultSiteSettings.theme.colors.surfaceMuted,
  fieldBackground: settings.theme.colors?.fieldBackground || defaultSiteSettings.theme.colors.fieldBackground,
  headerBackground: settings.theme.colors?.headerBackground || defaultSiteSettings.theme.colors.headerBackground,
  footerBackground: settings.theme.colors?.footerBackground || defaultSiteSettings.theme.colors.footerBackground,
  footerTextColor: settings.theme.colors?.footerTextColor || defaultSiteSettings.theme.colors.footerTextColor,
  footerMutedTextColor: settings.theme.colors?.footerMutedTextColor || defaultSiteSettings.theme.colors.footerMutedTextColor,
  footerButtonBackground: settings.theme.colors?.footerButtonBackground || defaultSiteSettings.theme.colors.footerButtonBackground,
  footerButtonTextColor: settings.theme.colors?.footerButtonTextColor || defaultSiteSettings.theme.colors.footerButtonTextColor,
  borderColor: settings.theme.colors?.borderColor || defaultSiteSettings.theme.colors.borderColor,
  textColor: settings.theme.colors?.textColor || defaultSiteSettings.theme.colors.textColor,
  mutedTextColor: settings.theme.colors?.mutedTextColor || defaultSiteSettings.theme.colors.mutedTextColor
});

const normalizeLines = (value, fallback) => {
  const items = `${value || ""}`
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items : fallback;
};

const parseFooterLinks = (value) =>
  `${value || ""}`
    .split("\n")
    .map((line) => {
      const [label = "", href = ""] = line.split("|").map((item) => item.trim());
      return { label, href };
    })
    .filter((link) => link.label && link.href);

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "branding", label: "Branding" },
  { id: "content", label: "Page content" },
  { id: "locations", label: "Locations" },
  { id: "appearance", label: "Appearance" },
  { id: "responses", label: "Responses" }
];

const cardClass = "rounded-[28px] border p-5 shadow-sm";

const getDisplayLines = (text) => {
  const normalizedText = `${text || "-"}`;
  const lines = normalizedText
    .split(/\n|\s+\|\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return lines.length ? lines : ["-"];
};

const AdminConsolePage = () => {
  const location = useLocation();
  const { palette, refreshSettings, setSettings, settings } = useSiteSettings();
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [editorState, setEditorState] = useState(() => createEditorState(settings));
  const [expandedTableCells, setExpandedTableCells] = useState({});
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const gatedEmail = useMemo(() => {
    const fromState = location.state?.prefillEmail || "";
    const fromSession = getAdminAccess()?.email || "";
    return fromState || fromSession;
  }, [location.state]);

  const hasHiddenGate = Boolean(location.state?.gate === "hidden" || getAdminAccess()?.email || token);

  const loadSubmissions = async (authToken) => {
    setLoading(true);
    setError("");

    try {
      const data = await getSubmissions(authToken);
      setSubmissions(data.submissions || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load submissions.");
      if (requestError.status === 401) {
        localStorage.removeItem(storageKey);
        setToken("");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditorState(createEditorState(settings));
  }, [settings]);

  useEffect(() => {
    if (token) {
      loadSubmissions(token);
    }
  }, [token]);

  const stats = useMemo(() => {
    const listed = submissions.filter((item) => item.consent).length;
    const declined = submissions.length - listed;

    return [
      { label: "Total submissions", value: submissions.length },
      { label: "Consented", value: listed },
      { label: "Declined", value: declined }
    ];
  }, [submissions]);

  const locationPreview = useMemo(() => {
    try {
      const hierarchy = parseLocationHierarchyText(editorState.locationHierarchyText);

      return {
        hierarchy,
        stats: buildLocationHierarchyStats(hierarchy),
        counties: getCountyPreviewRows(hierarchy, 10),
        error: ""
      };
    } catch (parseError) {
      return {
        hierarchy: null,
        stats: buildLocationHierarchyStats(defaultLocationHierarchy),
        counties: [],
        error: parseError.message || "Unable to read the location hierarchy text."
      };
    }
  }, [editorState.locationHierarchyText]);

  const applyEditorChange = (field, value) => {
    setEditorState((current) => ({ ...current, [field]: value }));
  };
 
   const updateEditorListItem = (field, index, key, value) => {
     setEditorState((current) => ({
       ...current,
       [field]: current[field].map((item, itemIndex) =>
         itemIndex === index ? { ...item, [key]: value } : item
       )
     }));
   };
 
   const addEditorListItem = (field, template) => {
     setEditorState((current) => ({
       ...current,
       [field]: [...current[field], template]
     }));
   };
 
   const removeEditorListItem = (field, index) => {
     setEditorState((current) => ({
       ...current,
       [field]: current[field].filter((_, itemIndex) => itemIndex !== index)
     }));
   };

   const toggleTableCell = (cellId) => {
     setExpandedTableCells((current) => ({
       ...current,
       [cellId]: !current[cellId]
     }));
   };

  const readImageAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(`${reader.result || ""}`);
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (field, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      if (token) {
        const uploadResult = await uploadAdminMedia(token, file);
        applyEditorChange(field, uploadResult.url);
        setNotice("Image uploaded to Cloudinary.");
      } else {
        const dataUrl = await readImageAsDataUrl(file);
        applyEditorChange(field, dataUrl);
      }
    } catch (uploadError) {
      try {
        const dataUrl = await readImageAsDataUrl(file);
        applyEditorChange(field, dataUrl);
        setError(`${uploadError.message || "Cloudinary upload failed."} Using a local preview until Cloudinary is configured.`);
      } catch {
        setError(uploadError.message || "Unable to read the image file.");
      }
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthenticating(true);
    setError("");

    try {
      const data = await adminLogin({ email: gatedEmail, password });
      grantAdminAccess(gatedEmail);
      localStorage.setItem(storageKey, data.token);
      setToken(data.token);
      setPassword("");
    } catch (requestError) {
      setError(requestError.message || "Login failed.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(storageKey);
    clearAdminAccess();
    setToken("");
    setSubmissions([]);
    setPassword("");
  };

  const handleExport = async () => {
    try {
      downloadSubmissionsExcel(submissions);
      setNotice("Excel export downloaded.");
    } catch (requestError) {
      setError(requestError.message || "Export failed.");
    }
  };

  const handleCopySubmission = async (submission) => {
    try {
      await navigator.clipboard.writeText(formatSubmissionRowText(submission));
      setNotice(`Copied ${submission.email || "submission"}.`);
    } catch {
      setError("Unable to copy this response row.");
    }
  };

  const handleCopyAllSubmissions = async () => {
    const rows = submissions.map((submission, index) =>
      [
        `Response ${index + 1}`,
        formatSubmissionRowText(submission)
      ].join("\n")
    );

    try {
      await navigator.clipboard.writeText(rows.join("\n\n------------------------------\n\n"));
      setNotice(`Copied ${submissions.length} response${submissions.length === 1 ? "" : "s"}.`);
    } catch {
      setError("Unable to copy all responses.");
    }
  };

  const handleDeleteSubmission = async (id) => {
    try {
      await deleteSubmission(token, id);
      setSubmissions((current) => current.filter((s) => s.id !== id));
      setConfirmingDelete(null);
      setNotice("Submission deleted.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete submission.");
      setConfirmingDelete(null);
    }
  };

  const renderLimitedCell = (submissionId, field, value, options = {}) => {
    const lines = getDisplayLines(value);
    const text = lines.join("\n");
    const cellId = `${submissionId}-${field}`;
    const expanded = Boolean(expandedTableCells[cellId]);
    const collapsedLineCount = options.collapsedLineCount || 6;
    const shouldCollapse = lines.length > collapsedLineCount || text.length > 150;
    const collapsedStyle = expanded
      ? {}
      : {
          maxHeight: `${collapsedLineCount * 1.35}rem`,
          overflow: "hidden"
        };

    return (
      <div className="max-w-xs rounded-2xl border px-3 py-3" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted, color: palette.textColor }}>
        <div className="space-y-1 break-words leading-[1.35]" style={collapsedStyle}>
          {lines.map((line, index) => (
            <div key={`${cellId}-${index}`}>{line}</div>
          ))}
        </div>
        {shouldCollapse ? (
          <button
            type="button"
            onClick={() => setExpandedTableCells((current) => ({ ...current, [cellId]: !expanded }))}
            className="mt-3 text-sm font-semibold"
            style={{ color: palette.primary }}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        ) : null}
      </div>
    );
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError("");
    setNotice("");

    let parsedLocationHierarchy = settings.locationHierarchy || defaultLocationHierarchy;
    let locationWarning = "";

    try {
      parsedLocationHierarchy = parseLocationHierarchyText(editorState.locationHierarchyText);
    } catch (parseError) {
      locationWarning = parseError.message || "The location hierarchy was not updated because it has a formatting error.";
    }

    const payload = {
      brandName: editorState.brandName.trim(),
      supportLabel: editorState.supportLabel.trim(),
      heroBadge: editorState.heroBadge.trim(),
      heroTitle: editorState.heroTitle.trim(),
      heroDescription: editorState.heroDescription.trim(),
      heroPrimaryCta: editorState.heroPrimaryCta.trim(),
      heroSecondaryCta: editorState.heroSecondaryCta.trim(),
      formPageTitle: editorState.formPageTitle.trim(),
      formPageDescription: editorState.formPageDescription.trim(),
      formBanner: editorState.formBanner.trim(),
      whyItMattersTitle: editorState.whyItMattersTitle.trim(),
      whyItMattersBody: editorState.whyItMattersBody.trim(),
      successTitle: editorState.successTitle.trim(),
      successBodyConsented: editorState.successBodyConsented.trim(),
      successBodyDeclined: editorState.successBodyDeclined.trim(),
      footer: {
        enabled: editorState.footerEnabled,
        layout: editorState.footerLayout,
        title: editorState.footerTitle.trim(),
        body: editorState.footerBody.trim(),
        links: parseFooterLinks(editorState.footerLinksText),
        note: editorState.footerNote.trim()
      },
      branding: {
        logoUrl: editorState.logoUrl.trim(),
        logoAlt: editorState.logoAlt.trim(),
        faviconUrl: editorState.faviconUrl.trim(),
        browserTitle: editorState.browserTitle.trim()
      },
      heroStats: editorState.heroStats
        .map((item) => ({ value: item.value.trim(), label: item.label.trim() }))
        .filter((item) => item.value || item.label),
      landingHighlights: normalizeLines(editorState.highlightsText, defaultSiteSettings.landingHighlights),
      formTips: normalizeLines(editorState.tipsText, defaultSiteSettings.formTips),
      howItWorksTitle: editorState.howItWorksTitle.trim(),
      howItWorksSteps: editorState.howItWorksSteps
        .map((item) => ({ title: item.title.trim(), body: item.body.trim() }))
        .filter((item) => item.title || item.body),
      locationHierarchy: parsedLocationHierarchy,
      theme: {
        palette: editorState.palette,
        heroLayout: editorState.heroLayout,
        backgroundStyle: editorState.backgroundStyle,
        pattern: editorState.pattern,
        patternsEnabled: editorState.patternsEnabled,
        patternMotion: editorState.patternMotion,
        mobileBackgroundStyle: editorState.mobileBackgroundStyle,
        desktopBackgroundStyle: editorState.desktopBackgroundStyle,
        mobilePattern: editorState.mobilePattern,
        desktopPattern: editorState.desktopPattern,
        mobilePatternsEnabled: editorState.mobilePatternsEnabled,
        desktopPatternsEnabled: editorState.desktopPatternsEnabled,
        mobilePatternMotion: editorState.mobilePatternMotion,
        desktopPatternMotion: editorState.desktopPatternMotion,
        mobileCtaTrace: editorState.mobileCtaTrace,
        desktopCtaTrace: editorState.desktopCtaTrace,
        mobileCtaAnimation: editorState.mobileCtaAnimation,
        desktopCtaAnimation: editorState.desktopCtaAnimation,
        mobileHeroAnimation: editorState.mobileHeroAnimation,
        desktopHeroAnimation: editorState.desktopHeroAnimation,
        mobileLoadAnimation: editorState.mobileLoadAnimation,
        desktopLoadAnimation: editorState.desktopLoadAnimation,
        ctaPulse: editorState.ctaPulse,
        formTipsLayout: editorState.formTipsLayout,
        colors: {
          primary: editorState.primary,
          primaryDeep: editorState.primaryDeep,
          primarySoft: editorState.primarySoft,
          primaryGlow: `${editorState.primary}33`,
          textOnPrimary: "#ffffff",
          accent: editorState.accent,
          accentStrong: editorState.accentStrong,
          pageBackground: editorState.pageBackground,
          pageBackgroundAlt: editorState.pageBackgroundAlt,
          surfaceBackground: editorState.surfaceBackground,
          surfaceMuted: editorState.surfaceMuted,
          fieldBackground: editorState.fieldBackground,
          headerBackground: editorState.headerBackground,
          footerBackground: editorState.footerBackground,
          footerTextColor: editorState.footerTextColor,
          footerMutedTextColor: editorState.footerMutedTextColor,
          footerButtonBackground: editorState.footerButtonBackground,
          footerButtonTextColor: editorState.footerButtonTextColor,
          borderColor: editorState.borderColor,
          textColor: editorState.textColor,
          mutedTextColor: editorState.mutedTextColor
        }
      }
    };

    try {
      const data = await updateSiteSettings(token, payload);
      setSettings(data.settings);
      await refreshSettings();
      setNotice(locationWarning ? `Changes saved, but locations were not updated: ${locationWarning}` : "Changes saved successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSettings = async () => {
    setSavingSettings(true);
    setError("");
    setNotice("");

    try {
      const data = await resetSiteSettings(token);
      setSettings(data.settings);
      await refreshSettings();
      setNotice("Settings reset to defaults.");
    } catch (requestError) {
      setError(requestError.message || "Unable to reset settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  if (!token && !hasHiddenGate) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: palette.pageBackground }}>
        <div className="w-full max-w-xl rounded-[32px] border p-8 shadow-soft" style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: palette.primary }}>
            Hidden admin access
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight" style={{ color: palette.textColor }}>Access path is not public</h1>
          <p className="mt-3 text-sm leading-6" style={{ color: palette.mutedTextColor }}>
            To open the admin panel, start from the listing form, enter the admin email, choose “No, I prefer not to be listed”, and continue.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/form" className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.primary }}>
              Go to form
            </Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: palette.pageBackground }}>
        <div className="w-full max-w-md rounded-[32px] border p-8 shadow-soft" style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: palette.primary }}>Hidden admin access</div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight" style={{ color: palette.textColor }}>Enter password</h1>
          <p className="mt-3 text-sm leading-6" style={{ color: palette.mutedTextColor }}>
            Hidden access was detected from the form. Continue with your admin password.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <input type="email" value={gatedEmail} readOnly className="w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted, color: palette.mutedTextColor }} />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" className="w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} autoComplete="current-password" />
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            <button type="submit" disabled={authenticating} className="w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300" style={{ backgroundColor: authenticating ? "#cbd5e1" : palette.primary }}>
              {authenticating ? "Signing in..." : "Open admin panel"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: palette.pageBackground }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border p-6 shadow-soft" style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <BrandLogo size="lg" />
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: palette.primary }}>Site control center</div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: palette.textColor }}>Hidden admin dashboard</h1>
                <p className="mt-2 text-sm" style={{ color: palette.mutedTextColor }}>
                  Use the menu to manage branding, page text, appearance, and responses without everything being on one screen.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleSaveSettings} disabled={savingSettings} className="rounded-2xl px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300" style={{ backgroundColor: savingSettings ? "#cbd5e1" : palette.primary }}>
                {savingSettings ? "Saving..." : "Save changes"}
              </button>
              <button type="button" onClick={handleLogout} className="rounded-2xl border px-5 py-3 text-sm font-semibold" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {notice ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[32px] border p-4 shadow-soft" style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition"
                  style={{
                    backgroundColor: activeTab === tab.id ? palette.accent : palette.surfaceBackground,
                    color: activeTab === tab.id ? palette.primaryDeep : palette.textColor,
                    border: `1px solid ${activeTab === tab.id ? palette.borderColor : "transparent"}`
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 rounded-[28px] border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
              <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Quick actions</div>
              <div className="mt-4 flex flex-col gap-2">
                <button type="button" onClick={handleResetSettings} className="rounded-2xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                  Reset defaults
                </button>
                <button type="button" onClick={() => loadSubmissions(token)} className="rounded-2xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                  Refresh submissions
                </button>
                <button type="button" onClick={handleExport} className="rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.primary }}>
                  Export Excel
                </button>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            {activeTab === "overview" ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <section className={cardClass} style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
                  <h2 className="text-xl font-semibold" style={{ color: palette.textColor }}>Current site summary</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {stats.map((item) => (
                      <div key={item.label} className="rounded-2xl border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                        <div className="text-sm" style={{ color: palette.mutedTextColor }}>{item.label}</div>
                        <div className="mt-2 text-3xl font-bold" style={{ color: palette.textColor }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className={cardClass} style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
                  <h2 className="text-xl font-semibold" style={{ color: palette.textColor }}>Brand preview</h2>
                  <div className="mt-6 rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: editorState.pageBackgroundAlt }}>
                    <BrandLogo
                      size="lg"
                      showWordmark
                      brandName={editorState.brandName}
                      supportLabel={editorState.supportLabel}
                      logoUrl={editorState.logoUrl}
                      logoAlt={editorState.logoAlt}
                    />
                    <div className="mt-5 rounded-3xl px-5 py-4 text-sm font-semibold text-white" style={{ backgroundColor: editorState.primary }}>
                      {editorState.heroPrimaryCta}
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {activeTab === "branding" ? (
              <section className={cardClass} style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
                <h2 className="text-2xl font-semibold" style={{ color: palette.textColor }}>Branding</h2>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Brand name
                      <input type="text" value={editorState.brandName} onChange={(event) => applyEditorChange("brandName", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Support label
                      <input type="text" value={editorState.supportLabel} onChange={(event) => applyEditorChange("supportLabel", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Browser tab title
                      <input type="text" value={editorState.browserTitle} onChange={(event) => applyEditorChange("browserTitle", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Logo alt text
                      <input type="text" value={editorState.logoAlt} onChange={(event) => applyEditorChange("logoAlt", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Logo URL or data URL
                      <textarea rows={4} value={editorState.logoUrl} onChange={(event) => applyEditorChange("logoUrl", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Favicon URL or data URL
                      <textarea rows={4} value={editorState.faviconUrl} onChange={(event) => applyEditorChange("faviconUrl", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Upload logo</div>
                      <input type="file" accept="image/*" onChange={(event) => handleImageUpload("logoUrl", event)} className="mt-3 block w-full text-sm" />
                    </div>
                    <div className="rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Upload favicon</div>
                      <input type="file" accept="image/*" onChange={(event) => handleImageUpload("faviconUrl", event)} className="mt-3 block w-full text-sm" />
                    </div>
                    <div className="rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: editorState.pageBackgroundAlt }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Preview</div>
                      <div className="mt-4 flex items-center justify-between rounded-3xl border px-4 py-4" style={{ borderColor: palette.borderColor, backgroundColor: editorState.headerBackground }}>
                        <BrandLogo
                          size="md"
                          showWordmark
                          brandName={editorState.brandName}
                          supportLabel={editorState.supportLabel}
                          logoUrl={editorState.logoUrl}
                          logoAlt={editorState.logoAlt}
                        />
                        <div className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: editorState.primary }}>
                          {editorState.heroPrimaryCta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === "content" ? (
              <section className={cardClass} style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
                <h2 className="text-2xl font-semibold" style={{ color: palette.textColor }}>Page content</h2>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    {[
                      ["heroBadge", "Hero badge"],
                      ["heroTitle", "Hero title"],
                      ["heroDescription", "Hero description"],
                      ["heroPrimaryCta", "Primary CTA"],
                      ["heroSecondaryCta", "Secondary CTA"],
                      ["formPageTitle", "Form page title"],
                      ["formPageDescription", "Form page description"],
                      ["formBanner", "Form banner"],
                      ["whyItMattersTitle", "Why it matters title"],
                      ["whyItMattersBody", "Why it matters body"],
                      ["successTitle", "Success title"],
                      ["successBodyConsented", "Success body for consented"],
                      ["successBodyDeclined", "Success body for declined"]
                    ].map(([field, label]) => (
                      <label key={field} className="block text-sm font-medium" style={{ color: palette.textColor }}>
                        {label}
                        <textarea rows={field.includes("Title") ? 2 : 4} value={editorState[field]} onChange={(event) => applyEditorChange(field, event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                      </label>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3 rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Homepage stat cards</div>
                          <p className="mt-1 text-sm" style={{ color: palette.mutedTextColor }}>Add, update, or remove the stat cards shown under the hero section.</p>
                        </div>
                        <button type="button" onClick={() => addEditorListItem("heroStats", { value: "", label: "" })} className="rounded-2xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                          Add stat card
                        </button>
                      </div>
                      <div className="space-y-3">
                        {editorState.heroStats.map((item, index) => (
                          <div key={`stat-${index}`} className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-[1fr_1fr_auto]" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
                            <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                              Value
                              <input type="text" value={item.value} onChange={(event) => updateEditorListItem("heroStats", index, "value", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                            </label>
                            <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                              Label
                              <input type="text" value={item.label} onChange={(event) => updateEditorListItem("heroStats", index, "label", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                            </label>
                            <div className="flex items-end">
                              <button type="button" onClick={() => removeEditorListItem("heroStats", index)} disabled={editorState.heroStats.length <= 1} className="rounded-2xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Highlights
                      <textarea rows={6} value={editorState.highlightsText} onChange={(event) => applyEditorChange("highlightsText", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Form tips
                      <textarea rows={5} value={editorState.tipsText} onChange={(event) => applyEditorChange("tipsText", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <div className="space-y-4 rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Footer content</div>
                        <p className="mt-1 text-sm" style={{ color: palette.mutedTextColor }}>Edit the public footer text, links, layout, or turn it off completely.</p>
                      </div>
                      <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, color: palette.textColor, backgroundColor: palette.surfaceBackground }}>
                        Show footer
                        <input type="checkbox" checked={editorState.footerEnabled} onChange={(event) => applyEditorChange("footerEnabled", event.target.checked)} />
                      </label>
                      <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                        Footer layout
                        <select value={editorState.footerLayout} onChange={(event) => applyEditorChange("footerLayout", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                          <option value="columns">Columns</option>
                          <option value="split">Split</option>
                          <option value="stacked">Stacked</option>
                        </select>
                      </label>
                      <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                        Footer title
                        <input type="text" value={editorState.footerTitle} onChange={(event) => applyEditorChange("footerTitle", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                      </label>
                      <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                        Footer body
                        <textarea rows={3} value={editorState.footerBody} onChange={(event) => applyEditorChange("footerBody", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                      </label>
                      <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                        Footer links
                        <textarea rows={4} value={editorState.footerLinksText} onChange={(event) => applyEditorChange("footerLinksText", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 font-mono text-sm outline-none" style={{ borderColor: palette.borderColor }} />
                        <span className="mt-2 block text-xs" style={{ color: palette.mutedTextColor }}>Use one link per line: Label | /path-or-url</span>
                      </label>
                      <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                        Footer note
                        <input type="text" value={editorState.footerNote} onChange={(event) => applyEditorChange("footerNote", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                      </label>
                    </div>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      How it works title
                      <textarea rows={2} value={editorState.howItWorksTitle} onChange={(event) => applyEditorChange("howItWorksTitle", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                    </label>
                    <div className="space-y-3 rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: palette.textColor }}>How it works cards</div>
                          <p className="mt-1 text-sm" style={{ color: palette.mutedTextColor }}>Add as many step cards as you need for the homepage.</p>
                        </div>
                        <button type="button" onClick={() => addEditorListItem("howItWorksSteps", { title: "", body: "" })} className="rounded-2xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                          Add step card
                        </button>
                      </div>
                      <div className="space-y-3">
                        {editorState.howItWorksSteps.map((item, index) => (
                          <div key={`step-${index}`} className="space-y-3 rounded-2xl border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
                            <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                              Step title
                              <textarea rows={2} value={item.title} onChange={(event) => updateEditorListItem("howItWorksSteps", index, "title", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                            </label>
                            <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                              Step body
                              <textarea rows={3} value={item.body} onChange={(event) => updateEditorListItem("howItWorksSteps", index, "body", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                            </label>
                            <div className="flex justify-end">
                              <button type="button" onClick={() => removeEditorListItem("howItWorksSteps", index)} disabled={editorState.howItWorksSteps.length <= 1} className="rounded-2xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === "locations" ? (
              <section className={cardClass} style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold" style={{ color: palette.textColor }}>Locations</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: palette.mutedTextColor }}>
                      Paste or edit county, sub-county, and ward data in a simple text format. The public form will use this admin-managed hierarchy as its source of truth.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyEditorChange("locationHierarchyText", defaultLocationHierarchyText)}
                    className="rounded-2xl border px-4 py-3 text-sm font-semibold"
                    style={{ borderColor: palette.borderColor, color: palette.textColor }}
                  >
                    Restore default hierarchy
                  </button>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      County hierarchy text
                      <textarea
                        rows={28}
                        value={editorState.locationHierarchyText}
                        onChange={(event) => applyEditorChange("locationHierarchyText", event.target.value)}
                        className="mt-2 w-full rounded-2xl border px-4 py-3 font-mono text-sm outline-none"
                        style={{ borderColor: locationPreview.error ? "#f43f5e" : palette.borderColor }}
                      />
                    </label>
                    <div className="rounded-[28px] border p-4 text-sm" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted, color: palette.mutedTextColor }}>
                      Use this format: <span className="font-semibold">`1. County Name`</span> on one line, then <span className="font-semibold">`- Sub-county: Ward 1, Ward 2`</span> on the lines below it.
                    </div>
                    {locationPreview.error ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {locationPreview.error}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        The location hierarchy text is valid and ready to save.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                      {[
                        ["Counties", locationPreview.stats.countyCount],
                        ["Sub-counties", locationPreview.stats.subCountyCount],
                        ["Wards", locationPreview.stats.wardCount]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[24px] border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                          <div className="text-sm" style={{ color: palette.mutedTextColor }}>{label}</div>
                          <div className="mt-2 text-3xl font-bold" style={{ color: palette.textColor }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Preview</div>
                      <div className="mt-4 space-y-3">
                        {locationPreview.counties.map((item) => (
                          <div key={item.county} className="rounded-2xl border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
                            <div className="text-sm font-semibold" style={{ color: palette.primaryDeep }}>{item.county}</div>
                            <div className="mt-1 text-sm" style={{ color: palette.mutedTextColor }}>
                              {item.subCountyCount} sub-counties, {item.wardCount} wards
                            </div>
                            <div className="mt-2 text-sm" style={{ color: palette.textColor }}>
                              {item.firstSubCounties.join(", ")}
                            </div>
                          </div>
                        ))}
                        {!locationPreview.counties.length && !locationPreview.error ? (
                          <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground, color: palette.mutedTextColor }}>
                            Paste county data to preview it here.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === "appearance" ? (
              <section className={cardClass} style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
                <h2 className="text-2xl font-semibold" style={{ color: palette.textColor }}>Appearance</h2>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Color palette
                      <select value={editorState.palette} onChange={(event) => applyEditorChange("palette", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                        {paletteOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Hero layout
                      <select value={editorState.heroLayout} onChange={(event) => applyEditorChange("heroLayout", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                        <option value="split">Split</option>
                        <option value="stacked">Stacked</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Background style
                      <select value={editorState.backgroundStyle} onChange={(event) => applyEditorChange("backgroundStyle", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                        {backgroundOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Pattern
                      <select value={editorState.pattern} onChange={(event) => applyEditorChange("pattern", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                        {patternOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <div className="rounded-[28px] border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Mobile background animation</div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Mobile background style
                          <select value={editorState.mobileBackgroundStyle} onChange={(event) => applyEditorChange("mobileBackgroundStyle", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {backgroundOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Mobile pattern
                          <select value={editorState.mobilePattern} onChange={(event) => applyEditorChange("mobilePattern", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {patternOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {[
                          ["mobilePatternsEnabled", "Enable mobile patterns"],
                          ["mobilePatternMotion", "Animate mobile patterns"]
                        ].map(([field, label]) => (
                          <label key={field} className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, color: palette.textColor, backgroundColor: palette.surfaceBackground }}>
                            {label}
                            <input type="checkbox" checked={editorState[field]} onChange={(event) => applyEditorChange(field, event.target.checked)} />
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[28px] border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Mobile button, title, and card motion</div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, color: palette.textColor, backgroundColor: palette.surfaceBackground }}>
                          Show animated CTA line on mobile
                          <input type="checkbox" checked={editorState.mobileCtaTrace} onChange={(event) => applyEditorChange("mobileCtaTrace", event.target.checked)} />
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Mobile CTA movement
                          <select value={editorState.mobileCtaAnimation} onChange={(event) => applyEditorChange("mobileCtaAnimation", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {animationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Mobile hero title movement
                          <select value={editorState.mobileHeroAnimation} onChange={(event) => applyEditorChange("mobileHeroAnimation", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {animationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Mobile card loading style
                          <select value={editorState.mobileLoadAnimation} onChange={(event) => applyEditorChange("mobileLoadAnimation", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {loadAnimationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                      </div>
                    </div>
                    <div className="rounded-[28px] border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Desktop background animation</div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Desktop background style
                          <select value={editorState.desktopBackgroundStyle} onChange={(event) => applyEditorChange("desktopBackgroundStyle", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {backgroundOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Desktop pattern
                          <select value={editorState.desktopPattern} onChange={(event) => applyEditorChange("desktopPattern", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {patternOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {[
                          ["desktopPatternsEnabled", "Enable desktop patterns"],
                          ["desktopPatternMotion", "Animate desktop patterns"]
                        ].map(([field, label]) => (
                          <label key={field} className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, color: palette.textColor, backgroundColor: palette.surfaceBackground }}>
                            {label}
                            <input type="checkbox" checked={editorState[field]} onChange={(event) => applyEditorChange(field, event.target.checked)} />
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[28px] border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                      <div className="text-sm font-semibold" style={{ color: palette.textColor }}>Desktop button, title, and card motion</div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, color: palette.textColor, backgroundColor: palette.surfaceBackground }}>
                          Show animated CTA line on desktop
                          <input type="checkbox" checked={editorState.desktopCtaTrace} onChange={(event) => applyEditorChange("desktopCtaTrace", event.target.checked)} />
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Desktop CTA movement
                          <select value={editorState.desktopCtaAnimation} onChange={(event) => applyEditorChange("desktopCtaAnimation", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {animationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Desktop hero title movement
                          <select value={editorState.desktopHeroAnimation} onChange={(event) => applyEditorChange("desktopHeroAnimation", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {animationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                          Desktop card loading style
                          <select value={editorState.desktopLoadAnimation} onChange={(event) => applyEditorChange("desktopLoadAnimation", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                            {loadAnimationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                      </div>
                    </div>
                    {[
                      ["patternsEnabled", "Enable background patterns"],
                      ["patternMotion", "Animate patterns"],
                      ["ctaPulse", "Pulse the start-form CTA"]
                    ].map(([field, label]) => (
                      <label key={field} className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, color: palette.textColor }}>
                        {label}
                        <input type="checkbox" checked={editorState[field]} onChange={(event) => applyEditorChange(field, event.target.checked)} />
                      </label>
                    ))}
                    <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                      Form tips layout
                      <select value={editorState.formTipsLayout} onChange={(event) => applyEditorChange("formTipsLayout", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }}>
                        <option value="row">Row</option>
                        <option value="stack">Stack</option>
                      </select>
                    </label>
                  </div>
                  <div className="space-y-4">
                    {[
                      ["primary", "Primary color"],
                      ["primaryDeep", "Primary deep"],
                      ["primarySoft", "Primary soft"],
                      ["accent", "Accent background"],
                      ["accentStrong", "Accent strong text"],
                      ["pageBackground", "Page background"],
                      ["pageBackgroundAlt", "Page background alt"],
                      ["surfaceBackground", "Surface background"],
                      ["surfaceMuted", "Surface muted"],
                      ["fieldBackground", "Input / answer box background"],
                      ["headerBackground", "Header background"],
                      ["footerBackground", "Footer background"],
                      ["footerTextColor", "Footer text color"],
                      ["footerMutedTextColor", "Footer muted text color"],
                      ["footerButtonBackground", "Footer button background"],
                      ["footerButtonTextColor", "Footer button text color"],
                      ["borderColor", "Border color"],
                      ["textColor", "Text color"],
                      ["mutedTextColor", "Muted text color"]
                    ].map(([field, label]) => (
                      <label key={field} className="block text-sm font-medium" style={{ color: palette.textColor }}>
                        {label}
                        <div className="mt-2 flex items-center gap-3">
                          <input type="color" value={editorState[field].startsWith("#") ? editorState[field] : "#ffffff"} onChange={(event) => applyEditorChange(field, event.target.value)} className="h-12 w-14 rounded-xl border" style={{ borderColor: palette.borderColor }} />
                          <input type="text" value={editorState[field]} onChange={(event) => applyEditorChange(field, event.target.value)} className="w-full rounded-2xl border px-4 py-3 outline-none" style={{ borderColor: palette.borderColor }} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === "responses" ? (
              <section className={cardClass} style={{ backgroundColor: palette.surfaceBackground, borderColor: palette.borderColor }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-semibold" style={{ color: palette.textColor }}>Responses</h2>
                  <button
                    type="button"
                    onClick={handleCopyAllSubmissions}
                    disabled={!submissions.length}
                    className="rounded-2xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: palette.borderColor, color: palette.textColor }}
                  >
                    Copy all responses
                  </button>
                </div>
                <div className="mt-6 overflow-hidden rounded-[28px] border" style={{ borderColor: palette.borderColor }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y text-left" style={{ borderColor: palette.borderColor }}>
                      <thead style={{ backgroundColor: palette.surfaceMuted }}>
                        <tr>
                          {["Email", "Consent", "Name", "Phone", "Category / reason", "License details", "County", "Coverage", "Submitted", "Actions"].map((header) => (
                            <th key={header} className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: palette.mutedTextColor }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: palette.surfaceBackground }}>
                        {loading ? (
                          <tr><td className="px-4 py-8 text-sm" colSpan={10} style={{ color: palette.mutedTextColor }}>Loading submissions...</td></tr>
                        ) : submissions.length > 0 ? (
                          submissions.map((submission) => {
                            const coverageText = formatSubmissionCoverage(submission);
                            const countyText = formatSubmissionCounties(submission);
                            const licenseText = formatSubmissionLicenses(submission);

                            return (
                              <tr key={submission.id} className="align-top" style={{ borderTop: `1px solid ${palette.borderColor}` }}>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "email", submission.email)}</td>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "consent", submission.consent ? "Yes" : "No")}</td>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "name", submission.full_name || "-")}</td>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "phone", submission.phone_number || "-")}</td>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "category", submission.category || submission.decline_reason || "-")}</td>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "licenses", licenseText)}</td>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "counties", countyText)}</td>
                                <td className="px-4 py-4 text-sm">
                                  {renderLimitedCell(submission.id, "coverage", coverageText)}
                                </td>
                                <td className="px-4 py-4 text-sm">{renderLimitedCell(submission.id, "submitted", new Date(submission.created_at).toLocaleString())}</td>
                                <td className="px-4 py-4 text-sm">
                                  <div className="flex flex-col gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCopySubmission(submission)}
                                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                                      style={{ borderColor: palette.borderColor, color: palette.textColor }}
                                    >
                                      Copy row
                                    </button>
                                    {confirmingDelete === submission.id ? (
                                      <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium" style={{ color: "#dc2626" }}>Delete this?</span>
                                        <div className="flex gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteSubmission(submission.id)}
                                            className="rounded-lg px-2 py-1 text-xs font-semibold text-white"
                                            style={{ backgroundColor: "#dc2626" }}
                                          >
                                            Yes
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmingDelete(null)}
                                            className="rounded-lg border px-2 py-1 text-xs font-semibold"
                                            style={{ borderColor: palette.borderColor, color: palette.textColor }}
                                          >
                                            No
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmingDelete(submission.id)}
                                        className="rounded-xl border px-3 py-2 text-xs font-semibold"
                                        style={{ borderColor: "#fca5a5", color: "#dc2626" }}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td className="px-4 py-8 text-sm" colSpan={10} style={{ color: palette.mutedTextColor }}>No submissions yet or the database is currently unavailable.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminConsolePage;
