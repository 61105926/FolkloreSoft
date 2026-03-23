import {
  Controller, Post, Get, Body, Res, Req, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { LoginDto } from './dto/login.dto.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface AuthUser {
  id: number; email: string; nombre: string; rol: string; sucursalId: number | null;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SEVEN_DAYS_MS,
      path: '/auth',
    });
    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const rawRefreshToken = (req.cookies as Record<string, string>)?.[REFRESH_TOKEN_COOKIE];
    return this.authService.refresh(rawRefreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = (req.cookies as Record<string, string>)?.[REFRESH_TOKEN_COOKIE];
    await this.authService.logout(rawRefreshToken);
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: AuthUser }) {
    return req.user;
  }
}
