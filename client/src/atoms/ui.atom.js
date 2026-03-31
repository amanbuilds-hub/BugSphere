import { atom } from 'recoil';

export const uiAtom = atom({
    key: 'uiAtom',
    default: {
        theme: localStorage.getItem('theme') || 'light',
        sidebarOpen: true,
        notifications: [],
        unreadCount: 0
    },
});
