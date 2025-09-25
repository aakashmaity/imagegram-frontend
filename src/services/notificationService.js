import { notificationsApi } from '@/api/notifications';

export const notificationService = {
  async list(offset = 0, limit = 20) {
    try {
      const response = await notificationsApi.list(offset, limit);
      const data = response?.data ?? {};
      // Support either { notifications, total } or raw array
      const notifications = Array.isArray(data)
        ? data
        : data.notifications || data.items || [];
      const total = Array.isArray(data)
        ? notifications.length
        : data.total ?? notifications.length;
      return { success: true, data: { notifications, total } };
    } catch (error) {
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },

  async markRead(notificationId) {
    try {
      await notificationsApi.markRead(notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },

  async markAllRead() {
    try {
      await notificationsApi.markAllRead();
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },

  async unreadCount() {
    try {
      const response = await notificationsApi.unreadCount();
      const count = response?.data?.count ?? response?.data ?? 0;
      return { success: true, data: { count } };
    } catch (error) {
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },
};

