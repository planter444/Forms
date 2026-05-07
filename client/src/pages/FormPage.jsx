import { Link } from "react-router-dom";
import AnimatedPatternBackground from "../components/AnimatedPatternBackground.jsx";
import EnhancedMultiStepForm from "../components/EnhancedMultiStepForm.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useSiteSettings } from "../context/SiteSettingsContext.jsx";

const FormPage = () => {
  const { palette, settings } = useSiteSettings();
  const rowLayout = settings.theme.formTipsLayout === "row";

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: palette.pageBackground }}>
      <AnimatedPatternBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/" className="text-sm font-semibold" style={{ color: palette.primaryDeep }}>
              ← Back to home
            </Link>
            <h1 className="mt-3 text-3xl font-bold tracking-tight" style={{ color: palette.textColor }}>{settings.formPageTitle}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 sm:text-base" style={{ color: palette.mutedTextColor }}>
              {settings.formPageDescription}
            </p>
          </div>
          <div
            className="rounded-3xl border px-5 py-4 text-sm shadow-sm"
            style={{ borderColor: palette.primaryGlow, backgroundColor: palette.accent, color: palette.primaryDeep }}
          >
            {settings.formBanner}
          </div>
        </div>

        <section className="mb-6 rounded-[30px] border p-4 shadow-soft backdrop-blur-md sm:p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: palette.primarySoft }}>
            Before you begin
          </div>
          <div className={`grid gap-3 ${rowLayout ? "md:grid-cols-3" : ""}`}>
            {settings.formTips.map((tip) => (
              <div key={tip} className="rounded-2xl border p-4 text-sm leading-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted, color: palette.textColor }}>
                {tip}
              </div>
            ))}
          </div>
        </section>

        <section>
          <EnhancedMultiStepForm />
        </section>
      </div>
      <SiteFooter />
    </div>
  );
};

export default FormPage;
