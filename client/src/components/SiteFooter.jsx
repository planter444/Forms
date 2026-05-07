import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext.jsx";

const isInternalLink = (href = "") => href.startsWith("/") || href.startsWith("#");

const SiteFooter = () => {
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
  const body = footer.body || footer.description || "";
  const note = footer.note || footer.copyright || "";
  const stacked = footer.layout === "stacked";
  const footerButtonStyle = {
    borderColor: palette.borderColor,
    color: palette.footerButtonTextColor || palette.footerTextColor || palette.textColor,
    backgroundColor: palette.footerButtonBackground || palette.surfaceBackground
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
        {links.length ? (
          <nav className={`flex flex-wrap gap-3 ${stacked ? "justify-center" : "md:justify-end"}`}>
            {links.map((link) =>
              isInternalLink(link.href) ? (
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
