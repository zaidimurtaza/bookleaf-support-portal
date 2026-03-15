const BASE_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("bookleaf_token");
}

function getHeaders(includeAuth = true) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json.detail || json.error || json.message || text;
    } catch {}
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function getBooks() {
  const res = await fetch(`${BASE_URL}/books`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getTickets(filters) {
  const params = new URLSearchParams(filters || {});
  const url = `${BASE_URL}/tickets${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getTicketDetail(ticketId) {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createTicket(data) {
  const res = await fetch(`${BASE_URL}/tickets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function addResponse(ticketId, message, isInternal = false) {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}/responses`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ message, is_internal: isInternal }),
  });
  return handleResponse(res);
}

export async function getAiDraft(ticketId) {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}/ai-draft`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function updateTicket(ticketId, updates) {
  const params = new URLSearchParams(updates);
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}?${params}`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function getTicketStats() {
  const res = await fetch(`${BASE_URL}/tickets/stats`, { headers: getHeaders() });
  return handleResponse(res);
}
