import { useEffect, useMemo, useState } from "react";
import {
  adminCreateCategory,
  adminCreateResource,
  adminDeleteCategory,
  adminDeleteResource,
  adminListResources,
  adminUpdateCategory,
  adminUpdateResource,
  fetchLibraryCategories
} from "../lib/resourceLibraryApi.js";

const defaultCategoryForm = {
  name: "",
  description: "",
  icon: "",
  accentColor: "#0f766e",
  displayOrder: 0,
  isFeatured: false,
  isActive: true
};

const defaultResourceForm = {
  title: "",
  description: "",
  summary: "",
  categoryId: "",
  tags: "",
  fileName: "",
  fileUrl: "",
  externalUrl: "",
  coverImageUrl: "",
  previewUrl: "",
  resourceType: "",
  sortOrder: 0,
  publishedAt: "",
  isFeatured: false,
  allowDownloads: true,
  isPublished: true
};

const SolarResourceLibraryAdmin = ({ token, palette, setNotice, setError }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [resources, setResources] = useState([]);
  const [resourceMeta, setResourceMeta] = useState({ totalPages: 1, total: 0 });
  const [resourcePage, setResourcePage] = useState(1);
  const [resourceFilters, setResourceFilters] = useState({ search: "", category: "all", sort: "featured" });
  const [resourceForm, setResourceForm] = useState(defaultResourceForm);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceSubmitting, setResourceSubmitting] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadCategories();
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const debounce = setTimeout(() => {
      loadResources(resourcePage, resourceFilters);
    }, 250);

    return () => clearTimeout(debounce);
  }, [token, resourceFilters, resourcePage]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchLibraryCategories({ includeInactive: true });
      setCategories(data.categories || []);
    } catch (error) {
      setError(error.message || "Unable to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadResources = async (page = resourcePage, filters = resourceFilters) => {
    setLoadingResources(true);
    try {
      const query = {
        page,
        limit: 10,
        sort: filters.sort
      };

      if (filters.search.trim()) {
        query.search = filters.search.trim();
      }

      if (filters.category !== "all") {
        query.category = filters.category;
      }

      const data = await adminListResources(token, query);
      setResources(data.resources || []);
      setResourceMeta({ totalPages: data.totalPages || 1, total: data.total || 0 });
      if (data.page && data.page !== resourcePage) {
        setResourcePage(data.page);
      }
    } catch (error) {
      setError(error.message || "Unable to load resources.");
    } finally {
      setLoadingResources(false);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setCategorySubmitting(true);
    setError("");

    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description,
        icon: categoryForm.icon,
        accentColor: categoryForm.accentColor,
        displayOrder: Number(categoryForm.displayOrder) || 0,
        isFeatured: categoryForm.isFeatured,
        isActive: categoryForm.isActive
      };

      if (!payload.name) {
        setError("Category name is required.");
        setCategorySubmitting(false);
        return;
      }

      if (editingCategoryId) {
        await adminUpdateCategory(token, editingCategoryId, payload);
        setNotice("Category updated.");
      } else {
        await adminCreateCategory(token, payload);
        setNotice("Category created.");
      }

      setCategoryForm(defaultCategoryForm);
      setEditingCategoryId(null);
      loadCategories();
    } catch (error) {
      setError(error.message || "Unable to save category.");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      accentColor: category.accentColor || "#0f766e",
      displayOrder: category.displayOrder || 0,
      isFeatured: category.isFeatured,
      isActive: category.isActive
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? Resources will remain but become uncategorized.`)) {
      return;
    }

    setError("");
    try {
      await adminDeleteCategory(token, category.id);
      setNotice("Category removed.");
      loadCategories();
    } catch (error) {
      setError(error.message || "Unable to delete category.");
    }
  };

  const handleResourceSubmit = async (event) => {
    event.preventDefault();
    setResourceSubmitting(true);
    setError("");

    try {
      const payload = {
        ...resourceForm,
        categoryId: resourceForm.categoryId ? Number(resourceForm.categoryId) : "",
        tags: resourceForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      };

      if (!payload.title) {
        setError("Resource title is required.");
        setResourceSubmitting(false);
        return;
      }

      if (editingResourceId) {
        await adminUpdateResource(token, editingResourceId, payload, resourceFile);
        setNotice("Resource updated.");
      } else {
        await adminCreateResource(token, payload, resourceFile);
        setNotice("Resource created.");
      }

      setResourceForm(defaultResourceForm);
      setEditingResourceId(null);
      setResourceFile(null);
      setResourcePage(1);
      loadResources(1, resourceFilters);
    } catch (error) {
      setError(error.message || "Unable to save resource.");
    } finally {
      setResourceSubmitting(false);
    }
  };

  const handleResourceEdit = (resource) => {
    setEditingResourceId(resource.id);
    setResourceForm({
      title: resource.title,
      description: resource.description,
      summary: resource.summary,
      categoryId: resource.categoryId || "",
      tags: Array.isArray(resource.tags) ? resource.tags.join(", ") : "",
      fileName: resource.fileName,
      fileUrl: resource.fileUrl,
      externalUrl: resource.externalUrl,
      coverImageUrl: resource.coverImageUrl,
      previewUrl: resource.previewUrl,
      resourceType: resource.resourceType,
      sortOrder: resource.sortOrder || 0,
      publishedAt: resource.publishedAt ? new Date(resource.publishedAt).toISOString().slice(0, 16) : "",
      isFeatured: resource.isFeatured,
      allowDownloads: resource.allowDownloads,
      isPublished: resource.isPublished
    });
    setResourceFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResourceDelete = async (resource) => {
    if (!window.confirm(`Delete resource "${resource.title}"?`)) {
      return;
    }

    setError("");
    try {
      await adminDeleteResource(token, resource.id);
      setNotice("Resource removed.");
      loadResources(resourcePage, resourceFilters);
    } catch (error) {
      setError(error.message || "Unable to delete resource.");
    }
  };

  const categoryOptions = useMemo(() => [...categories].sort((a, b) => a.displayOrder - b.displayOrder), [categories]);

  if (!token) {
    return (
      <section className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
        <h2 className="text-2xl font-semibold" style={{ color: palette.textColor }}>Solar Resource Library</h2>
        <p className="mt-2 text-sm" style={{ color: palette.mutedTextColor }}>Please sign in to manage the resource library.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
        <div className="flex flex-col gap-3 border-b pb-4" style={{ borderColor: palette.borderColor }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: palette.textColor }}>Solar Resource Library</p>
            <p className="text-sm" style={{ color: palette.mutedTextColor }}>Manage categories, upload files, and control featured resources.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: palette.mutedTextColor }}>
            <span>Total categories: {categories.length}</span>
            <span>Total resources: {resourceMeta.total}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleResourceSubmit} className="space-y-4 rounded-3xl border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: palette.textColor }}>{editingResourceId ? "Edit resource" : "Create resource"}</p>
                <p className="text-xs" style={{ color: palette.mutedTextColor }}>Upload files up to 30 MB or link external URLs.</p>
              </div>
              {editingResourceId ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-rose-600"
                  onClick={() => {
                    setEditingResourceId(null);
                    setResourceForm(defaultResourceForm);
                    setResourceFile(null);
                  }}
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
              Title
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                value={resourceForm.title}
                onChange={(event) => setResourceForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </label>

            <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
              Summary / description
              <textarea
                rows={3}
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                value={resourceForm.summary || resourceForm.description}
                onChange={(event) => setResourceForm((prev) => ({ ...prev, summary: event.target.value, description: event.target.value }))}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Category
                <select
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.categoryId}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                >
                  <option value="">Uncategorized</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Tags (comma separated)
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.tags}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="policy, training"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                File upload
                <input
                  type="file"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  onChange={(event) => setResourceFile(event.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs" style={{ color: palette.mutedTextColor }}>PDF, DOCX, XLSX, PPTX, ZIP, MP4, MP3, CSV (max 30 MB).</p>
              </label>
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                External file URL
                <input
                  type="url"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.fileUrl}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, fileUrl: event.target.value }))}
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs" style={{ color: palette.mutedTextColor }}>Optional if uploading a file.</p>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                External preview URL
                <input
                  type="url"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.externalUrl}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, externalUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </label>
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Cover image URL (optional)
                <input
                  type="url"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.coverImageUrl}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Resource type label
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.resourceType}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, resourceType: event.target.value }))}
                  placeholder="pdf, toolkit"
                />
              </label>
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Sort order
                <input
                  type="number"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.sortOrder}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
                />
              </label>
              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Published at
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={resourceForm.publishedAt}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground, color: palette.textColor }}>
                Featured
                <input
                  type="checkbox"
                  checked={resourceForm.isFeatured}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground, color: palette.textColor }}>
                Published
                <input
                  type="checkbox"
                  checked={resourceForm.isPublished}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground, color: palette.textColor }}>
                Allow downloads
                <input
                  type="checkbox"
                  checked={resourceForm.allowDownloads}
                  onChange={(event) => setResourceForm((prev) => ({ ...prev, allowDownloads: event.target.checked }))}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={resourceSubmitting}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resourceSubmitting ? "Saving..." : editingResourceId ? "Update resource" : "Create resource"}
            </button>
          </form>

          <div className="space-y-4">
            <form onSubmit={handleCategorySubmit} className="space-y-4 rounded-3xl border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: palette.textColor }}>{editingCategoryId ? "Edit category" : "Add category"}</p>
                {editingCategoryId ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-rose-600"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryForm(defaultCategoryForm);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Name
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                Description
                <textarea
                  rows={2}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                  value={categoryForm.description}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                  Accent color
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
                    <input
                      type="color"
                      className="h-10 w-16 rounded"
                      value={categoryForm.accentColor}
                      onChange={(event) => setCategoryForm((prev) => ({ ...prev, accentColor: event.target.value }))}
                    />
                    <input
                      type="text"
                      className="flex-1 border-none bg-transparent text-sm outline-none"
                      value={categoryForm.accentColor}
                      onChange={(event) => setCategoryForm((prev) => ({ ...prev, accentColor: event.target.value }))}
                    />
                  </div>
                </label>
                <label className="block text-sm font-medium" style={{ color: palette.textColor }}>
                  Display order
                  <input
                    type="number"
                    className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                    style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}
                    value={categoryForm.displayOrder}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, displayOrder: Number(event.target.value) }))}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground, color: palette.textColor }}>
                  Featured
                  <input
                    type="checkbox"
                    checked={categoryForm.isFeatured}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
                  />
                </label>
                <label className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground, color: palette.textColor }}>
                  Active
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={categorySubmitting}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {categorySubmitting ? "Saving..." : editingCategoryId ? "Update category" : "Add category"}
              </button>
            </form>

            <div className="rounded-3xl border p-5" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: palette.textColor }}>Categories</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500"
                  onClick={loadCategories}
                  disabled={loadingCategories}
                >
                  {loadingCategories ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <div className="mt-4 space-y-3 max-h-[360px] overflow-auto pr-2">
                {categories.length ? (
                  categories.map((category) => (
                    <div key={category.id} className="rounded-2xl border p-4" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.accentColor || "#0f766e" }}
                            />
                            <p className="text-sm font-semibold" style={{ color: palette.textColor }}>{category.name}</p>
                          </div>
                          <p className="text-xs" style={{ color: palette.mutedTextColor }}>{category.description || "No description"}</p>
                        </div>
                        <div className="text-right text-xs" style={{ color: palette.mutedTextColor }}>
                          <p>{category.resourceCount || 0} resources</p>
                          <p>{category.isActive ? "Active" : "Inactive"}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 text-xs">
                        <button
                          type="button"
                          className="rounded-xl border px-3 py-1 font-semibold"
                          style={{ borderColor: palette.borderColor, color: palette.textColor }}
                          onClick={() => handleCategoryEdit(category)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border px-3 py-1 font-semibold"
                          style={{ borderColor: "#fecaca", color: "#b91c1c" }}
                          onClick={() => handleCategoryDelete(category)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm" style={{ color: palette.mutedTextColor }}>No categories yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border p-6" style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceBackground }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: palette.textColor }}>Resource inventory</p>
            <p className="text-sm" style={{ color: palette.mutedTextColor }}>Search, filter, and manage uploaded resources.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <input
              type="search"
              placeholder="Search titles"
              className="rounded-2xl border px-4 py-2"
              style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              value={resourceFilters.search}
              onChange={(event) => {
                setResourceFilters((prev) => ({ ...prev, search: event.target.value }));
                setResourcePage(1);
              }}
            />
            <select
              className="rounded-2xl border px-4 py-2"
              style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              value={resourceFilters.category}
              onChange={(event) => {
                setResourceFilters((prev) => ({ ...prev, category: event.target.value }));
                setResourcePage(1);
              }}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border px-4 py-2"
              style={{ borderColor: palette.borderColor, backgroundColor: palette.surfaceMuted }}
              value={resourceFilters.sort}
              onChange={(event) => {
                setResourceFilters((prev) => ({ ...prev, sort: event.target.value }));
                setResourcePage(1);
              }}
            >
              <option value="featured">Featured first</option>
              <option value="newest">Newest</option>
              <option value="popular">Most downloaded</option>
              <option value="alpha">A → Z</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border" style={{ borderColor: palette.borderColor }}>
          <table className="min-w-full text-left text-sm">
            <thead style={{ backgroundColor: palette.surfaceMuted }}>
              <tr>
                <th className="px-4 py-3 font-semibold" style={{ color: palette.textColor }}>Title</th>
                <th className="px-4 py-3 font-semibold" style={{ color: palette.textColor }}>Category</th>
                <th className="px-4 py-3 font-semibold" style={{ color: palette.textColor }}>Published</th>
                <th className="px-4 py-3 font-semibold" style={{ color: palette.textColor }}>Downloads</th>
                <th className="px-4 py-3 font-semibold" style={{ color: palette.textColor }}>Status</th>
                <th className="px-4 py-3 font-semibold text-right" style={{ color: palette.textColor }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingResources ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm" style={{ color: palette.mutedTextColor }}>
                    Loading resources...
                  </td>
                </tr>
              ) : resources.length ? (
                resources.map((resource) => (
                  <tr key={resource.id} className="border-t" style={{ borderColor: palette.borderColor }}>
                    <td className="px-4 py-4">
                      <div className="font-semibold" style={{ color: palette.textColor }}>{resource.title}</div>
                      <div className="text-xs" style={{ color: palette.mutedTextColor }}>{resource.summary || resource.description}</div>
                    </td>
                    <td className="px-4 py-4 text-xs" style={{ color: palette.mutedTextColor }}>{resource.category?.name || "-"}</td>
                    <td className="px-4 py-4 text-xs" style={{ color: palette.mutedTextColor }}>{resource.publishedAt ? new Date(resource.publishedAt).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-4 text-xs" style={{ color: palette.mutedTextColor }}>{resource.downloadCount || 0}</td>
                    <td className="px-4 py-4 text-xs" style={{ color: palette.mutedTextColor }}>
                      {resource.isPublished ? "Published" : "Draft"}
                      {resource.isFeatured ? " • Featured" : ""}
                    </td>
                    <td className="px-4 py-4 text-right text-xs">
                      <button
                        type="button"
                        className="rounded-xl border px-3 py-1 font-semibold"
                        style={{ borderColor: palette.borderColor, color: palette.textColor }}
                        onClick={() => handleResourceEdit(resource)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ml-2 rounded-xl border px-3 py-1 font-semibold"
                        style={{ borderColor: "#fecaca", color: "#b91c1c" }}
                        onClick={() => handleResourceDelete(resource)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm" style={{ color: palette.mutedTextColor }}>
                    No resources match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {resourceMeta.totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              className="rounded-2xl border px-4 py-2 font-semibold"
              style={{ borderColor: palette.borderColor, color: palette.textColor }}
              disabled={resourcePage === 1}
              onClick={() => setResourcePage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <p style={{ color: palette.mutedTextColor }}>
              Page {resourcePage} of {resourceMeta.totalPages}
            </p>
            <button
              type="button"
              className="rounded-2xl border px-4 py-2 font-semibold"
              style={{ borderColor: palette.borderColor, color: palette.textColor }}
              disabled={resourcePage >= resourceMeta.totalPages}
              onClick={() => setResourcePage((prev) => Math.min(resourceMeta.totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SolarResourceLibraryAdmin;
