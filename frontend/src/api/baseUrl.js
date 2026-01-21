// Centralized API base URL for the MinorKrishi frontend
// Deployed backend on Render
export const BASE_URL = 'https://krishikarobar-farmercustomer-marketplace-lc3i.onrender.com';

// Helper to build full API URLs
export const apiUrl = (path) => `${BASE_URL}${path}`;
