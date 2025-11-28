import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; statusCode: number }>) => {
    // Redirecionar para login se 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Extrair mensagem de erro
    const message = error.response?.data?.message || 'Erro ao processar requisição';
    return Promise.reject(new Error(message));
  }
);

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Utilitário para requisições
export async function fetcher<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

// Utilitário para download de arquivos
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await api.get(url, {
    responseType: 'blob',
  });
  
  // Criar URL do blob
  const blob = new Blob([response.data]);
  const blobUrl = window.URL.createObjectURL(blob);
  
  // Criar link temporário e clicar
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Limpar
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export default api;
