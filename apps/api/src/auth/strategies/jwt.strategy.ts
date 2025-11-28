import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

interface ValidatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change_me_in_production',
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
