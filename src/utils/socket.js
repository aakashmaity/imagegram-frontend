'use client';

import { io } from 'socket.io-client';
import { getAuthToken, isTokenValid, getCurrentUser } from '@/utils/auth';

let socketInstance = null;
let isInitialized = false;

const getSocketServerUrl = () => {
  // Prefer explicit socket URL, else derive from API URL
  const explicit = process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL;
  if (explicit) return explicit;

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api/v1';
  try {
    const url = new URL(apiUrl);
    // Strip path like /api/v1 to get origin
    return `${url.protocol}//${url.host}`;
  } catch {
    // Fallback to localhost
    return 'http://localhost:8000';
  }
};

export const getSocket = () => {
  if (socketInstance && isInitialized) return socketInstance;

  const serverUrl = getSocketServerUrl();
  const token = getAuthToken();

  socketInstance = io(serverUrl, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: false,
    extraHeaders: token && isTokenValid(token) ? { Authorization: `${token}` } : {},
  });

  // Ensure single initialization
  if (!isInitialized) {
    socketInstance.on('connect', () => {
      const user = getCurrentUser();
      const userId = user?._id || user?.id;
      if (userId) {
        socketInstance.emit('registerUser', userId);
      }
    });

    socketInstance.on('disconnect', () => {
      // No-op; rely on automatic reconnection
    });

    isInitialized = true;
  }

  // Only connect when in browser
  if (typeof window !== 'undefined' && !socketInstance.connected) {
    try {
      socketInstance.connect();
    } catch {}
  }

  return socketInstance;
};

export const onSocketEvent = (eventName, handler) => {
  const sock = getSocket();
  sock.on(eventName, handler);
  return () => sock.off(eventName, handler);
};

export const emitSocketEvent = (eventName, payload) => {
  const sock = getSocket();
  sock.emit(eventName, payload);
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
};