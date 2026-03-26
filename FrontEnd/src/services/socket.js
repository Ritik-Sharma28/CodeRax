import { io } from 'socket.io-client';

const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_URL = import.meta.env.VITE_API_URL || (host === 'localhost' ? 'http://localhost:3000' : `http://${host}:3000`);

export const socket = io(API_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});
