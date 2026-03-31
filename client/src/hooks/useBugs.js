import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';
import { bugsAtom } from '../atoms/bugs.atom';
import { getBugs, getBug, createBug, updateBugStatus, assignBug, addComment } from '../api/bugs.api';

/**
 * Hook for bug-related queries and mutations
 */
export const useBugs = (id = null) => {
    const [bugs, setBugs] = useRecoilState(bugsAtom);
    const queryClient = useQueryClient();

    // List Bugs
    const { data: bugList, isLoading: loadingList, refetch: refetchBugs } = useQuery({
        queryKey: ['bugs', bugs.filters],
        queryFn: () => getBugs(bugs.filters),
        enabled: !id,
        onSuccess: (data) => {
            setBugs(prev => ({
                ...prev,
                list: data.data,
                pagination: data.pagination
            }));
        }
    });

    // Single Bug
    const { data: bugDetail, isLoading: loadingDetail } = useQuery({
        queryKey: ['bug', id],
        queryFn: () => getBug(id),
        enabled: !!id
    });

    // Create Bug
    const createMutation = useMutation({
        mutationFn: createBug,
        onSuccess: () => {
            queryClient.invalidateQueries(['bugs']);
        }
    });

    // Update Status
    const statusMutation = useMutation({
        mutationFn: (data) => updateBugStatus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['bug', id]);
            queryClient.invalidateQueries(['bugs']);
        }
    });

    // Assign Bug
    const assignMutation = useMutation({
        mutationFn: (data) => assignBug(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['bug', id]);
            queryClient.invalidateQueries(['bugs']);
        }
    });

    // Comment on Bug
    const commentMutation = useMutation({
        mutationFn: (data) => addComment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['bug', id]);
        }
    });

    return {
        bugList, loadingList, refetchBugs,
        bugDetail, loadingDetail,
        createMutation, statusMutation, assignMutation, commentMutation
    };
};
