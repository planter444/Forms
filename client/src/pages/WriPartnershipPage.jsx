import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSolarMkononiSettings } from "../lib/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSettings();
    fetchBusinesses();
    fetchEvents();
    fetchPartners();
    fetchResources();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "areas", "opportunities", "enquiry", "events", "partners", "resources", "business-database"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/solar-mkononi" className="text-xl font-bold text-emerald-700">
                Solar Mkononi
              </Link>
              <span className="mx-4 text-gray-300">|</span>
              <span className="text-lg font-semibold text-gray-800">Africa–China Partnership</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {["about", "areas", "opportunities", "enquiry", "events", "partners", "resources", "business-database"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === section ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  {section.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section id="hero" className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Africa–China Renewable Energy Partnership
            </h1>
            <p className="mt-6 text-xl text-emerald-100">
              Connecting Kenya's Renewable Energy Sector with Chinese Technology, Investment and Business Opportunities.
            </p>
            <p className="mt-4 text-lg text-emerald-200">
              This dedicated hub facilitates B2B linkages, partnership enquiries, events, business opportunities, knowledge sharing, and stakeholder engagement between Kenya and China in the renewable energy sector.
            </p>
            <button
              onClick={() => scrollToSection("enquiry")}
              className="mt-8 inline-flex rounded-full bg-white px-8 py-3 text-lg font-semibold text-emerald-800 shadow-lg hover:bg-emerald-50 transition-colors"
            >
              Make a Partnership Enquiry
            </button>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">About the Partnership</h2>
          <p className="mt-4 text-lg text-gray-600">
            The Kenya–China Renewable Energy Partnership focuses on strengthening collaboration across key areas:
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Kenya–China B2B linkages",
              "Technology transfer",
              "Investment opportunities",
              "Local manufacturing and assembly",
              "Skills development",
              "Standards and quality assurance",
              "Renewable energy collaboration"
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Technology & Business Areas</h2>
          <p className="mt-4 text-lg text-gray-600">
            Explore the key technology sectors and business areas where Kenya and China can collaborate.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {technologyAreas.map((area) => (
              <div key={area.id} className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900">{area.title}</h3>
                <p className="mt-2 text-gray-600">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="opportunities" className="py-20 bg-emerald-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">B2B Opportunities</h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover the types of partnership and business opportunities available through this platform.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {b2bOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center space-x-3 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold">
                  {index + 1}
                </div>
                <span className="text-gray-700 font-medium">{opportunity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquiry" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Partnership Enquiry</h2>
          <p className="mt-4 text-lg text-gray-600">
            Submit your enquiry to explore partnership opportunities with Chinese renewable energy companies and stakeholders.
          </p>
          {enquirySuccess && (
            <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-green-800 font-medium">Thank you! Your enquiry has been submitted successfully. We will get back to you soon.</p>
            </div>
          )}
          <form onSubmit={handleEnquirySubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Organisation/Company *</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.organisation}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, organisation: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country *</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.country}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, country: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Organisation Type *</label>
                <select
                  required
                  value={enquiryForm.organisation_type}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, organisation_type: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select organisation type</option>
                  {organisationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Technology/Sector *</label>
                <select
                  required
                  value={enquiryForm.technology_sector}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, technology_sector: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select technology/sector</option>
                  {technologySectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area of Interest *</label>
                <select
                  required
                  value={enquiryForm.area_of_interest}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, area_of_interest: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select area of interest</option>
                  {areasOfInterest.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type of Enquiry *</label>
                <select
                  required
                  value={enquiryForm.enquiry_type}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, enquiry_type: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select enquiry type</option>
                  {enquiryTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message *</label>
              <textarea
                required
                rows={4}
                value={enquiryForm.message}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Attachment (Optional)</label>
              <input
                type="file"
                onChange={(e) => setEnquiryAttachment(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
            <button
              type="submit"
              disabled={enquirySubmitting}
              className="inline-flex rounded-lg bg-emerald-600 px-8 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {enquirySubmitting ? "Submitting..." : "Submit Enquiry"}
            </button>
          </form>
        </div>
      </section>

      <section id="events" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Events</h2>
          <p className="mt-4 text-lg text-gray-600">
            Stay updated on upcoming Kenya–China partnership events and activities.
          </p>
          {events.length === 0 ? (
            <p className="mt-8 text-gray-500">No events scheduled at this time.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  {event.image_url && (
                    <img src={event.image_url} alt={event.title} className="h-48 w-full rounded-lg object-cover" />
                  )}
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">{event.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{formatDate(event.event_date)}</p>
                  <p className="mt-1 text-sm text-gray-600">{event.location}</p>
                  <p className="mt-3 text-gray-700">{event.description}</p>
                  {event.registration_link && (
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
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

      <section id="partners" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Partners & Stakeholders</h2>
          <p className="mt-4 text-lg text-gray-600">
            Approved organisations and partners participating in the Kenya–China Renewable Energy Partnership.
          </p>
          {partners.length === 0 ? (
            <p className="mt-8 text-gray-500">No partners listed at this time.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
                  {partner.logo_url && (
                    <img src={partner.logo_url} alt={partner.name} className="mx-auto h-24 w-24 object-contain" />
                  )}
                  <h3 className="mt-4 font-semibold text-gray-900">{partner.name}</h3>
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-emerald-600 hover:text-emerald-700"
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

      <section id="resources" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Resources</h2>
          <p className="mt-4 text-lg text-gray-600">
            Access reports, policy briefs, research, publications, and event reports.
          </p>
          {resources.length === 0 ? (
            <p className="mt-8 text-gray-500">No resources available at this time.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {resource.resource_type}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{resource.title}</h3>
                  <p className="mt-2 text-gray-600">{resource.description}</p>
                  {resource.file_url && (
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      Download
                    </a>
                  )}
                  {resource.external_url && (
                    <a
                      href={resource.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
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

      <section id="business-database" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Business Database</h2>
          <p className="mt-4 text-lg text-gray-600">
            Search the directory of participating businesses approved for public display.
          </p>
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={businessFilters.country}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, country: e.target.value })}
                  placeholder="Filter by country"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Technology</label>
                <select
                  value={businessFilters.technology}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, technology: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">All technologies</option>
                  {technologySectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Organisation Type</label>
                <select
                  value={businessFilters.organisation_type}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, organisation_type: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">All types</option>
                  {organisationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nature of Business</label>
                <input
                  type="text"
                  value={businessFilters.nature_of_business}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, nature_of_business: e.target.value })}
                  placeholder="Filter by business nature"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Partnership Interest</label>
                <input
                  type="text"
                  value={businessFilters.partnership_interest}
                  onChange={(e) => setBusinessFilters({ ...businessFilters, partnership_interest: e.target.value })}
                  placeholder="Filter by interest"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          {businesses.length === 0 ? (
            <p className="mt-8 text-gray-500">No businesses found matching your filters.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  {business.logo_url && (
                    <img src={business.logo_url} alt={business.name} className="h-20 w-20 object-contain" />
                  )}
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{business.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{business.country}</p>
                  <p className="mt-1 text-sm text-gray-600">{business.technology}</p>
                  <p className="mt-1 text-sm text-gray-600">{business.organisation_type}</p>
                  <p className="mt-2 text-gray-700">{business.description}</p>
                  {business.website_url && (
                    <a
                      href={business.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
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

      <footer className="bg-gray-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold">Africa–China Renewable Energy Partnership</h3>
              <p className="mt-2 text-gray-400">
                A dedicated platform connecting Kenya's renewable energy sector with Chinese technology, investment, and business opportunities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-2 space-y-2">
                <li><Link to="/solar-mkononi" className="text-gray-400 hover:text-white transition-colors">Solar Mkononi</Link></li>
                <li><button onClick={() => scrollToSection("enquiry")} className="text-gray-400 hover:text-white transition-colors">Submit Enquiry</button></li>
                <li><button onClick={() => scrollToSection("business-database")} className="text-gray-400 hover:text-white transition-colors">Business Database</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Contact</h3>
              <p className="mt-2 text-gray-400">
                For partnership enquiries and information, please use the enquiry form above.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2026 Kenya Renewable Energy Association (KEREA). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WriPartnershipPage;
