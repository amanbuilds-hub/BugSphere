import { atom } from 'recoil';

export const bugsAtom = atom({
    key: 'bugsAtom',
    default: {
        list: [],
        pagination: { page: 1, total: 0, pages: 1 },
        loading: false,
        filters: {
            status: '',
            priority: '',
            assignee: '',
            project: '',
            search: '',
            page: 1,
            sort: '-createdAt'
        }
    },
});
