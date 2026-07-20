import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRoot = path.resolve(__dirname, "../data/solar-resource-library");
export const resourceLibraryRoot = path.resolve(process.env.SOLAR_RESOURCE_LIBRARY_ROOT || defaultRoot);

const randomSuffix = () => crypto.randomBytes(6).toString("hex");

const normalizeSegment = (value) =>
  `${value || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120) || "file";

export const ensureResourceLibraryRoot = async () => {
  await mkdir(resourceLibraryRoot, { recursive: true });
};

export const saveResourceFile = async ({ buffer, originalName, mimeType }) => {
  if (!buffer?.length) {
    throw new Error("Uploaded file buffer is empty.");
  }

  await ensureResourceLibraryRoot();
  const now = new Date();
  const year = `${now.getUTCFullYear()}`;
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  const directory = path.join(resourceLibraryRoot, year, month);
  await mkdir(directory, { recursive: true });

  const ext = `${path.extname(originalName || "").toLowerCase()}`;
  const base = normalizeSegment(path.basename(originalName || "resource", ext));
  const fileName = `${base}-${randomSuffix()}${ext}`;
  const filePath = path.join(directory, fileName);
  await writeFile(filePath, buffer);

  return {
    fileName,
    relativePath: path.relative(resourceLibraryRoot, filePath).replace(/\\/g, "/"),
    absolutePath: filePath,
    mimeType: mimeType || "application/octet-stream",
    extension: ext.replace(/^\./, ""),
    byteSize: buffer.length
  };
};

export const deleteResourceFile = async (relativePath) => {
  if (!relativePath) {
    return;
  }

  const absolutePath = path.resolve(resourceLibraryRoot, relativePath);

  try {
    await rm(absolutePath);
  } catch {}
};

export const resolveResourceFilePath = (relativePath) =>
  relativePath ? path.resolve(resourceLibraryRoot, relativePath) : "";

const coverDirectory = path.join(resourceLibraryRoot, "covers");

export const saveCoverImage = async ({ buffer, originalName, mimeType }) => {
  if (!buffer?.length) {
    throw new Error("Uploaded cover image buffer is empty.");
  }

  await mkdir(coverDirectory, { recursive: true });

  const ext = `${path.extname(originalName || "").toLowerCase()}` || ".jpg";
  const base = normalizeSegment(path.basename(originalName || "cover", ext)) || "cover";
  const fileName = `${base}-${randomSuffix()}${ext}`;
  const filePath = path.join(coverDirectory, fileName);
  await writeFile(filePath, buffer);

  return {
    fileName,
    relativePath: path.relative(resourceLibraryRoot, filePath).replace(/\\/g, "/"),
    absolutePath: filePath,
    mimeType: mimeType || "image/jpeg",
    extension: ext.replace(/^\./, ""),
    byteSize: buffer.length
  };
};

export const deleteCoverImage = async (fileName) => {
  if (!fileName) {
    return;
  }

  const safeName = path.basename(fileName);
  if (!safeName || safeName.includes("..")) {
    return;
  }

  const absolutePath = path.join(coverDirectory, safeName);

  try {
    await rm(absolutePath);
  } catch {}
};

export const resolveCoverImagePath = (fileName) => {
  if (!fileName) {
    return "";
  }

  const safeName = path.basename(fileName);
  if (!safeName || safeName.includes("..")) {
    return "";
  }

  return path.join(coverDirectory, safeName);
};
