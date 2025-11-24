import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService, LoginResponse, UserPayload } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

class LoginDto {
  email: string;
  password: string;
}

interface AuthenticatedRequest {
  user: UserPayload;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiBody({ type: LoginDto })
  async login(@Request() req: AuthenticatedRequest): Promise<LoginResponse> {
    return this.authService.login(req.user);
  }
}
