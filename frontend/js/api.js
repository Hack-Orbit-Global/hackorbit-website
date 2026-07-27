export async function apiCall(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        error_code: data.error_code || 'API_ERROR',
        message: data.message || 'Something went wrong',
      };
    }
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error_code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
    };
  }
}
