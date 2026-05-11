import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext.jsx";

const isInternalLink = (href = "") => href.startsWith("/") || href.startsWith("#");
const isHashLink = (href = "") => href.startsWith("#") || href.startsWith("/#");
const draftStorageKey = "kerea-form-draft-v1";

const hasFormDraft = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    const parsedDraft = rawDraft ? JSON.parse(rawDraft) : null;
    const formValues = parsedDraft?.formValues || {};

    return Boolean(
      formValues.email ||
        formValues.consent !== null ||
        formValues.fullName ||
        formValues.phoneNumber ||
        formValues.category?.length ||
        formValues.declineReason ||
        formValues.countyCoverageEntries?.some((entry) => entry.county)
    );
  } catch {
    return false;
  }
};

const SiteFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { palette, settings } = useSiteSettings();
  const footer = settings.footer || {};

  if (!footer.enabled) {
    return null;
  }

  const legacyLinks = [
    { label: footer.primaryLinkLabel, href: footer.primaryLinkHref },
    { label: footer.secondaryLinkLabel, href: footer.secondaryLinkHref }
  ].filter((item) => item.label && item.href);
  const links = Array.isArray(footer.links) && footer.links.length
    ? footer.links.filter((item) => item.label && item.href)
    : legacyLinks;
  const draftExists = hasFormDraft();
  const resolvedLinks = links.map((link) =>
    draftExists && link.href === "/form" && link.label.toLowerCase().includes("start")
      ? { ...link, label: link.label.replace(/start form/i, "Resume form").replace(/start/i, "Resume") }
      : link
  );
  const body = footer.body || footer.description || "";
  const note = footer.note || footer.copyright || "";
  const stacked = footer.layout === "stacked";
  const footerButtonStyle = {
    borderColor: palette.borderColor,
    color: palette.footerButtonTextColor || palette.footerTextColor || palette.textColor,
    backgroundColor: palette.footerButtonBackground || palette.surfaceBackground
  };
  const scrollToHashTarget = (hash) => {
    const target = document.getElementById(hash.replace("#", ""));

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const handleHashLinkClick = (href, event) => {
    event.preventDefault();

    const hash = href.includes("#") ? `#${href.split("#").pop()}` : href;

    if (location.pathname !== "/") {
      navigate({ pathname: "/", hash });
      window.setTimeout(() => scrollToHashTarget(hash), 100);
      return;
    }

    window.history.replaceState(null, "", hash);
    scrollToHashTarget(hash);
  };

  return (
    <footer className="relative z-10 border-t" style={{ borderColor: palette.borderColor, backgroundColor: palette.footerBackground || palette.headerBackground }}>
      <div className={`mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8 ${stacked ? "text-center" : "md:grid-cols-[1fr_auto] md:items-center"}`}>
        <div className={stacked ? "mx-auto max-w-2xl" : "max-w-2xl"}>
          <div className="text-lg font-bold" style={{ color: palette.footerTextColor || palette.textColor }}>
            {footer.title || settings.brandName}
          </div>
          {body ? (
            <p className="mt-2 text-sm leading-6" style={{ color: palette.footerMutedTextColor || palette.mutedTextColor }}>
              {body}
            </p>
          ) : null}
          {note ? (
            <div className="mt-3 text-xs" style={{ color: palette.footerMutedTextColor || palette.mutedTextColor }}>
              {note}
            </div>
          ) : null}
        </div>
        {resolvedLinks.length ? (
          <nav className={`flex flex-wrap gap-3 ${stacked ? "justify-center" : "md:justify-end"}`}>
            {resolvedLinks.map((link) =>
              isHashLink(link.href) ? (
                <a key={`${link.label}-${link.href}`} href={link.href.startsWith("#") ? `/${link.href}` : link.href} onClick={(event) => handleHashLinkClick(link.href, event)} className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5" style={footerButtonStyle}>
                  {link.label}
                </a>
              ) : isInternalLink(link.href) ? (
                <Link key={`${link.label}-${link.href}`} to={link.href} className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5" style={footerButtonStyle}>
                  {link.label}
                </Link>
              ) : (
                <a key={`${link.label}-${link.href}`} href={link.href} className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5" style={footerButtonStyle}>
                  {link.label}
                </a>
              )
            )}
          </nav>
        ) : null}
      </div>
    </footer>
  );
};

export default SiteFooter;
