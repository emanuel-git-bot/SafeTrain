export const API_URL = 'http://localhost:3333';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jwt_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'GET' }).then(data => ({ data })),
  post: (endpoint: string, data: any, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }).then(res => ({ data: res })),
  put: (endpoint: string, data: any, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }).then(res => ({ data: res })),
  delete: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'DELETE' }).then(res => ({ data: res }))
};
