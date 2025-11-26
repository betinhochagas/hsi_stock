import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from './guards/roles.guard';

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
    console.warn('⚠️  AVISO: JWT_SECRET não definido. Usando secret de desenvolvimento. NÃO use em produção!');
    return 'dev_secret_change_in_production_min_32_chars';
  }
  
  return secret;
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
