// Utility functions for the frontend

/**
 * Get user initials for avatar fallback.
 * @param {Object} user - User object with first_name, last_name.
 * @returns {string} Initials (e.g., "AB" or "A" or "?")
 */
export function getUserInitials(user) {
  if (!user) return '?';
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  let initials = '';
  if (firstName) initials += firstName.charAt(0).toUpperCase();
  if (lastName) initials += lastName.charAt(0).toUpperCase();
  return initials || '?';
} 