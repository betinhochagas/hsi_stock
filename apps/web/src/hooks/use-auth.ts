'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { LoginResponse } from '@/types/entities';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success(`Bem-vindo, ${data.user.name}!`);
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao fazer login');
    },
  });

  const logout = () => {
    clearAuth();
    router.push('/login');
    toast.success('Logout realizado com sucesso');
  };

  return {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
