import axiosInstance from './client';

export const notificationsApi = {
  // List notifications for the authenticated user
  list: (offset = 0, limit = 20) =>
    axiosInstance.get(`/notifications?offset=${offset}&limit=${limit}`),

  // Mark a single notification as read
  markRead: (notificationId) =>
    axiosInstance.put(`/notifications/${notificationId}/read`),

  // Mark all notifications as read
  markAllRead: () => axiosInstance.put(`/notifications/read-all`),

  // Get unread notifications count
  unreadCount: () => axiosInstance.get(`/notifications/unread-count`),
};

