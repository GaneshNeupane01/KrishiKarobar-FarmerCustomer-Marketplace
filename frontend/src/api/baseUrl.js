// Centralized API base URL for the MinorKrishi frontend
export const BASE_URL = 'http://localhost:8000';

// Helper to build full API URLs
export const apiUrl = (path) => `${BASE_URL}${path}`;
