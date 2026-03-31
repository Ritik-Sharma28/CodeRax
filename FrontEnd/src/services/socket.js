import { io } from 'socket.io-client';
import { getApiBaseUrl } from './apiBaseUrl';

const API_URL = getApiBaseUrl();

export const socket = io(API_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});
