/**
 * PizzaHub API Client Helper
 * Handles HTTP requests to the backend with automatic Bearer token injection
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

/**
 * Universal fetch wrapper for PizzaHub API
 * @param endpoint - Relative endpoint path (e.g. '/api/auth/jwt')
 * @param options - Fetch request options
 */
export async function apiRequest<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers = {}, ...customConfig } = options;

  // Retrieve token from localStorage in browser environment
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, config);
  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      typeof responseData === 'object' && responseData && 'message' in responseData
        ? String((responseData as { message?: string }).message)
        : `Request failed with status ${response.status}`;

    const error: ApiError = new Error(errorMessage);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData as T;
}

export default apiRequest;
