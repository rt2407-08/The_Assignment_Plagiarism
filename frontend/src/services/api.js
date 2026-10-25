
const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function getData(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch data');
  }

  return data;
}

export async function getAssignments(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.instructorId) searchParams.append('instructorId', params.instructorId);
  if (params.instructorEmail) searchParams.append('instructorEmail', params.instructorEmail);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const data = await getData(`/assignments${query}`);
  return data.assignments || [];
}

export async function getSubmissions() {
  const data = await getData('/submissions');
  return data.submissions || [];
}

export async function getSimilarityReports() {
  const data = await getData('/similarity-reports');
  return data.reports || [];
}

export async function createAssignment(assignmentData) {
  const response = await fetch(`${API_BASE_URL}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignmentData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create assignment');
  }
  return data.assignment;
}

export async function deleteAssignment(id) {
  const response = await fetch(`${API_BASE_URL}/assignments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete assignment');
  }
  return data;
}
