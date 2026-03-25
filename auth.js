import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────────

export const ROLES = {
  EXECUTIVE: "executive",
  MANAGER: "manager",
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ─── Token Helpers ────────────────────────────────────────────────────────────

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Decode the payload of a JWT (no verification — server-side only for that). */
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

// ─── Axios Client ─────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      if (isTokenExpired(token)) {
        clearSession();
        window.dispatchEvent(new CustomEvent("auth:expired"));
        return Promise.reject(new Error("Token expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 / 403
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      clearSession();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    if (status === 403) {
      window.dispatchEvent(
        new CustomEvent("auth:forbidden", {
          detail: { url: error.config?.url },
        })
      );
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────

/**
 * Login and persist the session.
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: { id, name, email, role } }}
 */
export async function login(credentials) {
  const { data } = await apiClient.post("/auth/login", credentials);
  saveSession(data.token, data.user);
  return data;
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearSession();
  }
}

// ─── Role Guards ──────────────────────────────────────────────────────────────

/**
 * Returns true when the current user has AT LEAST the required role.
 * Role hierarchy: executive > manager
 */
export function hasRole(requiredRole) {
  const user = getCurrentUser();
  if (!user) return false;

  const hierarchy = [ROLES.MANAGER, ROLES.EXECUTIVE];
  const userLevel = hierarchy.indexOf(user.role);
  const requiredLevel = hierarchy.indexOf(requiredRole);

  return userLevel >= requiredLevel && userLevel !== -1;
}

export function isExecutive() {
  return hasRole(ROLES.EXECUTIVE);
}

export function isManager() {
  return hasRole(ROLES.MANAGER);
}

/**
 * Higher-order function: wraps an async API call with a role check.
 *
 * @example
 *   const getFinancials = withRole(ROLES.EXECUTIVE, () =>
 *     apiClient.get("/reports/financials").then(r => r.data)
 *   );
 *
 *   await getFinancials();  // throws if current user is not executive
 */
export function withRole(requiredRole, fn) {
  return async (...args) => {
    if (!hasRole(requiredRole)) {
      throw Object.assign(new Error("Insufficient permissions"), {
        code: "FORBIDDEN",
        requiredRole,
      });
    }
    return fn(...args);
  };
}

//Protected Endpoints (examples) 

//Accessible by any authenticated user (manager or executive)
export const getDashboard = () =>
  withRole(ROLES.MANAGER, () =>
    apiClient.get("/dashboard").then((r) => r.data)
  )();

//Accessible by executives only
export const getFinancialReports = () =>
  withRole(ROLES.EXECUTIVE, () =>
    apiClient.get("/reports/financial").then((r) => r.data)
  )();

export const approveStrategicPlan = (planId) =>
  withRole(ROLES.EXECUTIVE, () =>
    apiClient.post(`/plans/${planId}/approve`).then((r) => r.data)
  )();

// Manager-level endpoints
export const getTeamMetrics = (teamId) =>
  withRole(ROLES.MANAGER, () =>
    apiClient.get(`/teams/${teamId}/metrics`).then((r) => r.data)
  )();

export const submitReport = (payload) =>
  withRole(ROLES.MANAGER, () =>
    apiClient.post("/reports", payload).then((r) => r.data)
  )();
