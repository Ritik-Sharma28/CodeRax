import { io } from 'socket.io-client';
import { getSocketConfig } from './apiBaseUrl';

const { url: SOCKET_URL, path: SOCKET_PATH } = getSocketConfig();

export const socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});

let desiredUserId = null;
let desiredRoomId = null;

// Track what was last sent to avoid duplicate emits
let lastSentUserId = null;
let lastSentRoomId = null;

// Reference-counting: tracks how many components are holding the session.
let sessionRefCount = 0;
let disconnectGraceTimer = null;
const DISCONNECT_GRACE_MS = 3000;

const syncDesiredSocketState = (force = false) => {
  if (!socket.connected) return;

  if (desiredUserId && (force || desiredUserId !== lastSentUserId)) {
    socket.emit('authenticate', desiredUserId);
    lastSentUserId = desiredUserId;
  }

  if (desiredRoomId && (force || desiredRoomId !== lastSentRoomId)) {
    socket.emit('joinRoom', desiredRoomId);
    lastSentRoomId = desiredRoomId;
  }

  // If room was cleared, reset tracking so re-joining the same room later works
  if (!desiredRoomId) {
    lastSentRoomId = null;
  }
};

// On reconnect, force re-emit everything (server lost our state)
socket.on('connect', () => {
  lastSentUserId = null;
  lastSentRoomId = null;
  syncDesiredSocketState(true);
});

/**
 * Acquire a socket session. Call this when a component mounts.
 */
export const syncSocketSession = ({ userId, roomId } = {}) => {
  if (disconnectGraceTimer) {
    clearTimeout(disconnectGraceTimer);
    disconnectGraceTimer = null;
  }

  sessionRefCount++;

  if (typeof userId !== 'undefined') {
    desiredUserId = userId || null;
  }
  if (typeof roomId !== 'undefined') {
    desiredRoomId = roomId || null;
  }

  if (!socket.connected) {
    socket.connect();
    return;
  }

  syncDesiredSocketState();
};

/**
 * Update room/user without changing the ref count.
 */
export const updateSocketSession = ({ userId, roomId } = {}) => {
  if (typeof userId !== 'undefined') {
    desiredUserId = userId || null;
  }
  if (typeof roomId !== 'undefined') {
    desiredRoomId = roomId || null;
  }

  if (!socket.connected) {
    socket.connect();
    return;
  }

  syncDesiredSocketState();
};

/**
 * Release one consumer's hold. Socket disconnects after grace period
 * when all consumers release.
 */
export const disconnectSocketSession = () => {
  sessionRefCount = Math.max(0, sessionRefCount - 1);

  if (sessionRefCount > 0) return;

  disconnectGraceTimer = setTimeout(() => {
    disconnectGraceTimer = null;

    if (sessionRefCount > 0) return;

    desiredUserId = null;
    desiredRoomId = null;
    lastSentUserId = null;
    lastSentRoomId = null;

    if (socket.connected) {
      socket.disconnect();
    }
  }, DISCONNECT_GRACE_MS);
};
