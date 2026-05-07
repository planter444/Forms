import { Link, useLocation } from "react-router-dom";
import AnimatedPatternBackground from "../components/AnimatedPatternBackground.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useSiteSettings } from "../context/SiteSettingsContext.jsx";

const SuccessPage = () => {
  const location = useLocation();
  const { palette, settings } = useSiteSettings();
  const consent = location.state?.consent;
  const email = location.state?.email;

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden" style={{ backgroundColor: palette.pageBackground }}>
      <AnimatedPatternBackground />
      <div className="relative z-10 mx-auto my-12 w-full max-w-2xl rounded-[32px] border p-8 text-center shadow-soft backdrop-blur-xl sm:p-10" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white"
          style={{ backgroundColor: palette.primary }}
        >
          ✓
        </div>
        <div className="mt-6 text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: palette.primary }}>
          Submission received
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight" style={{ color: palette.textColor }}>
          {settings.successTitle}
        </h1>
        <p className="mt-4 text-base leading-7" style={{ color: palette.mutedTextColor }}>
          {consent ? settings.successBodyConsented : settings.successBodyDeclined}
          {email ? ` A follow-up can be sent to ${email}.` : ""}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: palette.primary }}
          >
            Return home
          </Link>
          <Link
            to="/form"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Submit another response
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default SuccessPage;
