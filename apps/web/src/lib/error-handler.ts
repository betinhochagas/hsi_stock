import { AxiosError } from 'axios'

/**
 * Extrai mensagem de erro de uma resposta da API
 * 
 * Prioridade de extração:
 * 1. error.response.data.message (mensagem específica da API)
 * 2. error.response.data.error (mensagem genérica)
 * 3. error.message (mensagem do Axios/Network)
 * 4. Fallback genérico
 */
export function extractErrorMessage(error: unknown, fallback: string = 'Erro desconhecido'): string {
  if (error instanceof AxiosError) {
    // Erro da API com mensagem específica
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    
    // Erro da API com mensagem genérica
    if (error.response?.data?.error) {
      return error.response.data.error
    }
    
    // Erro de rede ou timeout
    if (error.message) {
      return error.message
    }
  }
  
  // Outros tipos de erro
  if (error instanceof Error) {
    return error.message
  }
  
  // Fallback
  return fallback
}

/**
 * Extrai código de status HTTP de um erro
 */
export function extractErrorStatus(error: unknown): number | null {
  if (error instanceof AxiosError) {
    return error.response?.status || null
  }
  return null
}

/**
 * Verifica se é um erro de conflito (409)
 */
export function isConflictError(error: unknown): boolean {
  return extractErrorStatus(error) === 409
}

/**
 * Verifica se é um erro de validação (400)
 */
export function isValidationError(error: unknown): boolean {
  return extractErrorStatus(error) === 400
}

/**
 * Verifica se é um erro de não autorizado (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  return extractErrorStatus(error) === 401
}

/**
 * Verifica se é um erro de não encontrado (404)
 */
export function isNotFoundError(error: unknown): boolean {
  return extractErrorStatus(error) === 404
}
