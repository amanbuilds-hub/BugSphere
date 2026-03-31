import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';
import { uiAtom } from '../atoms/ui.atom';
import { getNotifications, markAllAsRead, markAsRead } from '../api/notifications.api';
import { useSocket } from './useSocket';

/**
 * Hook for notifications management
 */
export const useNotifications = () => {
    const [ui, setUi] = useRecoilState(uiAtom);
    const queryClient = useQueryClient();
    const { on } = useSocket();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        onSuccess: (res) => {
            setUi(prev => ({
                ...prev,
                notifications: res.data,
                unreadCount: res.unreadCount
            }));
        }
    });

    const readAllMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const readMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    // Listen for real-time notifications
    useEffect(() => {
        on('notification:new', (notification) => {
            queryClient.invalidateQueries(['notifications']);
            // Optional: Play sound or show toast
        });

        return () => {
            // socket.off('notification:new')
        };
    }, [on, queryClient]);

    return { notifications: ui.notifications, unreadCount: ui.unreadCount, isLoading, refetch, readAllMutation, readMutation };
};
