import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { authAtom } from '../atoms/auth.atom';
import { logIn as apiLogIn, registerUser as apiRegister, logOut as apiLogout } from '../api/auth.api';

/**
 * Hook for authentication state and management
 */
export const useAuth = () => {
    const [auth, setAuth] = useRecoilState(authAtom);
    const navigate = useNavigate();

    const login = async (credentials) => {
        try {
            const response = await apiLogIn(credentials);


            const { user, accessToken, refreshToken } = response.data;
            updateAuthState(user, accessToken, refreshToken);
            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    const register = async (data) => {
        try {
            const response = await apiRegister(data);
            const { user, accessToken, refreshToken } = response.data;
            updateAuthState(user, accessToken, refreshToken);
        } catch (error) {
            throw error;
        }
    };



    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await apiLogout({ refreshToken });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.clear();
            setAuth({ user: null, accessToken: null, role: null, isAuthenticated: false });
            navigate('/login');
        }
    };

    const updateAuthState = (user, accessToken, refreshToken) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setAuth({
            user,
            accessToken,
            role: user.role,
            isAuthenticated: true
        });
    };

    return { auth, login, register, logout };
};
