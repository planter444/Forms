import { Router } from "express";
import multer from "multer";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import {
  ensureDefaultCategories,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listResources,
  createResource,
  updateResource,
  deleteResource,
  getResourceById,
  recordDownload,
  getFeaturedResources,
  getOverviewStats,
  getFilterOptions
} from "./resourceLibraryModel.js";
import { getSolarMkononiSettings } from "./solarMkononiSettingsStore.js";
import { requireAdmin } from "./auth.js";
import {
  saveResourceFile,
  deleteResourceFile,
  resolveResourceFilePath,
  ensureResourceLibraryRoot
} from "./resourceLibraryStorage.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024
  }
});

const ALLOWED_MIME_TYPES = new Map([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["text/csv", "csv"],
  ["application/vnd.ms-powerpoint", "ppt"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  ["application/zip", "zip"],
  ["application/x-zip-compressed", "zip"],
  ["application/json", "json"],
  ["application/xml", "xml"],
  ["text/plain", "txt"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["video/mp4", "mp4"],
  ["audio/mpeg", "mp3"]
]);

const toBoolean = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = `${value}`.toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
};

const parseList = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return `${value}`
    .split(/,|\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildDownloadUrl = (resource) => {
  if (!resource) {
    return "";
  }

  if (resource.filePath) {
    return `/api/solar-library/resources/${resource.id}/download`;
  }

  return resource.fileUrl || resource.externalUrl || "";
};

const serializeResource = (resource) => ({
  ...resource,
  downloadUrl: buildDownloadUrl(resource)
});

const ensureBaseState = async () => {
  await ensureResourceLibraryRoot();
  await ensureDefaultCategories();
};

router.get("/overview", async (_request, response) => {
  await ensureBaseState();
  const settings = await getSolarMkononiSettings();
  const librarySettings = settings.solarResourceLibrary || {};
  const [categories, featuredResources, stats, filterOptions] = await Promise.all([
    listCategories(),
    getFeaturedResources(6),
    getOverviewStats(),
    getFilterOptions()
  ]);

  response.json({
    settings: librarySettings,
    categories,
    featuredResources: featuredResources.map(serializeResource),
    stats,
    filters: filterOptions
  });
});

router.get("/categories", async (request, response) => {
  await ensureBaseState();
  const includeInactive = toBoolean(request.query.includeInactive);
  const categories = await listCategories({ includeInactive });
  response.json({ categories });
});

router.get("/resources", async (request, response) => {
  await ensureBaseState();
  const query = {
    page: request.query.page,
    limit: request.query.limit,
    search: request.query.search,
    category: request.query.category,
    tags: parseList(request.query.tags),
    fileTypes: parseList(request.query.fileTypes),
    sort: request.query.sort,
    featuredOnly: toBoolean(request.query.featured)
  };
  const result = await listResources(query);
  response.json({
    ...result,
    resources: result.resources.map(serializeResource)
  });
});

router.get("/resources/:id/download", async (request, response) => {
  await ensureBaseState();
  const resource = await getResourceById(request.params.id);

  if (!resource || !resource.isPublished) {
    return response.status(404).json({ message: "Resource not found." });
  }

  if (!resource.allowDownloads) {
    return response.status(403).json({ message: "Downloads have been disabled for this resource." });
  }

  if (resource.filePath) {
    const fullPath = resolveResourceFilePath(resource.filePath);

    try {
      const fileInfo = await stat(fullPath);
      response.setHeader("Content-Type", resource.mimeType || "application/octet-stream");
      response.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(resource.fileName || resource.title)}"`
      );
      response.setHeader("Content-Length", fileInfo.size);
      const stream = createReadStream(fullPath);
      stream.pipe(response);
      await recordDownload(resource.id, {
        source: "public",
        ipAddress: request.ip,
        userAgent: request.get("user-agent")
      });
      return;
    } catch (error) {
      console.error("Resource download error", error);
      return response.status(500).json({ message: "Unable to download resource file." });
    }
  }

  const redirectUrl = resource.externalUrl || resource.fileUrl;

  if (!redirectUrl) {
    return response.status(404).json({ message: "Resource file is unavailable." });
  }

  await recordDownload(resource.id, {
    source: "public-redirect",
    ipAddress: request.ip,
    userAgent: request.get("user-agent")
  });
  return response.redirect(302, redirectUrl);
});

router.use("/admin", requireAdmin);

router.get("/admin/resources", async (request, response) => {
  const result = await listResources({
    page: request.query.page,
    limit: request.query.limit,
    search: request.query.search,
    category: request.query.category,
    tags: parseList(request.query.tags),
    fileTypes: parseList(request.query.fileTypes),
    sort: request.query.sort,
    includeDrafts: true
  });

  response.json({
    ...result,
    resources: result.resources.map(serializeResource)
  });
});

router.post("/admin/categories", async (request, response) => {
  const payload = request.body || {};

  if (!payload.name) {
    return response.status(400).json({ message: "Category name is required." });
  }

  const category = await createCategory(payload);
  response.status(201).json({ category });
});

router.put("/admin/categories/:id", async (request, response) => {
  const category = await updateCategory(Number(request.params.id), request.body || {});

  if (!category) {
    return response.status(404).json({ message: "Category not found." });
  }

  response.json({ category });
});

router.delete("/admin/categories/:id", async (request, response) => {
  const deleted = await deleteCategory(Number(request.params.id));

  if (!deleted) {
    return response.status(404).json({ message: "Category not found." });
  }

  response.json({ success: true });
});

const parseResourcePayload = (request, file) => {
  const payload = {
    categoryId: request.body.categoryId ? Number(request.body.categoryId) : null,
    title: request.body.title,
    description: request.body.description || "",
    summary: request.body.summary || "",
    coverImageUrl: request.body.coverImageUrl || "",
    previewUrl: request.body.previewUrl || "",
    externalUrl: request.body.externalUrl || "",
    resourceType: request.body.resourceType || "",
    tags: parseList(request.body.tags),
    sortOrder: request.body.sortOrder,
    isFeatured: toBoolean(request.body.isFeatured),
    isPublished: toBoolean(request.body.isPublished ?? true),
    allowDownloads: toBoolean(request.body.allowDownloads ?? true)
  };

  if (request.body.publishedAt) {
    payload.publishedAt = new Date(request.body.publishedAt);
  }

  if (file) {
    payload.fileName = request.body.fileName || file.originalname;
    payload.mimeType = file.mimetype;
    payload.fileSize = file.size;
  } else if (request.body.fileName) {
    payload.fileName = request.body.fileName;
  }

  if (request.body.fileUrl) {
    payload.fileUrl = request.body.fileUrl;
  }

  return payload;
};

const validateFile = (file) => {
  if (!file) {
    return;
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const allowed = Array.from(ALLOWED_MIME_TYPES.keys()).join(", ");
    const error = new Error(
      `Unsupported file type. Allowed MIME types include: ${allowed}`
    );
    error.statusCode = 400;
    throw error;
  }
};

router.post("/admin/resources", upload.single("file"), async (request, response) => {
  const file = request.file;

  if (!request.body.title) {
    return response.status(400).json({ message: "Resource title is required." });
  }

  try {
    validateFile(file);
  } catch (error) {
    return response.status(error.statusCode || 400).json({ message: error.message });
  }

  let fileMetadata = {};

  if (file) {
    try {
      const saved = await saveResourceFile({
        buffer: file.buffer,
        originalName: request.body.fileName || file.originalname,
        mimeType: file.mimetype
      });
      fileMetadata = {
        fileName: request.body.fileName || file.originalname,
        filePath: saved.relativePath,
        fileUrl: "",
        fileExtension: saved.extension,
        mimeType: saved.mimeType,
        fileSize: saved.byteSize,
        storageProvider: "local"
      };
    } catch (error) {
      console.error("Unable to store resource file", error);
      return response.status(500).json({ message: "Unable to store uploaded file." });
    }
  }

  const resource = await createResource({
    ...parseResourcePayload(request, file),
    ...fileMetadata
  });

  response.status(201).json({ resource: serializeResource(resource) });
});

router.put("/admin/resources/:id", upload.single("file"), async (request, response) => {
  const resource = await getResourceById(request.params.id);

  if (!resource) {
    return response.status(404).json({ message: "Resource not found." });
  }

  const file = request.file;

  try {
    validateFile(file);
  } catch (error) {
    return response.status(error.statusCode || 400).json({ message: error.message });
  }

  let fileMetadata = {};

  if (file) {
    try {
      const saved = await saveResourceFile({
        buffer: file.buffer,
        originalName: request.body.fileName || file.originalname,
        mimeType: file.mimetype
      });
      fileMetadata = {
        fileName: request.body.fileName || file.originalname,
        filePath: saved.relativePath,
        fileUrl: "",
        fileExtension: saved.extension,
        mimeType: saved.mimeType,
        fileSize: saved.byteSize,
        storageProvider: "local"
      };

      if (resource.filePath) {
        await deleteResourceFile(resource.filePath);
      }
    } catch (error) {
      console.error("Unable to update resource file", error);
      return response.status(500).json({ message: "Unable to store uploaded file." });
    }
  }

  const updated = await updateResource(request.params.id, {
    ...parseResourcePayload(request, file),
    ...fileMetadata
  });

  response.json({ resource: serializeResource(updated) });
});

router.delete("/admin/resources/:id", async (request, response) => {
  const deleted = await deleteResource(request.params.id);

  if (!deleted) {
    return response.status(404).json({ message: "Resource not found." });
  }

  if (deleted.file_path) {
    await deleteResourceFile(deleted.file_path);
  }

  response.json({ success: true });
});

export default router;
