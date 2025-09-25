import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notificationService } from '@/services/notificationService';

const DEFAULT_LIMIT = 20;
const DEFAULT_POLL_MS = 30000; // 30s

export const useNotifications = ({ pageSize = DEFAULT_LIMIT, pollMs = DEFAULT_POLL_MS } = {}) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const offsetRef = useRef(0);
  const isInitialLoadedRef = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    const result = await notificationService.unreadCount();
    if (result.success) {
      setUnreadCount(result.data.count || 0);
    }
  }, []);

  const fetchPage = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const offset = reset ? 0 : offsetRef.current;
      const limit = pageSize;
      const result = await notificationService.list(offset, limit);

      if (!result.success) throw new Error(result.error || 'Failed to fetch notifications');

      const nextItems = result.data.notifications || [];
      const nextTotal = result.data.total || 0;

      setItems(prev => (reset ? nextItems : [...prev, ...nextItems]));
      setTotal(nextTotal);
      setHasMore(offset + nextItems.length < nextTotal);
      offsetRef.current = offset + nextItems.length;

      if (!isInitialLoadedRef.current) {
        isInitialLoadedRef.current = true;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const refresh = useCallback(async () => {
    offsetRef.current = 0;
    await fetchPage(true);
    await fetchUnreadCount();
  }, [fetchPage, fetchUnreadCount]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchPage(false);
  }, [fetchPage, hasMore, loading]);

  const markRead = useCallback(async (notificationId) => {
    const result = await notificationService.markRead(notificationId);
    if (result.success) {
      setItems(prev => prev.map(n => n._id === notificationId || n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return result;
  }, []);

  const markAllRead = useCallback(async () => {
    const result = await notificationService.markAllRead();
    if (result.success) {
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
    return result;
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pollMs) return;
    const id = setInterval(() => {
      fetchUnreadCount();
    }, pollMs);
    return () => clearInterval(id);
  }, [fetchUnreadCount, pollMs]);

  const state = useMemo(() => ({
    notifications: items,
    total,
    hasMore,
    unreadCount,
    loading,
    error,
  }), [error, hasMore, items, loading, total, unreadCount]);

  return {
    ...state,
    refresh,
    loadMore,
    markRead,
    markAllRead,
  };
};

