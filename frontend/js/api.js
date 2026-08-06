export async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
    redirect: 'manual',
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data && data.error_code;
    err.data = data;
    throw err;
  }
  return data;
}

export const apiGet = (url) => request('GET', url);
export const apiPost = (url, body) => request('POST', url, body);
export const apiPatch = (url, body) => request('PATCH', url, body);

export async function apiSession() {
  try {
    const data = await apiGet('/api/auth/session');
    return data && data.authenticated ? data : null;
  } catch {
    return null;
  }
}

export async function apiLogout() {
  try {
    await apiPost('/api/auth/logout');
  } catch {
    // ignore — we clear client state regardless
  }
}

export function redirectTo(url) {
  window.location.assign(url);
}
