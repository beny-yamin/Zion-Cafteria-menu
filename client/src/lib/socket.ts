import { io, Socket } from 'socket.io-client';

const DEFAULT_SOCKET_URL = import.meta.env.PROD
  ? 'https://zion-cafteria-backend4.onrender.com'
  : 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_URL;

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Cafe real-time socket:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  return socketInstance;
};
