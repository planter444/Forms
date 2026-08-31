import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getSolarMkononiSettings } from "../lib/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const useScrollReveal = ({ threshold = 0.15, rootMargin = "0px 0px -50px 0px" } = {}) => {
  const [inView, setInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !inView) {
          setInView(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, inView]);

  return [elementRef, inView];
};

const WriNav = ({ settings, overHero = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const primaryColor = overHero ? "#ffffff" : "#059669";
  const textColor = overHero ? "#ffffff" : "#064e3b";
  const backgroundColor = "#f0fdf4";
  const borderColor = overHero ? "rgba(255,255,255,0.3)" : "#a7f3d0";
  const navOpacity = overHero ? 1 : 0.85;
  const slideDirection = "left";

  const navItems = [
    { label: "About", href: "#about", to: null },
    { label: "Areas", href: "#areas", to: null },
    { label: "Opportunities", href: "#opportunities", to: null },
    { label: "Enquiry", href: "#enquiry", to: null },
    { label: "Events", href: "#events", to: null },
    { label: "Partners", href: "#partners", to: null },
    { label: "Resources", href: "#resources", to: null },
    { label: "Business Database", href: "#business-database", to: null }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setNavHidden(false);
      } else if (currentY > lastScrollY.current) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (item) => {
    setMenuOpen(false);
    if (item.href) {
      const el = document.querySelector(item.href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const glassStyle = {
    backgroundColor: overHero ? "rgba(0,0,0,0.25)" : `${backgroundColor}${Math.round(navOpacity * 255).toString(16).padStart(2, "0")}`,
    backdropFilter: overHero ? "blur(8px)" : "blur(12px)",
    WebkitBackdropFilter: overHero ? "blur(8px)" : "blur(12px)",
    borderColor
  };

  return (
    <>
      <style>{`
        @keyframes navSlideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes navSlideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes navFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .brand-char {
          display: inline-block;
          animation: colorShift 6s ease-in-out infinite;
        }
        @keyframes colorShift {
          0%, 100% { color: #ffffff; }
          33% { color: #10b981; }
          66% { color: #0ea5e9; }
        }
      `}</style>
      <div
        className={`left-0 right-0 z-50 px-4 ${overHero ? "absolute" : "sticky"} top-3 md:top-0`}
        style={{ paddingTop: overHero ? undefined : "0.5rem" }}
      >
        <header
          id="top"
          className={`mx-auto ${overHero ? "max-w-6xl" : "max-w-5xl"} rounded-2xl border shadow-lg transition-transform duration-300 ${overHero ? "md:mt-3 lg:mt-4" : ""}`}
          style={{ ...glassStyle, transform: navHidden ? "translateY(-150%)" : "translateY(0)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <Link
              to="/solar-mkononi"
              className="text-lg md:text-xl font-bold"
              style={{ color: primaryColor }}
            >
              <span className="brand-char" style={{ animationDelay: "0s" }}>S</span>
              <span className="brand-char" style={{ animationDelay: "0.15s" }}>o</span>
              <span className="brand-char" style={{ animationDelay: "0.3s" }}>l</span>
              <span className="brand-char" style={{ animationDelay: "0.45s" }}>a</span>
              <span className="brand-char" style={{ animationDelay: "0.6s" }}>r</span>
              <span className="mx-1"> </span>
              <span className="brand-char" style={{ animationDelay: "0.75s" }}>M</span>
              <span className="brand-char" style={{ animationDelay: "0.9s" }}>k</span>
              <span className="brand-char" style={{ animationDelay: "1.05s" }}>o</span>
              <span className="brand-char" style={{ animationDelay: "1.2s" }}>n</span>
              <span className="brand-char" style={{ animationDelay: "1.35s" }}>o</span>
              <span className="brand-char" style={{ animationDelay: "1.5s" }}>n</span>
              <span className="brand-char" style={{ animationDelay: "1.65s" }}>i</span>
            </Link>
            <span className="hidden sm:inline mx-2 text-gray-300">|</span>
            <span className="hidden sm:inline text-sm md:text-base font-semibold" style={{ color: primaryColor }}>Africa–China Partnership</span>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) =>
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-full px-3 py-2 text-xs md:text-sm font-medium transition hover:opacity-80"
                    style={{ color: textColor }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(item);
                    }}
                    className="rounded-full px-3 py-2 text-xs md:text-sm font-medium transition hover:opacity-80"
                    style={{ color: textColor }}
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>

            <button
              type="button"
              className="rounded-xl border p-2 lg:hidden"
              style={{ borderColor, color: textColor }}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {menuOpen ? (
          <>
            <div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", animation: "navFadeIn 0.2s ease-out" }}
              onClick={() => setMenuOpen(false)}
            />
            <nav
              className="fixed top-0 z-50 h-screen w-72 border-r shadow-2xl lg:hidden"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                borderColor: "rgba(255,255,255,0.18)",
                [slideDirection === "left" ? "left" : "right"]: 0,
                animation: `${slideDirection === "left" ? "navSlideInLeft" : "navSlideInRight"} 0.3s ease-out`
              }}
            >
              <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                <span className="text-lg font-bold" style={{ color: "#ffffff" }}>Menu</span>
                <button
                  type="button"
                  className="rounded-xl border p-2"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item) =>
                  item.to ? (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium transition hover:opacity-80"
                      style={{ color: "#ffffff" }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(item);
                      }}
                      className="rounded-xl px-4 py-3 text-sm font-medium transition hover:opacity-80"
                      style={{ color: "#ffffff" }}
                    >
                      {item.label}
                    </a>
                  )
                )}
              </div>
            </nav>
          </>
        ) : null}
      </div>
    </>
  );
};

const technologyAreas = [
  { id: "solar", title: "Solar", description: "Solar PV systems, components, and manufacturing" },
  { id: "energy-storage", title: "Energy Storage", description: "Battery systems and energy storage solutions" },
  { id: "e-mobility", title: "E-Mobility", description: "Electric vehicles and charging infrastructure" },
  { id: "pure", title: "Productive Use of Renewable Energy (PURE)", description: "Solar-powered appliances and productive equipment" },
  { id: "green-manufacturing", title: "Green Manufacturing", description: "Sustainable manufacturing and assembly" },
  { id: "other", title: "Other Renewable Energy Technologies", description: "Wind, hydro, biomass, and other clean energy tech" }
];

const b2bOpportunities = [
  "Technology partnerships",
  "Suppliers/distributors",
  "Investment",
  "Financing",
  "Manufacturing/assembly",
  "Technical partnerships",
  "Market entry"
];

const organisationTypes = [
  "Company",
  "Government Agency",
  "Research Institution",
  "NGO/Non-profit",
  "Financial Institution",
  "Development Partner",
  "Industry Association",
  "Other"
];

const technologySectors = [
  "Solar PV",
  "Energy Storage",
  "E-Mobility",
  "PURE",
  "Green Manufacturing",
  "Wind",
  "Hydro",
  "Biomass",
  "Other"
];

const areasOfInterest = [
  "Technology Transfer",
  "Investment Opportunities",
  "Market Entry",
  "Manufacturing Partnership",
  "Distribution Partnership",
  "Technical Collaboration",
  "Skills Development",
  "Standards & Quality Assurance",
  "Policy & Regulation",
  "Other"
];

const enquiryTypes = [
  "General Enquiry",
  "Partnership Proposal",
  "Investment Inquiry",
  "Technology Inquiry",
  "Market Information",
  "Event Participation",
  "Other"
];

const resourceTypes = [
  "Report",
  "Policy Brief",
  "Research",
  "Publication",
  "Event Report",
  "Other"
];

const WriPartnershipPage = () => {
  const [settings, setSettings] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [events, setEvents] = useState([]);
  const [partners, setPartners] = useState([]);
  const [resources, setResources] = useState([]);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    organisation: "",
    country: "",
    email: "",
    phone: "",
    organisation_type: "",
    technology_sector: "",
    area_of_interest: "",
    enquiry_type: "",
    message: ""
  });
  const [enquiryAttachment, setEnquiryAttachment] = useState(null);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [businessFilters, setBusinessFilters] = useState({
    country: "",
    technology: "",
    organisation_type: "",
    nature_of_business: "",
    partnership_interest: ""
  });
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSettings();
    fetchBusinesses();
    fetchEvents();
    fetchPartners();
    fetchResources();
  }, []);

  useEffect(() => {
    fetchBusinesses(businessFilters);
  }, [businessFilters]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/public/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching WRI settings:", error);
    }
  };

  const fetchBusinesses = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/api/wri/public/businesses?${params}`);
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/public/events`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/public/partners`);
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/public/resources`);
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquirySubmitting(true);
    setEnquirySuccess(false);

    try {
      const formData = new FormData();
      Object.entries(enquiryForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (enquiryAttachment) {
        formData.append("attachment", enquiryAttachment);
      }

      const response = await fetch(`${API_URL}/api/wri/enquiries`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        setEnquirySuccess(true);
        setEnquiryForm({
          name: "",
          organisation: "",
          country: "",
          email: "",
          phone: "",
          organisation_type: "",
          technology_sector: "",
          area_of_interest: "",
          enquiry_type: "",
          message: ""
        });
        setEnquiryAttachment(null);
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div style={{ backgroundColor: "#f0fdf4", color: "#064e3b" }}>
      <WriNav settings={settings} overHero />

      <section id="hero" className="relative min-h-screen flex flex-col justify-center px-4 overflow-hidden" style={{ backgroundImage: "linear-gradient(135deg, #059669 0%, #10b981 50%, #065f46 100%)" }}>
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white lg:mt-[6vh]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
            Africa–China Renewable Energy Partnership
          </h1>
          <p className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto drop-shadow-md">
            Connecting Kenya's Renewable Energy Sector with Chinese Technology, Investment and Business Opportunities.
          </p>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto drop-shadow-md opacity-90">
            A dedicated hub facilitating B2B linkages, partnership enquiries, events, business opportunities, knowledge sharing, and stakeholder engagement between Kenya and China in the renewable energy sector.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("enquiry")}
              className="px-8 py-4 rounded-full font-bold text-white transition hover:scale-105 shadow-xl"
              style={{ backgroundColor: "#ffffff", color: "#059669" }}
            >
              Make a Partnership Enquiry
            </button>
            <button
              onClick={() => scrollToSection("business-database")}
              className="px-8 py-4 rounded-full font-bold border-2 border-white text-white transition hover:scale-105 backdrop-blur-sm"
            >
              Browse Business Database
            </button>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 md:py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>About the Partnership</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              The Kenya–China Renewable Energy Partnership focuses on strengthening collaboration across key areas:
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Kenya–China B2B linkages",
              "Technology transfer",
              "Investment opportunities",
              "Local manufacturing and assembly",
              "Skills development",
              "Standards and quality assurance",
              "Renewable energy collaboration"
            ].map((item, index) => {
              const colors = [
                { bg: "#f0fdf4", border: "#a7f3d0", text: "#065f46" },
                { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
                { bg: "#ffffff", border: "#e5e7eb", text: "#15803d" },
                { bg: "#f7fee7", border: "#d9f99d", text: "#3f6212" },
                { bg: "#f0f9ff", border: "#bae6fd", text: "#0c4a6e" },
                { bg: "#fafaf9", border: "#e7e5e4", text: "#15803d" },
                { bg: "#ecfdf5", border: "#6ee7b7", text: "#047857" }
              ];
              const color = colors[index % colors.length];
              return (
                <div key={index} className="flex items-start space-x-3 rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: color.bg, borderColor: color.border }}>
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color.border }}>
                    <svg className="h-4 w-4" style={{ color: color.text }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm md:text-base" style={{ color: color.text }}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="areas" className="py-16 md:py-24 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>Technology & Business Areas</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              Explore the key technology sectors and business areas where Kenya and China can collaborate.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {technologyAreas.map((area, index) => {
              const colors = [
                { bg: "#f0fdf4", border: "#a7f3d0", text: "#065f46" },
                { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
                { bg: "#ffffff", border: "#e5e7eb", text: "#15803d" },
                { bg: "#f7fee7", border: "#d9f99d", text: "#3f6212" },
                { bg: "#f0f9ff", border: "#bae6fd", text: "#0c4a6e" },
                { bg: "#fafaf9", border: "#e7e5e4", text: "#15803d" }
              ];
              const color = colors[index % colors.length];
              return (
                <div key={area.id} className="rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105" style={{ backgroundColor: color.bg, borderColor: color.border }}>
                  <h3 className="text-xl font-semibold" style={{ color: color.text }}>{area.title}</h3>
                  <p className="mt-2 text-sm md:text-base" style={{ color: "#065f46" }}>{area.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="opportunities" className="py-16 md:py-24 px-4" style={{ backgroundColor: "#ecfdf5" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>B2B Opportunities</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              Discover the types of partnership and business opportunities available through this platform.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {b2bOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center space-x-3 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-lg" style={{ backgroundColor: "#059669" }}>
                  {index + 1}
                </div>
                <span className="text-sm md:text-base font-medium" style={{ color: "#064e3b" }}>{opportunity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquiry" className="py-16 md:py-24 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>Partnership Enquiry</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              Submit your enquiry to explore partnership opportunities with Chinese renewable energy companies and stakeholders.
            </p>
          </div>
          {enquirySuccess && (
            <div className="mb-8 rounded-2xl border p-4" style={{ backgroundColor: "#f0fdf4", borderColor: "#86efac" }}>
              <p className="text-center font-medium" style={{ color: "#065f46" }}>Thank you! Your enquiry has been submitted successfully. We will get back to you soon.</p>
            </div>
          )}
          <form onSubmit={handleEnquirySubmit} className="rounded-2xl border p-6 md:p-8 shadow-lg" style={{ backgroundColor: "#f0fdf4", borderColor: "#a7f3d0" }}>
            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Name *</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff", focusRingColor: "#059669" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Organisation/Company *</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.organisation}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, organisation: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Country *</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.country}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, country: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Email *</label>
                <input
                  type="email"
                  required
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Phone</label>
                <input
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Organisation Type *</label>
                <select
                  required
                  value={enquiryForm.organisation_type}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, organisation_type: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                >
                  <option value="">Select organisation type</option>
                  {organisationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Technology/Sector *</label>
                <select
                  required
                  value={enquiryForm.technology_sector}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, technology_sector: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                >
                  <option value="">Select technology/sector</option>
                  {technologySectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Area of Interest *</label>
                <select
                  required
                  value={enquiryForm.area_of_interest}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, area_of_interest: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                >
                  <option value="">Select area of interest</option>
                  {areasOfInterest.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Type of Enquiry *</label>
                <select
                  required
                  value={enquiryForm.enquiry_type}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, enquiry_type: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                >
                  <option value="">Select enquiry type</option>
                  {enquiryTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Message *</label>
              <textarea
                required
                rows={4}
                value={enquiryForm.message}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Attachment (Optional)</label>
              <input
                type="file"
                onChange={(e) => setEnquiryAttachment(e.target.files?.[0] || null)}
                className="w-full text-sm"
                style={{ color: "#065f46" }}
              />
            </div>
            <button
              type="submit"
              disabled={enquirySubmitting}
              className="mt-8 w-full rounded-full px-8 py-4 text-white font-bold text-lg transition hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#059669" }}
            >
              {enquirySubmitting ? "Submitting..." : "Submit Enquiry"}
            </button>
          </form>
        </div>
      </section>

      <section id="events" className="py-16 md:py-24 px-4" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>Events</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              Stay updated on upcoming Kenya–China partnership events and activities.
            </p>
          </div>
          {events.length === 0 ? (
            <p className="text-center py-8" style={{ color: "#065f46" }}>No events scheduled at this time.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-lg transition-all" style={{ borderColor: "#a7f3d0" }}>
                  {event.image_url && (
                    <img src={event.image_url} alt={event.title} className="h-48 w-full rounded-xl object-cover" />
                  )}
                  <h3 className="mt-4 text-xl font-semibold" style={{ color: "#064e3b" }}>{event.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: "#065f46" }}>{formatDate(event.event_date)}</p>
                  <p className="mt-1 text-sm" style={{ color: "#065f46" }}>{event.location}</p>
                  <p className="mt-3" style={{ color: "#064e3b" }}>{event.description}</p>
                  {event.registration_link && (
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-full px-6 py-2 text-sm font-semibold text-white transition hover:scale-105"
                      style={{ backgroundColor: "#059669" }}
                    >
                      Register
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="partners" className="py-16 md:py-24 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>Partners & Stakeholders</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              Approved organisations and partners participating in the Kenya–China Renewable Energy Partnership.
            </p>
          </div>
          {partners.length === 0 ? (
            <p className="text-center py-8" style={{ color: "#065f46" }}>No partners listed at this time.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-2xl border p-6 shadow-sm text-center hover:shadow-lg transition-all" style={{ backgroundColor: "#f0fdf4", borderColor: "#a7f3d0" }}>
                  {partner.logo_url && (
                    <img src={partner.logo_url} alt={partner.name} className="mx-auto h-24 w-24 object-contain" />
                  )}
                  <h3 className="mt-4 font-semibold" style={{ color: "#064e3b" }}>{partner.name}</h3>
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-medium transition hover:scale-105"
                      style={{ color: "#059669" }}
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="resources" className="py-16 md:py-24 px-4" style={{ backgroundColor: "#ecfdf5" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>Resources</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              Access reports, policy briefs, research, publications, and event reports.
            </p>
          </div>
          {resources.length === 0 ? (
            <p className="text-center py-8" style={{ color: "#065f46" }}>No resources available at this time.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-lg transition-all" style={{ borderColor: "#a7f3d0" }}>
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "#f0fdf4", color: "#065f46" }}>
                    {resource.resource_type}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold" style={{ color: "#064e3b" }}>{resource.title}</h3>
                  <p className="mt-2" style={{ color: "#065f46" }}>{resource.description}</p>
                  {resource.file_url && (
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-full px-6 py-2 text-sm font-semibold text-white transition hover:scale-105"
                      style={{ backgroundColor: "#059669" }}
                    >
                      Download
                    </a>
                  )}
                  {resource.external_url && (
                    <a
                      href={resource.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-full px-6 py-2 text-sm font-semibold text-white transition hover:scale-105"
                      style={{ backgroundColor: "#6b7280" }}
                    >
                      View Resource
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="business-database" className="py-16 md:py-24 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#064e3b" }}>Business Database</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: "#065f46" }}>
              Search the directory of participating businesses approved for public display.
            </p>
          </div>
          <div className="rounded-2xl border p-6 mb-8" style={{ backgroundColor: "#f0fdf4", borderColor: "#a7f3d0" }}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Country</label>
                <input
                  type="text"
                  value={businessFilters.country}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, country: e.target.value })}
                  placeholder="Filter by country"
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Technology</label>
                <select
                  value={businessFilters.technology}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, technology: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                >
                  <option value="">All technologies</option>
                  {technologySectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Organisation Type</label>
                <select
                  value={businessFilters.organisation_type}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, organisation_type: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                >
                  <option value="">All types</option>
                  {organisationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Nature of Business</label>
                <input
                  type="text"
                  value={businessFilters.nature_of_business}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, nature_of_business: e.target.value })}
                  placeholder="Filter by business nature"
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#064e3b" }}>Partnership Interest</label>
                <input
                  type="text"
                  value={businessFilters.partnership_interest}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, partnership_interest: e.target.value })}
                  placeholder="Filter by interest"
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#a7f3d0", backgroundColor: "#ffffff" }}
                />
              </div>
            </div>
          </div>
          {businesses.length === 0 ? (
            <p className="text-center py-8" style={{ color: "#065f46" }}>No businesses found matching your filters.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all" style={{ backgroundColor: "#f0fdf4", borderColor: "#a7f3d0" }}>
                  {business.logo_url && (
                    <img src={business.logo_url} alt={business.name} className="h-20 w-20 object-contain" />
                  )}
                  <h3 className="mt-4 text-lg font-semibold" style={{ color: "#064e3b" }}>{business.name}</h3>
                  <p className="mt-1 text-sm" style={{ color: "#065f46" }}>{business.country}</p>
                  <p className="mt-1 text-sm" style={{ color: "#065f46" }}>{business.technology}</p>
                  <p className="mt-1 text-sm" style={{ color: "#065f46" }}>{business.organisation_type}</p>
                  <p className="mt-2" style={{ color: "#064e3b" }}>{business.description}</p>
                  {business.website_url && (
                    <a
                      href={business.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-full px-6 py-2 text-sm font-semibold text-white transition hover:scale-105"
                      style={{ backgroundColor: "#059669" }}
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 px-4" style={{ backgroundColor: "#064e3b", color: "#ffffff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold">Africa–China Renewable Energy Partnership</h3>
              <p className="mt-2" style={{ color: "#a7f3d0" }}>
                A dedicated platform connecting Kenya's renewable energy sector with Chinese technology, investment, and business opportunities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-2 space-y-2">
                <li><Link to="/solar-mkononi" className="transition hover:opacity-80" style={{ color: "#a7f3d0" }}>Solar Mkononi</Link></li>
                <li><button onClick={() => scrollToSection("enquiry")} className="transition hover:opacity-80" style={{ color: "#a7f3d0" }}>Submit Enquiry</button></li>
                <li><button onClick={() => scrollToSection("business-database")} className="transition hover:opacity-80" style={{ color: "#a7f3d0" }}>Business Database</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Contact</h3>
              <p className="mt-2" style={{ color: "#a7f3d0" }}>
                For partnership enquiries and information, please use the enquiry form above.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center" style={{ borderColor: "#a7f3d0", color: "#a7f3d0" }}>
            <p>© 2026 Kenya Renewable Energy Association (KEREA). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WriPartnershipPage;
