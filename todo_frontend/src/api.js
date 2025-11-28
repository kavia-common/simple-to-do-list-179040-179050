const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Helper to handle JSON responses and errors.
 */
async function handleResponse(resp) {
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    const error = new Error(`API Error ${resp.status}: ${text || resp.statusText}`);
    error.status = resp.status;
    error.body = text;
    throw error;
  }
  // Some endpoints may return no content
  const contentType = resp.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  return resp.json();
}

// PUBLIC_INTERFACE
export async function fetchTodos() {
  /** Fetch all todos from the backend. Returns an array of todos. */
  const resp = await fetch(`${API_BASE_URL}/todos`, { headers: { 'Accept': 'application/json' } });
  const data = await handleResponse(resp);
  return Array.isArray(data) ? data : [];
}

// PUBLIC_INTERFACE
export async function addTodo(title) {
  /** Create a new todo with given title. Returns created todo. */
  const resp = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ title })
  });
  return handleResponse(resp);
}

// PUBLIC_INTERFACE
export async function updateTodo(id, updates) {
  /** Update a todo by id with provided fields (e.g., {title}). Returns updated todo. */
  const resp = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(updates)
  });
  return handleResponse(resp);
}

// PUBLIC_INTERFACE
export async function toggleTodo(id) {
  /** Toggle completion state of a todo by id. Returns updated todo. */
  const resp = await fetch(`${API_BASE_URL}/todos/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(resp);
}

// PUBLIC_INTERFACE
export async function deleteTodo(id) {
  /** Delete a todo by id. Returns success status or empty. */
  const resp = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });
  // Some backends return 204 No Content
  try {
    return await handleResponse(resp);
  } catch (e) {
    if (e.status === 204) return null;
    throw e;
  }
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Expose the resolved API base URL for UI display or debugging. */
  return API_BASE_URL;
}
