import { useDispatch } from 'react-redux';
import { setLogin, setLogout, updateUser as updateAuthRedux } from '../store/slices/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role || 'customer');
        dispatch(setLogin({ user: parsedUser, token }));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setLoading(false);
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/auth/login', { email, password });
      const { user: userData, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setRole(userData.role);
      dispatch(setLogin({ user: userData, token }));
      
      return { success: true, role: userData.role };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/auth/logout');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setRole(null);
      dispatch(setLogout());
    }
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
    dispatch(updateAuthRedux(data));
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, register: async (d) => api.post('/auth/auth/register', d), verifyOtp: async (e, o) => api.post('/auth/auth/verifyUserOtp', { email: e, otp: o }), login, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
