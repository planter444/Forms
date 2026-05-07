const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const request = async (path, options = {}) => {
  const { headers: customHeaders, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson ? data.message : "Request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const submitListing = (payload) =>
  request("/api/submissions", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const getSiteSettings = () =>
  request("/api/site-settings", {
    cache: "no-store"
  });

export const checkAdminAccess = (payload) =>
  request("/api/admin/access-gate", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const adminLogin = (credentials) =>
  request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });

export const updateSiteSettings = (token, settings) =>
  request("/api/site-settings", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });

export const resetSiteSettings = (token) =>
  request("/api/site-settings/reset", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const uploadAdminMedia = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/admin/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to upload media.");
  }

  return data;
};

export const getSubmissions = (token) =>
  request("/api/submissions", {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const deleteSubmission = (token, id) =>
  request(`/api/submissions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const exportSubmissions = async (token) => {
  const response = await fetch(`${API_URL}/api/submissions/export`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Unable to export submissions.");
  }

  return response.blob();
};
