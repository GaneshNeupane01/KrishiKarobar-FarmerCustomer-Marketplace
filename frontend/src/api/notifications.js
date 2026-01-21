export async function fetchNotifications() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/notifications/', {
    headers: token ? { 'Authorization': 'Token ' + token } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(id) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/notifications/mark_read/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Token ' + token } : {}),
    },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function clearNotification(id) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/notifications/clear/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Token ' + token } : {}),
    },
    body: JSON.stringify({ id }),
  });
  return res.json();
} 