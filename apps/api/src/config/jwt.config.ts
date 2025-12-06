/**
 * JWT Configuration Utilities
 * Handles JWT secret validation and configuration
 */

/**
 * Get JWT secret with validation for production environment
 * Throws error if JWT_SECRET is not set in production
 * @returns JWT secret string
 * @throws Error if JWT_SECRET is not set in production environment
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production!');
    }
    return 'dev_only_secret';
  }
  
  return secret;
}

/**
 * Get JWT token expiration time
 * @returns JWT expiration time (default: 7 days)
 */
export function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '7d';
}
