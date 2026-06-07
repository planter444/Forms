import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSolarMkononiSettings } from "../lib/api.js";

const SolarMkononiPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSolarMkononiSettings();
        setSettings(data.settings);
      } catch (error) {
        console.error("Failed to load Solar Mkononi settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 mx-auto" />
          <p className="text-emerald-800">Loading Solar Mkononi...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
        <p className="text-emerald-800">Unable to load Solar Mkononi settings.</p>
      </div>
    );
  }

  const theme = settings.theme || {};
  const sections = settings.sections || {};

  return (
    <div style={{ backgroundColor: theme.backgroundColor || "#f0fdf4", color: theme.textColor || "#064e3b" }}>
      {sections.hero !== false && <HeroSection settings={settings} theme={theme} />}
      {sections.stats !== false && <StatsSection settings={settings} theme={theme} />}
      {sections.services !== false && <ServicesSection settings={settings} theme={theme} />}
      {sections.howItWorks !== false && <HowItWorksSection settings={settings} theme={theme} />}
      {sections.ussd !== false && <USSDSection settings={settings} theme={theme} />}
      {sections.paygo !== false && <PAYGOSection settings={settings} theme={theme} />}
      {sections.resourceLibrary !== false && <ResourceLibrarySection settings={settings} theme={theme} />}
      {sections.impact !== false && <ImpactSection settings={settings} theme={theme} />}
      {sections.partners !== false && <PartnersSection settings={settings} theme={theme} />}
      {sections.contact !== false && <ContactSection settings={settings} theme={theme} />}
      {sections.footer !== false && <FooterSection settings={settings} theme={theme} />}
    </div>
  );
};

const HeroSection = ({ settings, theme }) => {
  const hero = settings.hero || {};
  const branding = settings.branding || {};

  const heroStyle = {
    backgroundImage: hero.backgroundUrl ? `url(${hero.backgroundUrl})` : undefined,
    backgroundColor: hero.backgroundUrl ? undefined : theme.primaryColor || "#059669",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };

  const overlayStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4" style={heroStyle}>
      <div className="absolute inset-0" style={overlayStyle} />
      <div className="relative z-10 max-w-6xl mx-auto text-center text-white">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={branding.logoAlt || "Solar Mkononi"} className="h-20 mx-auto mb-8" />
        )}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{hero.headline || "Renewable Energy at Your Fingertips"}</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          {hero.description || "Connect with verified renewable energy suppliers, technicians, financial institutions, and innovative clean energy solutions through Solar Mkononi."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={hero.primaryCtaHref || "#services"}
            className="px-8 py-4 rounded-full font-bold text-white transition hover:scale-105"
            style={{ backgroundColor: theme.primaryColor || "#059669" }}
          >
            {hero.primaryCta || "Explore Services"}
          </a>
          <a
            href={hero.secondaryCtaHref || "#ussd"}
            className="px-8 py-4 rounded-full font-bold border-2 border-white text-white transition hover:scale-105"
          >
            {hero.secondaryCta || "Access USSD Platform"}
          </a>
        </div>
      </div>
    </section>
  );
};

const StatsSection = ({ settings, theme }) => {
  const stats = settings.stats || {};
  const items = stats.items || [];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: theme.surfaceBackground || "#ffffff" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {items.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: theme.primaryColor || "#059669" }}>
                {item.value}
              </div>
              <div className="text-sm md:text-base" style={{ color: theme.mutedTextColor || "#475569" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ServicesSection = ({ settings, theme }) => {
  const services = settings.services || {};
  const cards = services.cards || [];

  return (
    <section id="services" className="py-20 px-4" style={{ backgroundColor: theme.backgroundColor || "#f0fdf4" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {services.title || "Our Services"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {services.description || "Comprehensive renewable energy solutions for Kenya"}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl transition hover:scale-105"
              style={{ backgroundColor: theme.surfaceBackground || "#ffffff", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}
            >
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                {card.title}
              </h3>
              <p style={{ color: theme.mutedTextColor || "#475569" }}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = ({ settings, theme }) => {
  const howItWorks = settings.howItWorks || {};
  const steps = howItWorks.steps || [];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: theme.surfaceBackground || "#ffffff" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: theme.textColor || "#064e3b" }}>
          {howItWorks.title || "How It Works"}
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white"
                style={{ backgroundColor: theme.primaryColor || "#059669" }}
              >
                {index + 1}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const USSDSection = ({ settings, theme }) => {
  const ussd = settings.ussd || {};

  return (
    <section id="ussd" className="py-20 px-4" style={{ backgroundColor: theme.primaryColor || "#059669" }}>
      <div className="max-w-6xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{ussd.title || "Access via USSD"}</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          {ussd.description || "No internet? No problem. Access our platform directly from your mobile phone"}
        </p>
        <div className="inline-block bg-white rounded-2xl p-8 mb-8">
          <div className="text-5xl md:text-6xl font-bold mb-4" style={{ color: theme.primaryColor || "#059669" }}>
            {ussd.dialCode || "*789*788#"}
          </div>
          <p className="text-gray-600">Dial this code from any mobile phone</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {ussd.instructions?.map((instruction, index) => (
            <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">{index + 1}</div>
              <p className="text-sm">{instruction}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PAYGOSection = ({ settings, theme }) => {
  const paygo = settings.paygo || {};
  const items = paygo.items || [];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: theme.backgroundColor || "#f0fdf4" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {paygo.title || "PAYGO Solutions"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {paygo.description || "Pay-as-you-go solar solutions for affordable clean energy access"}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl text-center transition hover:scale-105"
              style={{ backgroundColor: theme.surfaceBackground || "#ffffff", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}
            >
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ResourceLibrarySection = ({ settings, theme }) => {
  const resourceLibrary = settings.resourceLibrary || {};
  const resources = resourceLibrary.resources || [];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: theme.surfaceBackground || "#ffffff" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {resourceLibrary.title || "Resource Library"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {resourceLibrary.description || "Access policies, best practices, and sector guides"}
        </p>
        {resources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl transition hover:scale-105"
                style={{ backgroundColor: theme.surfaceMuted || "#f0fdf4", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}
              >
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                  {resource.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: theme.mutedTextColor || "#475569" }}>
                  {resource.description}
                </p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-lg font-bold text-white text-sm"
                  style={{ backgroundColor: theme.primaryColor || "#059669" }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center" style={{ color: theme.mutedTextColor || "#475569" }}>
            Resources coming soon...
          </p>
        )}
      </div>
    </section>
  );
};

const ImpactSection = ({ settings, theme }) => {
  const impact = settings.impact || {};
  const stories = impact.stories || [];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: theme.backgroundColor || "#f0fdf4" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {impact.title || "Our Impact"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {impact.description || "Transforming lives through renewable energy across Kenya"}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden transition hover:scale-105"
              style={{ backgroundColor: theme.surfaceBackground || "#ffffff", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}
            >
              {story.imageUrl && (
                <img src={story.imageUrl} alt={story.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                  {story.title}
                </h3>
                <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                  {story.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PartnersSection = ({ settings, theme }) => {
  const partners = settings.partners || {};
  const logos = partners.logos || [];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: theme.surfaceBackground || "#ffffff" }}>
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {partners.title || "Our Partners"}
        </h2>
        <p className="mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {partners.description || "Working together to accelerate renewable energy adoption"}
        </p>
        {logos.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {logos.map((logo, index) => (
              <img key={index} src={logo.url} alt={logo.alt || "Partner"} className="h-16 opacity-70 hover:opacity-100 transition" />
            ))}
          </div>
        ) : (
          <p style={{ color: theme.mutedTextColor || "#475569" }}>Partner logos coming soon...</p>
        )}
      </div>
    </section>
  );
};

const ContactSection = ({ settings, theme }) => {
  const contact = settings.contact || {};

  return (
    <section id="contact" className="py-20 px-4" style={{ backgroundColor: theme.backgroundColor || "#f0fdf4" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {contact.title || "Get in Touch"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {contact.description || "Have questions? We're here to help"}
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl" style={{ backgroundColor: theme.surfaceBackground || "#ffffff", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: theme.textColor || "#064e3b" }}>
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <div className="font-bold mb-1" style={{ color: theme.primaryColor || "#059669" }}>Email</div>
                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
              </div>
              <div>
                <div className="font-bold mb-1" style={{ color: theme.primaryColor || "#059669" }}>Phone</div>
                <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
              </div>
              <div>
                <div className="font-bold mb-1" style={{ color: theme.primaryColor || "#059669" }}>Address</div>
                <p>{contact.address}</p>
              </div>
            </div>
          </div>
          {contact.formEnabled && (
            <div className="p-8 rounded-2xl" style={{ backgroundColor: theme.surfaceBackground || "#ffffff", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: theme.textColor || "#064e3b" }}>
                Send us a message
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: theme.borderColor || "#a7f3d0", backgroundColor: theme.surfaceMuted || "#f0fdf4" }}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: theme.borderColor || "#a7f3d0", backgroundColor: theme.surfaceMuted || "#f0fdf4" }}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: theme.borderColor || "#a7f3d0", backgroundColor: theme.surfaceMuted || "#f0fdf4" }}
                    placeholder="Your message"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg font-bold text-white transition hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor || "#059669" }}
                >
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FooterSection = ({ settings, theme }) => {
  const footer = settings.footer || {};
  const branding = settings.branding || {};

  return (
    <footer className="py-12 px-4" style={{ backgroundColor: theme.surfaceBackground || "#ffffff", borderTop: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt={branding.logoAlt || "Solar Mkononi"} className="h-12 mb-4" />
            )}
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
              {footer.title || "Solar Mkononi"}
            </h3>
            <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
              {footer.body || "Empowering Kenya with accessible renewable energy solutions"}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4" style={{ color: theme.textColor || "#064e3b" }}>Quick Links</h4>
            <ul className="space-y-2">
              {footer.links?.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:underline text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4" style={{ color: theme.textColor || "#064e3b" }}>Connect</h4>
            <div className="flex gap-4">
              {footer.socialLinks?.map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="text-2xl">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center pt-8" style={{ borderTop: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
          <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
            {footer.copyright || "© 2026 Solar Mkononi. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SolarMkononiPage;
