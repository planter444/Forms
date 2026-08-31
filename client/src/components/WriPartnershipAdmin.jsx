import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const WriPartnershipAdmin = ({ token, palette, setNotice, setError }) => {
  const [activeSubTab, setActiveSubTab] = useState("hero");
  const [wriSettings, setWriSettings] = useState({
    hero: {
      title: "Africa–China Renewable Energy Partnership",
      subtitle: "Connecting Kenya's Renewable Energy Sector with Chinese Technology, Investment and Business Opportunities.",
      introduction: "This dedicated hub facilitates B2B linkages, partnership enquiries, events, business opportunities, knowledge sharing, and stakeholder engagement between Kenya and China in the renewable energy sector.",
      primaryCta: "Make a Partnership Enquiry",
      secondaryCta: "Browse Business Database",
      backgroundImageUrl: "",
      overlayOpacity: 0.3
    }
  });
  const [enquiries, setEnquiries] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [events, setEvents] = useState([]);
  const [partners, setPartners] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const [businessForm, setBusinessForm] = useState({
    name: "",
    country: "",
    technology: "",
    organisation_type: "",
    nature_of_business: "",
    partnership_interest: "",
    description: "",
    logo_url: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    is_approved: false
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    event_date: "",
    location: "",
    description: "",
    image_url: "",
    registration_link: "",
    status: "upcoming"
  });

  const [partnerForm, setPartnerForm] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    description: "",
    is_approved: false,
    display_order: 0
  });

  const [resourceForm, setResourceForm] = useState({
    title: "",
    resource_type: "",
    description: "",
    file_url: "",
    file_name: "",
    external_url: "",
    is_published: true
  });

  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchWriSettings();
    fetchEnquiries();
    fetchBusinesses();
    fetchEvents();
    fetchPartners();
    fetchResources();
  }, []);

  const fetchWriSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/public/settings`);
      const data = await response.json();
      if (data.wri) {
        setWriSettings(data.wri);
      }
    } catch (error) {
      console.error("Error fetching WRI settings:", error);
    }
  };

  const handleSaveWriSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ wri: wriSettings })
      });
      if (response.ok) {
        setNotice("WRI settings saved successfully");
      }
    } catch (error) {
      setError("Failed to save WRI settings");
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/enquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setEnquiries(data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/businesses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const handleUpdateEnquiryStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/enquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setNotice("Enquiry status updated");
        fetchEnquiries();
      }
    } catch (error) {
      setError("Failed to update enquiry status");
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/enquiries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setNotice("Enquiry deleted");
        fetchEnquiries();
      }
    } catch (error) {
      setError("Failed to delete enquiry");
    }
  };

  const handleDownloadEnquiriesExcel = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/enquiries/excel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wri-enquiries-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setNotice("Excel downloaded successfully");
      }
    } catch (error) {
      setError("Failed to download Excel");
    }
  };

  const handleSaveBusiness = async () => {
    setLoading(true);
    try {
      const url = editingItem
        ? `${API_URL}/api/wri/admin/businesses/${editingItem.id}`
        : `${API_URL}/api/wri/admin/businesses`;
      const method = editingItem ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(businessForm)
      });
      if (response.ok) {
        setNotice(editingItem ? "Business updated" : "Business created");
        setBusinessForm({
          name: "",
          country: "",
          technology: "",
          organisation_type: "",
          nature_of_business: "",
          partnership_interest: "",
          description: "",
          logo_url: "",
          website_url: "",
          contact_email: "",
          contact_phone: "",
          is_approved: false
        });
        setEditingItem(null);
        fetchBusinesses();
      }
    } catch (error) {
      setError("Failed to save business");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!confirm("Are you sure you want to delete this business?")) return;
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/businesses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setNotice("Business deleted");
        fetchBusinesses();
      }
    } catch (error) {
      setError("Failed to delete business");
    }
  };

  const handleSaveEvent = async () => {
    setLoading(true);
    try {
      const url = editingItem
        ? `${API_URL}/api/wri/admin/events/${editingItem.id}`
        : `${API_URL}/api/wri/admin/events`;
      const method = editingItem ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventForm)
      });
      if (response.ok) {
        setNotice(editingItem ? "Event updated" : "Event created");
        setEventForm({
          title: "",
          event_date: "",
          location: "",
          description: "",
          image_url: "",
          registration_link: "",
          status: "upcoming"
        });
        setEditingItem(null);
        fetchEvents();
      }
    } catch (error) {
      setError("Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setNotice("Event deleted");
        fetchEvents();
      }
    } catch (error) {
      setError("Failed to delete event");
    }
  };

  const handleSavePartner = async () => {
    setLoading(true);
    try {
      const url = editingItem
        ? `${API_URL}/api/wri/admin/partners/${editingItem.id}`
        : `${API_URL}/api/wri/admin/partners`;
      const method = editingItem ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(partnerForm)
      });
      if (response.ok) {
        setNotice(editingItem ? "Partner updated" : "Partner created");
        setPartnerForm({
          name: "",
          logo_url: "",
          website_url: "",
          description: "",
          is_approved: false,
          display_order: 0
        });
        setEditingItem(null);
        fetchPartners();
      }
    } catch (error) {
      setError("Failed to save partner");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/partners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setNotice("Partner deleted");
        fetchPartners();
      }
    } catch (error) {
      setError("Failed to delete partner");
    }
  };

  const handleSaveResource = async () => {
    setLoading(true);
    try {
      const url = editingItem
        ? `${API_URL}/api/wri/admin/resources/${editingItem.id}`
        : `${API_URL}/api/wri/admin/resources`;
      const method = editingItem ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(resourceForm)
      });
      if (response.ok) {
        setNotice(editingItem ? "Resource updated" : "Resource created");
        setResourceForm({
          title: "",
          resource_type: "",
          description: "",
          file_url: "",
          file_name: "",
          external_url: "",
          is_published: true
        });
        setEditingItem(null);
        fetchResources();
      }
    } catch (error) {
      setError("Failed to save resource");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const response = await fetch(`${API_URL}/api/wri/admin/resources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setNotice("Resource deleted");
        fetchResources();
      }
    } catch (error) {
      setError("Failed to delete resource");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
        <h2 className="text-2xl font-semibold" style={{ color: palette.textColor }}>Africa–China Renewable Energy Partnership Admin</h2>
        <p className="mt-2 text-sm" style={{ color: palette.mutedTextColor }}>Manage hero content, enquiries, businesses, events, partners, and resources.</p>
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: palette.borderColor }}>
        {["hero", "enquiries", "businesses", "events", "partners", "resources"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveSubTab(tab);
              setEditingItem(null);
            }}
            className="px-4 py-2 text-sm font-medium capitalize transition-colors"
            style={{
              color: activeSubTab === tab ? palette.primary : palette.mutedTextColor,
              borderBottom: activeSubTab === tab ? `2px solid ${palette.primary}` : "2px solid transparent"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === "hero" && (
        <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
          <h3 className="text-lg font-semibold" style={{ color: palette.textColor }}>Hero Section</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.textColor }}>Title</label>
              <input
                type="text"
                value={wriSettings.hero.title}
                onChange={(e) => setWriSettings({ ...wriSettings, hero: { ...wriSettings.hero, title: e.target.value } })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.textColor }}>Subtitle</label>
              <textarea
                value={wriSettings.hero.subtitle}
                onChange={(e) => setWriSettings({ ...wriSettings, hero: { ...wriSettings.hero, subtitle: e.target.value } })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.textColor }}>Introduction</label>
              <textarea
                value={wriSettings.hero.introduction}
                onChange={(e) => setWriSettings({ ...wriSettings, hero: { ...wriSettings.hero, introduction: e.target.value } })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.textColor }}>Primary CTA Button Text</label>
              <input
                type="text"
                value={wriSettings.hero.primaryCta}
                onChange={(e) => setWriSettings({ ...wriSettings, hero: { ...wriSettings.hero, primaryCta: e.target.value } })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.textColor }}>Secondary CTA Button Text</label>
              <input
                type="text"
                value={wriSettings.hero.secondaryCta}
                onChange={(e) => setWriSettings({ ...wriSettings, hero: { ...wriSettings.hero, secondaryCta: e.target.value } })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.textColor }}>Background Image URL</label>
              <input
                type="url"
                value={wriSettings.hero.backgroundImageUrl}
                onChange={(e) => setWriSettings({ ...wriSettings, hero: { ...wriSettings.hero, backgroundImageUrl: e.target.value } })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.textColor }}>Overlay Opacity ({Math.round(wriSettings.hero.overlayOpacity * 100)}%)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                className="w-full"
                value={wriSettings.hero.overlayOpacity}
                onChange={(e) => setWriSettings({ ...wriSettings, hero: { ...wriSettings.hero, overlayOpacity: Number(e.target.value) } })}
              />
            </div>
            <button
              onClick={handleSaveWriSettings}
              className="w-full rounded-lg py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: palette.primary }}
            >
              Save Hero Settings
            </button>
          </div>
        </div>
      )}

      {activeSubTab === "enquiries" && (
        <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: palette.textColor }}>Partnership Enquiries</h3>
            <button
              onClick={handleDownloadEnquiriesExcel}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: palette.primary }}
            >
              Download Excel
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: palette.borderColor }}>
                  <th className="px-4 py-2 text-left font-medium" style={{ color: palette.textColor }}>Name</th>
                  <th className="px-4 py-2 text-left font-medium" style={{ color: palette.textColor }}>Organisation</th>
                  <th className="px-4 py-2 text-left font-medium" style={{ color: palette.textColor }}>Country</th>
                  <th className="px-4 py-2 text-left font-medium" style={{ color: palette.textColor }}>Email</th>
                  <th className="px-4 py-2 text-left font-medium" style={{ color: palette.textColor }}>Status</th>
                  <th className="px-4 py-2 text-left font-medium" style={{ color: palette.textColor }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-b" style={{ borderColor: palette.borderColor }}>
                    <td className="px-4 py-3" style={{ color: palette.textColor }}>{enquiry.name}</td>
                    <td className="px-4 py-3" style={{ color: palette.textColor }}>{enquiry.organisation}</td>
                    <td className="px-4 py-3" style={{ color: palette.textColor }}>{enquiry.country}</td>
                    <td className="px-4 py-3" style={{ color: palette.textColor }}>{enquiry.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={enquiry.status}
                        onChange={(e) => handleUpdateEnquiryStatus(enquiry.id, e.target.value)}
                        className="rounded-lg border px-2 py-1 text-xs"
                        style={{ borderColor: palette.borderColor }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteEnquiry(enquiry.id)}
                        className="rounded-lg px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {enquiries.length === 0 && (
              <p className="py-4 text-center" style={{ color: palette.mutedTextColor }}>No enquiries yet.</p>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "businesses" && (
        <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
          <h3 className="text-lg font-semibold" style={{ color: palette.textColor }}>Business Directory</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={businessForm.name}
                onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="text"
                placeholder="Country"
                value={businessForm.country}
                onChange={(e) => setBusinessForm({ ...businessForm, country: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="text"
                placeholder="Technology"
                value={businessForm.technology}
                onChange={(e) => setBusinessForm({ ...businessForm, technology: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="text"
                placeholder="Organisation Type"
                value={businessForm.organisation_type}
                onChange={(e) => setBusinessForm({ ...businessForm, organisation_type: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="text"
                placeholder="Nature of Business"
                value={businessForm.nature_of_business}
                onChange={(e) => setBusinessForm({ ...businessForm, nature_of_business: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="text"
                placeholder="Partnership Interest"
                value={businessForm.partnership_interest}
                onChange={(e) => setBusinessForm({ ...businessForm, partnership_interest: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <textarea
                placeholder="Description"
                value={businessForm.description}
                onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
                rows={2}
              />
              <input
                type="url"
                placeholder="Logo URL"
                value={businessForm.logo_url}
                onChange={(e) => setBusinessForm({ ...businessForm, logo_url: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="url"
                placeholder="Website URL"
                value={businessForm.website_url}
                onChange={(e) => setBusinessForm({ ...businessForm, website_url: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <label className="flex items-center gap-2 text-sm" style={{ color: palette.textColor }}>
                <input
                  type="checkbox"
                  checked={businessForm.is_approved}
                  onChange={(e) => setBusinessForm({ ...businessForm, is_approved: e.target.checked })}
                />
                Approved for public display
              </label>
              <button
                onClick={handleSaveBusiness}
                disabled={loading}
                className="w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: palette.primary }}
              >
                {loading ? "Saving..." : editingItem ? "Update Business" : "Add Business"}
              </button>
              {editingItem && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setBusinessForm({
                      name: "",
                      country: "",
                      technology: "",
                      organisation_type: "",
                      nature_of_business: "",
                      partnership_interest: "",
                      description: "",
                      logo_url: "",
                      website_url: "",
                      contact_email: "",
                      contact_phone: "",
                      is_approved: false
                    });
                  }}
                  className="w-full rounded-lg border py-2 text-sm font-semibold"
                  style={{ borderColor: palette.borderColor, color: palette.textColor }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-lg border p-3" style={{ borderColor: palette.borderColor }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium" style={{ color: palette.textColor }}>{business.name}</p>
                      <p className="text-xs" style={{ color: palette.mutedTextColor }}>{business.country} • {business.technology}</p>
                      <p className="text-xs" style={{ color: palette.mutedTextColor }}>{business.organisation_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(business);
                          setBusinessForm(business);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-xs ${business.is_approved ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {business.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "events" && (
        <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
          <h3 className="text-lg font-semibold" style={{ color: palette.textColor }}>Events</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event Title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="date"
                value={eventForm.event_date}
                onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="text"
                placeholder="Location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <textarea
                placeholder="Description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
                rows={2}
              />
              <input
                type="url"
                placeholder="Image URL"
                value={eventForm.image_url}
                onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="url"
                placeholder="Registration Link"
                value={eventForm.registration_link}
                onChange={(e) => setEventForm({ ...eventForm, registration_link: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <select
                value={eventForm.status}
                onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
              <button
                onClick={handleSaveEvent}
                disabled={loading}
                className="w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: palette.primary }}
              >
                {loading ? "Saving..." : editingItem ? "Update Event" : "Add Event"}
              </button>
              {editingItem && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setEventForm({
                      title: "",
                      event_date: "",
                      location: "",
                      description: "",
                      image_url: "",
                      registration_link: "",
                      status: "upcoming"
                    });
                  }}
                  className="w-full rounded-lg border py-2 text-sm font-semibold"
                  style={{ borderColor: palette.borderColor, color: palette.textColor }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg border p-3" style={{ borderColor: palette.borderColor }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium" style={{ color: palette.textColor }}>{event.title}</p>
                      <p className="text-xs" style={{ color: palette.mutedTextColor }}>{formatDate(event.event_date)} • {event.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(event);
                          setEventForm(event);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-xs ${event.status === "upcoming" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "partners" && (
        <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
          <h3 className="text-lg font-semibold" style={{ color: palette.textColor }}>Partners & Stakeholders</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Partner Name"
                value={partnerForm.name}
                onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="url"
                placeholder="Logo URL"
                value={partnerForm.logo_url}
                onChange={(e) => setPartnerForm({ ...partnerForm, logo_url: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="url"
                placeholder="Website URL"
                value={partnerForm.website_url}
                onChange={(e) => setPartnerForm({ ...partnerForm, website_url: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <textarea
                placeholder="Description"
                value={partnerForm.description}
                onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
                rows={2}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={partnerForm.display_order}
                onChange={(e) => setPartnerForm({ ...partnerForm, display_order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <label className="flex items-center gap-2 text-sm" style={{ color: palette.textColor }}>
                <input
                  type="checkbox"
                  checked={partnerForm.is_approved}
                  onChange={(e) => setPartnerForm({ ...partnerForm, is_approved: e.target.checked })}
                />
                Approved for public display
              </label>
              <button
                onClick={handleSavePartner}
                disabled={loading}
                className="w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: palette.primary }}
              >
                {loading ? "Saving..." : editingItem ? "Update Partner" : "Add Partner"}
              </button>
              {editingItem && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setPartnerForm({
                      name: "",
                      logo_url: "",
                      website_url: "",
                      description: "",
                      is_approved: false,
                      display_order: 0
                    });
                  }}
                  className="w-full rounded-lg border py-2 text-sm font-semibold"
                  style={{ borderColor: palette.borderColor, color: palette.textColor }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-lg border p-3" style={{ borderColor: palette.borderColor }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium" style={{ color: palette.textColor }}>{partner.name}</p>
                      {partner.logo_url && <img src={partner.logo_url} alt="" className="mt-1 h-8 w-8 object-contain" />}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(partner);
                          setPartnerForm(partner);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-xs ${partner.is_approved ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {partner.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "resources" && (
        <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
          <h3 className="text-lg font-semibold" style={{ color: palette.textColor }}>Resources</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Resource Title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <select
                value={resourceForm.resource_type}
                onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              >
                <option value="">Select resource type</option>
                <option value="Report">Report</option>
                <option value="Policy Brief">Policy Brief</option>
                <option value="Research">Research</option>
                <option value="Publication">Publication</option>
                <option value="Event Report">Event Report</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                placeholder="Description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
                rows={2}
              />
              <input
                type="url"
                placeholder="File URL"
                value={resourceForm.file_url}
                onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="text"
                placeholder="File Name"
                value={resourceForm.file_name}
                onChange={(e) => setResourceForm({ ...resourceForm, file_name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <input
                type="url"
                placeholder="External URL"
                value={resourceForm.external_url}
                onChange={(e) => setResourceForm({ ...resourceForm, external_url: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              />
              <label className="flex items-center gap-2 text-sm" style={{ color: palette.textColor }}>
                <input
                  type="checkbox"
                  checked={resourceForm.is_published}
                  onChange={(e) => setResourceForm({ ...resourceForm, is_published: e.target.checked })}
                />
                Published
              </label>
              <button
                onClick={handleSaveResource}
                disabled={loading}
                className="w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: palette.primary }}
              >
                {loading ? "Saving..." : editingItem ? "Update Resource" : "Add Resource"}
              </button>
              {editingItem && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setResourceForm({
                      title: "",
                      resource_type: "",
                      description: "",
                      file_url: "",
                      file_name: "",
                      external_url: "",
                      is_published: true
                    });
                  }}
                  className="w-full rounded-lg border py-2 text-sm font-semibold"
                  style={{ borderColor: palette.borderColor, color: palette.textColor }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-lg border p-3" style={{ borderColor: palette.borderColor }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium" style={{ color: palette.textColor }}>{resource.title}</p>
                      <p className="text-xs" style={{ color: palette.mutedTextColor }}>{resource.resource_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(resource);
                          setResourceForm(resource);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-xs ${resource.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {resource.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WriPartnershipAdmin;
