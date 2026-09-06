export const BASE_URL = 'http://127.0.0.1:8000';

export async function apiClient(endpoint, { method = 'GET', body, ...customConfig } = {}) {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...customConfig,
  };

  // POST /login üçün form-encoded
  if (endpoint === '/login' && method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if (body) {
      const params = new URLSearchParams();
      for (const key in body) {
        params.append(key, body[key]);
      }
      config.body = params.toString();
    }
  } else {
    // Digər endpointlər üçün JSON
    if (body) {
      if (body instanceof FormData) {
        config.body = body;
      } else {
        headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
      }
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login handled on caller side or by router usually, 
      // but if we want hard redirect:
      window.location.href = '/login'; 
      throw new Error('Unauthorized');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Backend message error handling
      let errorMessage = 'Something went wrong';
      if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMessage = data.detail[0]?.msg || 'Validation error';
      } else if (data?.message) {
        errorMessage = data.message;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}
