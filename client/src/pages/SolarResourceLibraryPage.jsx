import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLibraryOverview, fetchPublicResources } from "../lib/resourceLibraryApi.js";

const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) {
    return "-";
  }

  const thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let u = -1;
  let value = bytes;

  do {
    value /= thresh;
    ++u;
  } while (Math.abs(value) >= thresh && u < units.length - 1);

  return `${value.toFixed(1)} ${units[u]}`;
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const fileBadgeStyles = {
  pdf: { label: "PDF", background: "#fee2e2", color: "#b91c1c" },
  doc: { label: "DOC", background: "#e0ecff", color: "#1d4ed8" },
  docx: { label: "DOCX", background: "#e0ecff", color: "#1d4ed8" },
  xls: { label: "XLS", background: "#e0f2fe", color: "#0369a1" },
  xlsx: { label: "XLSX", background: "#e0f2fe", color: "#0369a1" },
  csv: { label: "CSV", background: "#fef9c3", color: "#854d0e" },
  ppt: { label: "PPT", background: "#ffedd5", color: "#9a3412" },
  pptx: { label: "PPTX", background: "#ffedd5", color: "#9a3412" },
  zip: { label: "ZIP", background: "#f3e8ff", color: "#6b21a8" },
  mp4: { label: "MP4", background: "#dbeafe", color: "#1d4ed8" },
  mp3: { label: "MP3", background: "#ede9fe", color: "#5b21b6" }
};

const getFileBadge = (resource, fileTypeLabels = {}) => {
  const extension = (resource.fileExtension || resource.resourceType || "").toLowerCase();
  const fallbackLabel = fileTypeLabels[extension] || extension.toUpperCase() || "FILE";

  if (fileBadgeStyles[extension]) {
    return { label: fileBadgeStyles[extension].label || fallbackLabel, ...fileBadgeStyles[extension] };
  }

  return {
    label: fallbackLabel,
    background: "#e0f2f1",
    color: "#065f46"
  };
};

const defaultFilters = {
  search: "",
  category: "all",
  fileType: "all",
  sort: "featured",
  tag: ""
};

const SolarResourceLibraryPage = () => {
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [resourceState, setResourceState] = useState({ resources: [], page: 1, totalPages: 1, total: 0 });
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");
  const [page, setPage] = useState(1);
  const feedRef = useRef(null);

  useEffect(() => {
    const loadOverview = async () => {
      setLoadingOverview(true);
      setOverviewError("");

      try {
        const data = await fetchLibraryOverview();
        setOverview(data);
        setSearchInput(filters.search);
        setTagInput(filters.tag);

        if (data?.settings?.seo?.title) {
          document.title = data.settings.seo.title;
        }
      } catch (error) {
        setOverviewError(error.message || "Unable to load resource library overview.");
      } finally {
        setLoadingOverview(false);
      }
    };

    loadOverview();
  }, []);

  useEffect(() => {
    const loadResources = async () => {
      setResourcesLoading(true);
      setResourcesError("");

      try {
        const query = {
          page,
          limit: 9,
          sort: filters.sort
        };

        if (filters.search.trim()) {
          query.search = filters.search.trim();
        }

        if (filters.category !== "all") {
          query.category = filters.category;
        }

        if (filters.fileType !== "all") {
          query.fileTypes = [filters.fileType];
        }

        if (filters.tag.trim()) {
          query.tags = [filters.tag.trim()];
        }

        const data = await fetchPublicResources(query);
        setResourceState({
          resources: data.resources || [],
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0
        });
      } catch (error) {
        setResourcesError(error.message || "Unable to load resources.");
      } finally {
        setResourcesLoading(false);
      }
    };

    loadResources();
  }, [filters, page]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    setTagInput(filters.tag);
  }, [filters.tag]);

  const handleSearchSubmit = (event) => {
    event?.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    setPage(1);
    scrollToFeed();
  };

  const handleTagSubmit = (event) => {
    event?.preventDefault();
    setFilters((prev) => ({ ...prev, tag: tagInput.trim() }));
    setPage(1);
    scrollToFeed();
  };

  const scrollToFeed = () => {
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const categories = overview?.categories || [];
  const featuredResources = overview?.featuredResources || [];
  const librarySettings = overview?.settings || {};
  const sortOptions = librarySettings.filters?.sortOptions || [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most downloaded" },
    { value: "alpha", label: "A → Z" }
  ];
  const fileTypes = overview?.filters?.fileTypes || [];

  const activeCategory = useMemo(() => {
    if (filters.category === "all") {
      return null;
    }

    return categories.find((item) => item.slug === filters.category) || null;
  }, [categories, filters.category]);

  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setPage(1);
    scrollToFeed();
  };

  const handleFileTypeChange = (value) => {
    setFilters((prev) => ({ ...prev, fileType: value }));
    setPage(1);
  };

  const handleSortChange = (value) => {
    setFilters((prev) => ({ ...prev, sort: value }));
    setPage(1);
  };

  const quickLinks = librarySettings.quickLinks || [];
  const statsCards = librarySettings.stats?.cards || [];
  const hero = librarySettings.hero || {};
  const cta = librarySettings.cta || {};
  const emptyState = librarySettings.emptyState || {};

  return (
    <div className="min-h-screen bg-[#f6fbf8]">
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at top, rgba(255,255,255,0.3), transparent 45%)" }} />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 lg:flex-row lg:items-end">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">{hero.eyebrow || "Solar Mkononi"}</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{hero.headline || "Solar Mkononi Resource Library"}</h1>
            <p className="mt-4 max-w-3xl text-lg text-emerald-100">{hero.description || "Access policy briefs, financial toolkits, technical guides, and curated learnings for Kenya's clean energy ecosystem."}</p>
            <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col gap-3 rounded-3xl bg-white/10 p-2 backdrop-blur-md sm:flex-row">
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={hero.searchPlaceholder || "Search policies, toolkits, best practices..."}
                className="flex-1 rounded-2xl border border-white/30 bg-white/20 px-4 py-3 text-base text-white placeholder:text-emerald-100 focus:border-white focus:outline-none"
              />
              <button type="submit" className="rounded-2xl bg-white px-6 py-3 text-base font-semibold text-emerald-800 shadow-lg shadow-emerald-900/20">
                Search library
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-emerald-100">
              <Link to="/solar-mkononi" className="inline-flex items-center gap-2 text-emerald-100 hover:text-white">
                <span>← Back to Solar Mkononi</span>
              </Link>
              <button
                type="button"
                onClick={scrollToFeed}
                className="inline-flex items-center gap-2 text-emerald-100 hover:text-white"
              >
                Skip to resources ↓
              </button>
            </div>
          </div>
          <div className="grid flex-1 gap-4 rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-100">{librarySettings.stats?.tagline || "Library snapshot"}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {statsCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="text-3xl font-semibold text-white">{card.value}</div>
                  <div className="mt-1 text-sm text-emerald-100">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {overviewError ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{overviewError}</div>
        ) : null}

        {loadingOverview ? (
          <div className="grid gap-6 rounded-3xl border border-emerald-50 bg-white p-8 shadow-soft">
            <div className="h-6 w-1/4 animate-pulse rounded-full bg-emerald-100" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-2xl bg-emerald-50" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {quickLinks.length ? (
              <section className="mb-12 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Quick links</p>
                    <h2 className="text-2xl font-bold text-emerald-900">Jump into curated collections</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("all")}
                      className={`rounded-full border px-4 py-2 font-medium ${filters.category === "all" ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" : "border-emerald-200 text-emerald-600"}`}
                    >
                      View all categories
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {quickLinks.map((link) => (
                    <button
                      type="button"
                      key={link.categorySlug}
                      onClick={() => {
                        handleCategoryChange(link.categorySlug);
                        scrollToFeed();
                      }}
                      className="flex flex-col gap-3 rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"
                      style={{ borderColor: `${link.accentColor || "#0f766e"}33` }}
                    >
                      <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em]" style={{ color: link.accentColor || "#0f766e" }}>
                        {link.label}
                      </div>
                      <p className="text-base text-slate-600">{link.description}</p>
                      <span className="text-sm font-semibold text-slate-500">Browse resources →</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {featuredResources.length ? (
              <section className="mb-12 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Featured</p>
                    <h2 className="text-2xl font-bold text-emerald-900">{librarySettings.featured?.title || "Featured resources"}</h2>
                    <p className="text-sm text-slate-600">{librarySettings.featured?.description || "Handpicked insights from the Solar Mkononi team."}</p>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToFeed}
                    className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700"
                  >
                    Jump to library ↓
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {featuredResources.map((resource) => (
                    <article key={resource.id} className="min-w-[260px] flex-1 rounded-3xl border border-white bg-white/80 p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Featured
                        </div>
                        <FileBadge resource={resource} fileTypeLabels={librarySettings.filters?.fileTypeLabels} />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-emerald-900">{resource.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{resource.summary || resource.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>{resource.category?.name || "Uncategorized"}</span>
                        <span>{formatDate(resource.publishedAt)}</span>
                      </div>
                      <a
                        href={resource.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Access resource →
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        <section ref={feedRef} id="library-feed" className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="lg:w-64">
              <div className="sticky top-6 rounded-3xl border border-emerald-50 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Refine results</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Category</label>
                    <select
                      className="mt-2 w-full rounded-2xl border border-emerald-200 px-3 py-2 text-sm"
                      value={filters.category}
                      onChange={(event) => handleCategoryChange(event.target.value)}
                    >
                      <option value="all">All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fileTypes.length ? (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">File type</label>
                      <select
                        className="mt-2 w-full rounded-2xl border border-emerald-200 px-3 py-2 text-sm"
                        value={filters.fileType}
                        onChange={(event) => handleFileTypeChange(event.target.value)}
                      >
                        <option value="all">All file types</option>
                        {fileTypes.map((type) => (
                          <option key={type} value={type}>
                            {(librarySettings.filters?.fileTypeLabels?.[type] || type || "").toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Sort by</label>
                    <select
                      className="mt-2 w-full rounded-2xl border border-emerald-200 px-3 py-2 text-sm"
                      value={filters.sort}
                      onChange={(event) => handleSortChange(event.target.value)}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <form onSubmit={handleTagSubmit}>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Tag contains</label>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        placeholder="e.g. paygo"
                        className="flex-1 rounded-2xl border border-emerald-200 px-3 py-2 text-sm"
                      />
                      <button type="submit" className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                        Apply
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Resource feed</p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeCategory ? activeCategory.name : "All resources"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {resourceState.total} resource{resourceState.total === 1 ? "" : "s"} available
                  </p>
                </div>
                <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 sm:w-auto">
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search library"
                    className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                    Go
                  </button>
                </form>
              </div>

              {resourcesError ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{resourcesError}</div>
              ) : null}

              {resourcesLoading ? (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-48 animate-pulse rounded-3xl bg-slate-100" />
                  ))}
                </div>
              ) : resourceState.resources.length ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {resourceState.resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      fileTypeLabels={librarySettings.filters?.fileTypeLabels}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-8 text-center">
                  <h3 className="text-xl font-semibold text-slate-800">{emptyState.title || "Resources are being curated"}</h3>
                  <p className="mt-3 text-sm text-slate-500">{emptyState.description || "Check back soon or reach out if you need a curated pack."}</p>
                  {emptyState.actionHref ? (
                    <a
                      href={emptyState.actionHref}
                      className="mt-4 inline-flex rounded-2xl border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-700"
                    >
                      {emptyState.actionLabel || "Contact team"}
                    </a>
                  ) : null}
                </div>
              )}

              {resourceState.totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="text-slate-500">
                    Page {resourceState.page} of {resourceState.totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(resourceState.totalPages, prev + 1))}
                    disabled={page === resourceState.totalPages}
                    className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-8 text-white">
          <div className="relative z-10 grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Need something custom?</p>
              <h2 className="mt-4 text-3xl font-bold">
                {cta.title || "Can't find what you need?"}
              </h2>
              <p className="mt-3 text-emerald-100">{cta.body || "Our technical working groups can help assemble bespoke toolkits for counties, financiers, and utilities."}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {cta.primaryHref ? (
                  <a
                    href={cta.primaryHref}
                    className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow"
                  >
                    {cta.primaryText || "Request support"}
                  </a>
                ) : null}
                {cta.secondaryHref ? (
                  <a
                    href={cta.secondaryHref}
                    className="rounded-2xl border border-white/50 px-6 py-3 text-sm font-semibold text-white"
                  >
                    {cta.secondaryText || "Visit Solar Mkononi"}
                  </a>
                ) : null}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white">
              <h3 className="text-xl font-semibold">Library focus areas</h3>
              <ul className="mt-4 space-y-3 text-sm text-emerald-100">
                <li>• Policies and regulations for Kenya's renewable energy landscape</li>
                <li>• Technical implementation guides for PAYGO, solar, and biodigesters</li>
                <li>• Business playbooks, financing toolkits, and investment decks</li>
                <li>• Facilitator toolkits, training curricula, and cohort exercises</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const FileBadge = ({ resource, fileTypeLabels }) => {
  const badge = getFileBadge(resource, fileTypeLabels);
  return (
    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: badge.background, color: badge.color }}>
      {badge.label}
    </span>
  );
};

const ResourceCard = ({ resource, fileTypeLabels }) => {
  const badge = getFileBadge(resource, fileTypeLabels);
  const chips = resource.tags || [];
  const downloadLabel = resource.allowDownloads === false ? "Preview resource" : "Download";
  const linkTarget = resource.downloadUrl || resource.externalUrl || resource.fileUrl || "#";

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          {resource.category?.name || "Uncategorized"}
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: badge.background, color: badge.color }}>
          {badge.label}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{resource.title}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-3">{resource.summary || resource.description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div>
          <dt className="font-semibold text-slate-400">Published</dt>
          <dd>{formatDate(resource.publishedAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-400">File size</dt>
          <dd>{formatBytes(resource.fileSize)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-400">Downloads</dt>
          <dd>{resource.downloadCount || 0}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-400">Status</dt>
          <dd>{resource.allowDownloads === false ? "Preview only" : "Downloadable"}</dd>
        </div>
      </dl>
      {chips.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <a
        href={linkTarget}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        {downloadLabel} →
      </a>
    </article>
  );
};

export default SolarResourceLibraryPage;
