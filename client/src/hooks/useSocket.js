import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../atoms/auth.atom';

/**
 * Hook for Socket.io management
 */
export const useSocket = () => {
    const auth = useRecoilValue(authAtom);
    const socketRef = useRef(null);

    useEffect(() => {
        if (auth.isAuthenticated && auth.accessToken) {
            socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
                auth: { token: auth.accessToken }
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [auth.isAuthenticated, auth.accessToken]);

    const emit = (event, data) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    };

    const on = (event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    };

    const off = (event) => {
        if (socketRef.current) {
            socketRef.current.off(event);
        }
    };

    return { socket: socketRef.current, emit, on, off };
};
