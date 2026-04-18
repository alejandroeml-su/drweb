// ===== API Client for Supabase via Vercel Serverless Functions =====

const API_BASE = '/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;
  let url = `${API_BASE}/${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ===== Patients API =====
export const patientsApi = {
  async list(userId = 'local_user', limit = 500) {
    return apiRequest<{ items: Record<string, unknown>[]; total: number }>('patients', {
      params: { user_id: userId, limit: String(limit) },
    });
  },

  async get(id: string | number) {
    return apiRequest<Record<string, unknown>>('patients', {
      params: { id: String(id) },
    });
  },

  async create(data: Record<string, unknown>) {
    return apiRequest<Record<string, unknown>>('patients', {
      method: 'POST',
      body: data,
    });
  },

  async update(id: string | number, data: Record<string, unknown>) {
    return apiRequest<Record<string, unknown>>('patients', {
      method: 'PUT',
      body: data,
      params: { id: String(id) },
    });
  },

  async delete(id: string | number) {
    return apiRequest<{ message: string }>('patients', {
      method: 'DELETE',
      params: { id: String(id) },
    });
  },
};

// ===== Appointments API =====
export const appointmentsApi = {
  async list(userId = 'local_user', limit = 500) {
    return apiRequest<{ items: Record<string, unknown>[]; total: number }>('appointments', {
      params: { user_id: userId, limit: String(limit) },
    });
  },

  async create(data: Record<string, unknown>) {
    return apiRequest<Record<string, unknown>>('appointments', {
      method: 'POST',
      body: data,
    });
  },

  async delete(id: string | number) {
    return apiRequest<{ message: string }>('appointments', {
      method: 'DELETE',
      params: { id: String(id) },
    });
  },
};
