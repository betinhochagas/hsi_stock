import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// Função para validar e obter JWT_SECRET
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  // Em produção, JWT_SECRET é obrigatório
  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      throw new Error('JWT_SECRET é obrigatório em ambiente de produção');
    }
    if (secret.length < 32) {
      throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres para segurança adequada');
    }
  }
  
  // Em desenvolvimento, usa fallback com aviso
  if (!secret) {
    return 'dev_secret_change_in_production_min_32_chars';
  }
  
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
