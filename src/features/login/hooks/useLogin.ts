import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { toast as sonnerToast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setSessionData = useUserStore((state) => state.setSessionData);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session && data.user) {
        // Here you would typically fetch additional user data (like locations) from your database
        // For now, we'll just set the basic session data.
        // You might need to adjust this based on your actual data structure requirements.
        
        // Mocking location data for now as per the store structure, 
        // or you should fetch it from a 'users' or 'user_locations' table.
        const mockLocations = [
            {
                id: 1,
                name: "Main Workshop",
                type: "workshop",
                city: "Bogota",
                address: "Calle 123",
                role: { id: "1", name: "admin", permissions: { all: true } },
                is_active: true,
                joined_at: new Date().toISOString()
            }
        ];

        setSessionData({
          user: {
            id: data.user.id,
            email: data.user.email!,
            locations: mockLocations
          },
          locations: mockLocations
        });
        
        sonnerToast.success('Bienvenido de nuevo');
      }
    } catch (error: any) {
      sonnerToast.error(error.message || 'Error al iniciar sesión');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    debugger
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearUser();
      sonnerToast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error: any) {
      sonnerToast.error(error.message || 'Error al cerrar sesión');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
  };
};
