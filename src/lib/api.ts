const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export interface AuthResponse {
  token: string;
}

export interface DashboardSummary {
  farmers: number;
  collections: number;
  revenue: number;
}

export interface Farmer {
  id: number;
  name: string;
  phone: string;
  location: string;
  created_at: string;
}

export interface MilkCollection {
  id: number;
  farmer_id: number;
  volume_liters: number;
  fat_content: number;
  collection_date: string;
}

export interface Payment {
  id: number;
  farmer_id: number;
  amount: number;
  method: string;
  paid_at: string;
}

export interface NotificationRecord {
  id: number;
  type: string;
  title: string;
  body: string;
  created_at: string;
  is_read: number;
}

function getAuthToken() {
  return localStorage.getItem("milk_mate_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("milk_mate_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("milk_mate_token");
}

export function parseJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export async function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function register(name: string, email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function forgotPassword(email: string, newPassword: string) {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email, newPassword },
  });
}

export async function fetchDashboard() {
  return apiRequest<DashboardSummary>("/dashboard/summary");
}

export async function fetchFarmers() {
  return apiRequest<Farmer[]>("/farmers");
}

export async function createFarmer(name: string, phone: string, location: string) {
  return apiRequest<{ id: number; message: string }>("/farmers", {
    method: "POST",
    body: { name, phone, location },
  });
}

export async function fetchMilkCollections() {
  return apiRequest<MilkCollection[]>("/milk-collection");
}

export async function createMilkCollection(
  farmer_id: number,
  volume_liters: number,
  fat_content: number,
  collection_date: string
) {
  return apiRequest<{ id: number; message: string }>("/milk-collection", {
    method: "POST",
    body: { farmer_id, volume_liters, fat_content, collection_date },
  });
}

export async function fetchPayments() {
  return apiRequest<Payment[]>("/payments");
}

export async function createPayment(
  farmer_id: number,
  amount: number,
  method: string,
  paid_at: string
) {
  return apiRequest<{ id: number; message: string }>("/payments", {
    method: "POST",
    body: { farmer_id, amount, method, paid_at },
  });
}

export async function fetchNotifications() {
  return apiRequest<NotificationRecord[]>("/notifications");
}

export async function createNotification(type: string, title: string, body: string) {
  return apiRequest<{ id: number; message: string }>("/notifications", {
    method: "POST",
    body: { type, title, body },
  });
}

export async function fetchAnalyticsMilkVolume() {
  return apiRequest<{ date: string; total_volume: number }[]>("/analytics/milk-volume");
}

export async function fetchAnalyticsPayments() {
  return apiRequest<{ date: string; total_amount: number }[]>("/analytics/payments");
}

export async function fetchReportDailyCollections() {
  return apiRequest<any>("/reports/daily-collections");
}

export async function fetchReportPayments() {
  return apiRequest<any>("/reports/payments");
}

export async function fetchAdminUsers() {
  return apiRequest<any[]>("/admin/users");
}

export async function sendAiPrompt(prompt: string) {
  return apiRequest<{ prompt: string; reply: string }>("/ai/assistant", {
    method: "POST",
    body: { prompt },
  });
}

// Monthly Reports API
export async function saveSalesRecords(sales: any[]) {
  return apiRequest<{ message: string }>("/reports/save-sales", {
    method: "POST",
    body: { sales },
  });
}

export async function savePaymentRecords(payments: any[]) {
  return apiRequest<{ message: string }>("/reports/save-payments", {
    method: "POST",
    body: { payments },
  });
}

export async function fetchMonthlyRecords(year: number, month: number, customerName: string) {
  return apiRequest<any>(`/reports/records/${year}/${month}/${customerName}`);
}

export async function generateMonthlyExcel(year: number, month: number, customerName: string) {
  return apiRequest<{ message: string; fileName: string; downloadUrl: string }>
    (`/reports/generate-excel/${year}/${month}/${customerName}`, {
    method: "POST",
  });
}

export async function listMonthlyReports(customerName: string) {
  return apiRequest<any>(`/reports/list/${customerName}`);
}

export async function downloadReport(fileName: string) {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/reports/download/${fileName}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to download report");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
