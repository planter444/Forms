import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultTermsConditionsSettings } from "./defaultTermsConditionsSettings.js";
import { databaseState, pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, "../data");
const settingsPath = path.resolve(dataDirectory, "terms-conditions-settings.json");

const clone = (value) => JSON.parse(JSON.stringify(value));

const mergeSettings = (base, updates) => {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return clone(base);
  }

  const output = Array.isArray(base) ? [...base] : { ...base };

  Object.entries(updates).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      output[key] = mergeSettings(base[key], value);
      return;
    }

    output[key] = value;
  });

  return output;
};

const ensureStore = async () => {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(settingsPath, "utf8");
  } catch {
    await writeFile(settingsPath, JSON.stringify(defaultTermsConditionsSettings, null, 2), "utf8");
  }
};

const getDatabaseSettings = async () => {
  if (!databaseState.ready) {
    return null;
  }

  const result = await pool.query("SELECT settings FROM site_settings WHERE id = $1", ["terms_conditions"]);
  return result.rows[0]?.settings || null;
};

const saveDatabaseSettings = async (settings) => {
  if (!databaseState.ready) {
    return false;
  }

  await pool.query(
    `
      INSERT INTO site_settings (id, settings, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET settings = EXCLUDED.settings, updated_at = CURRENT_TIMESTAMP
    `,
    ["terms_conditions", settings]
  );

  return true;
};

export const getTermsConditionsSettings = async () => {
  try {
    const databaseSettings = await getDatabaseSettings();

    if (databaseSettings) {
      return mergeSettings(defaultTermsConditionsSettings, databaseSettings);
    }
  } catch {}

  await ensureStore();

  try {
    const raw = await readFile(settingsPath, "utf8");
    const parsed = JSON.parse(raw);
    return mergeSettings(defaultTermsConditionsSettings, parsed);
  } catch {
    return clone(defaultTermsConditionsSettings);
  }
};

export const updateTermsConditionsSettings = async (updates) => {
  const current = await getTermsConditionsSettings();
  const next = mergeSettings(current, updates);
  const savedToDatabase = await saveDatabaseSettings(next);

  if (!savedToDatabase) {
    await writeFile(settingsPath, JSON.stringify(next, null, 2), "utf8");
  }

  return next;
};

export const resetTermsConditionsSettings = async () => {
  const current = await getTermsConditionsSettings();
  const defaults = clone(defaultTermsConditionsSettings);
  const next = mergeSettings(current, defaults);
  const savedToDatabase = await saveDatabaseSettings(next);

  if (!savedToDatabase) {
    await ensureStore();
    await writeFile(settingsPath, JSON.stringify(next, null, 2), "utf8");
  }

  return next;
};
