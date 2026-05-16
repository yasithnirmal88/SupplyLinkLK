import { API_URL } from '../constants/Config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<B = unknown> {
  method?: HttpMethod;
  body?: B;
  token?: string;
  headers?: Record<string, string>;
  // If true, do not attempt to parse JSON (useful for endpoints returning plain text)
  skipJson?: boolean;
}

export class ApiError extends Error {
  public status: number;
  public body?: any;

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
    this.name = 'ApiError';
  }
}

/**
 * Base API client for communicating with the Express backend.
 * Returns a typed response T and accepts an optional request body type B.
 */
export async function apiClient<T = unknown, B = unknown>(
  endpoint: string,
  options: RequestOptions<B> = {}
): Promise<T> {
  const { method = 'GET', body, token, headers = {}, skipJson = false } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body as any);
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);

  // No content
  if (res.status === 204 || skipJson) {
    // Return undefined as any for void responses
    return undefined as any as T;
  }

  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (e) {
    // If parsing fails, fall back to raw text
    data = text;
  }

  if (!res.ok) {
    const message = (data && data.error) || `API Error: ${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
