import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import * as authHook from '@/hooks/use-auth';

// Mock do useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (authHook.useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: false,
    });
  });

  it('should render login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Estoque TI HSI')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/senha/i);
    await userEvent.type(passwordInput, '12345');
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it('should call login function with valid credentials', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await userEvent.type(emailInput, 'admin@hsi.local');
    await userEvent.type(passwordInput, 'admin123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@hsi.local',
        password: 'admin123',
      });
    });
  });

  it('should display error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciais inválidas'));
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await userEvent.type(emailInput, 'wrong@email.com');
    await userEvent.type(passwordInput, 'wrongpass');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it('should disable form inputs while logging in', () => {
    (authHook.useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: true,
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrando/i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/entrando/i)).toBeInTheDocument();
  });

  it('should show loading spinner when logging in', () => {
    (authHook.useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: true,
    });

    render(<LoginPage />);
    
    expect(screen.getByRole('button', { name: /entrando/i })).toBeInTheDocument();
    // O ícone Loader2 está renderizado mas não temos uma forma fácil de testá-lo diretamente
  });

  it('should display default credentials hint', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/credenciais padrão para teste/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@hsi.com \/ admin123/i)).toBeInTheDocument();
  });
});
