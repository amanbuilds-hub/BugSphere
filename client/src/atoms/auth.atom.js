import { atom } from 'recoil';

export const authAtom = atom({
    key: 'authAtom',
    default: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        accessToken: localStorage.getItem('accessToken') || null,
        role: (JSON.parse(localStorage.getItem('user'))?.role) || null,
        isAuthenticated: !!localStorage.getItem('accessToken')
    },
});
