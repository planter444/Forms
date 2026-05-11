import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedPatternBackground from "../components/AnimatedPatternBackground.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useSiteSettings } from "../context/SiteSettingsContext.jsx";

const getDeviceState = () =>
  typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false;

const normalizeMotion = (value) => {
  if (value === "wiggle") {
    return "shake";
  }

  if (value === "glow") {
    return "breathe";
  }

  return value;
};

const getMotionClass = (value) => {
  const normalizedValue = normalizeMotion(value);
  return normalizedValue && normalizedValue !== "none" ? `motion-${normalizedValue}` : "";
};

const LandingPage = () => {
  const { palette, settings } = useSiteSettings();
  const [isMobile, setIsMobile] = useState(getDeviceState);
  const splitLayout = settings.theme.heroLayout === "split";
  const ctaTraceEnabled = isMobile
    ? settings.theme.mobileCtaTrace ?? settings.theme.mobileCtaTraceEnabled
    : settings.theme.desktopCtaTrace ?? settings.theme.desktopCtaTraceEnabled;
  const ctaAnimation = isMobile
    ? settings.theme.mobileCtaAnimation || settings.theme.mobileCtaMotion
    : settings.theme.desktopCtaAnimation || settings.theme.desktopCtaMotion;
  const heroAnimation = isMobile
    ? settings.theme.mobileHeroAnimation || settings.theme.mobileBrandMotion
    : settings.theme.desktopHeroAnimation || settings.theme.desktopBrandMotion;
  const loadAnimation = isMobile
    ? settings.theme.mobileLoadAnimation || settings.theme.mobileSurfaceMotion
    : settings.theme.desktopLoadAnimation || settings.theme.desktopSurfaceMotion;
  const ctaMotionClass = getMotionClass(ctaAnimation);
  const heroCtaAnimation = settings.theme.heroCtaAnimation || "white-line";
  const heroCtaAnimationClass = heroCtaAnimation === "white-line" ? "hero-cta-border-trace" : getMotionClass(heroCtaAnimation);
  const heroMotionClass = getMotionClass(heroAnimation);
  const loadMotionClass = getMotionClass(loadAnimation);
  const ctaTraceClass = ctaTraceEnabled !== false ? "cta-trace" : "";
  const mobileHeaderSize = settings.theme.mobileHeaderSize || "large";
  const mobileHeaderClass = mobileHeaderSize === "xl" ? "py-7" : mobileHeaderSize === "compact" ? "py-4" : "py-6";
  const mobileLogoSize = mobileHeaderSize === "xl" ? "lg" : mobileHeaderSize === "compact" ? "sm" : "md";
  const getOddCardClass = (length, index) =>
    length % 2 === 1 && index === length - 1
      ? "col-span-2 mx-auto w-full max-w-[18rem] xl:col-span-1 xl:max-w-none"
      : "";
  const scrollToLearnMore = (event) => {
    event.preventDefault();
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "#how-it-works");
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const heroStats = useMemo(() => settings.heroStats || [], [settings.heroStats]);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: palette.pageBackground, color: palette.textColor }}>
      <AnimatedPatternBackground />

      <header className="relative z-10 border-b shadow-sm backdrop-blur-xl" style={{ borderColor: palette.borderColor, backgroundColor: palette.headerBackground }}>
        <div className={`mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 ${mobileHeaderClass} sm:justify-between sm:gap-4 sm:px-6 sm:py-4 lg:px-8`}>
          <BrandLogo size={isMobile ? mobileLogoSize : "md"} showWordmark />
          <Link
            to="/form"
            className={`${ctaTraceClass} ${ctaMotionClass} cta-border-sweep hidden shrink-0 items-center justify-center rounded-full px-4 py-2 text-xs font-bold shadow-soft transition hover:scale-[1.02] sm:inline-flex sm:px-6 sm:py-3 sm:text-sm ${
              settings.theme.ctaPulse && ctaAnimation === "pulse" ? "cta-pulse" : ""
            }`}
            style={{
              color: palette.textOnPrimary,
              "--trace-color": palette.ctaTraceColor || "#ffffff",
              "--trace-accent": palette.ctaTraceAccent || palette.primarySoft,
              "--cta-fill": palette.primary,
              boxShadow: `0 10px 28px ${palette.primaryGlow}`
            }}
          >
            {settings.heroPrimaryCta}
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section
          className={`mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:gap-10 lg:py-20 ${loadMotionClass} ${
            splitLayout ? "lg:grid-cols-[1.05fr_0.95fr]" : ""
          }`}
        >
          <div className={`${splitLayout ? "self-center" : "mx-auto max-w-4xl text-center"}`}>
            <div
              className="inline-flex rounded-full border px-4 py-2 text-sm font-medium shadow-sm"
              style={{ borderColor: palette.primaryGlow, backgroundColor: palette.accent, color: palette.accentStrong }}
            >
              {settings.heroBadge}
            </div>
            <h1 className={`mt-5 max-w-4xl text-2xl font-black leading-[1.08] tracking-tight sm:text-[2.35rem] sm:leading-[1.02] lg:text-5xl xl:text-6xl ${heroMotionClass}`} style={{ color: palette.textColor }}>
              {settings.heroTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 sm:mt-4 sm:text-lg sm:leading-8" style={{ color: palette.mutedTextColor }}>
              {settings.heroDescription}
            </p>
            <div className={`mt-7 flex flex-row items-center gap-2 sm:gap-3 ${splitLayout ? "" : "justify-center"}`}>
              <Link
                to="/form"
                className={`${heroCtaAnimationClass} inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold shadow-soft transition hover:-translate-y-0.5 sm:rounded-3xl sm:px-8 sm:py-5 sm:text-lg`}
                style={{
                  color: palette.textOnPrimary,
                  "--cta-fill": palette.primary,
                  backgroundColor: palette.primary,
                  boxShadow: `0 12px 35px ${palette.primaryGlow}`
                }}
              >
                {settings.heroPrimaryCta}
              </Link>
              <a
                href="#how-it-works"
                onClick={scrollToLearnMore}
                className="inline-flex items-center justify-center rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition sm:rounded-3xl sm:px-8 sm:py-5 sm:text-lg"
                style={{ borderColor: palette.primary, backgroundColor: palette.surfaceBackground, color: palette.primaryDeep }}
              >
                {settings.heroSecondaryCta}
              </a>
            </div>
            <div className={`mt-10 grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-3 ${loadAnimation === "stagger" ? "motion-stagger" : ""}`}>
              {heroStats.map((item, index) => {
                const oddCardClass = getOddCardClass(heroStats.length, index);

                return (
                  <div
                    key={`${item.value}-${item.label}`}
                    className={`rounded-[28px] border p-5 shadow-soft backdrop-blur-md ${oddCardClass}`}
                    style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  >
                    <div className="text-3xl font-black" style={{ color: palette.primary }}>
                      {item.value}
                    </div>
                    <div className="mt-2 text-sm" style={{ color: palette.mutedTextColor }}>{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${splitLayout ? "" : "mx-auto max-w-4xl"}`}>
            <div className="rounded-[32px] border p-6 shadow-soft backdrop-blur-xl lg:p-8" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
              <div
                className="rounded-[28px] p-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${palette.primaryDeep}, ${palette.primary})`
                }}
              >
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  What you’ll submit
                </div>
                <div className="mt-6 space-y-4">
                  {settings.landingHighlights.map((item) => (
                    <div key={item} className="flex gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white" />
                      <p className="text-sm leading-6 text-white/95">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 rounded-[28px] border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
                <div className="text-sm font-semibold" style={{ color: palette.textColor }}>{settings.whyItMattersTitle}</div>
                <p className="mt-2 text-sm leading-6" style={{ color: palette.mutedTextColor }}>{settings.whyItMattersBody}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative border-y backdrop-blur-xl" style={{ borderColor: palette.borderColor, backgroundColor: palette.pageBackgroundAlt }}>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: palette.primary }}>
                How it works
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {settings.howItWorksTitle}
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-5 xl:grid-cols-3">
              {settings.howItWorksSteps.map((item, index) => (
                <article key={item.title} className={`rounded-[28px] border p-6 shadow-sm ${getOddCardClass(settings.howItWorksSteps.length, index)}`} style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold"
                    style={{ backgroundColor: palette.primarySoft, color: palette.primaryDeep }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold" style={{ color: palette.textColor }}>{item.title}</h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: palette.mutedTextColor }}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LandingPage;
