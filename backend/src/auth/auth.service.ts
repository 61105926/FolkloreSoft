import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.id, user.email, user.rol, user.sucursalId ?? null);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async refresh(rawRefreshToken: string): Promise<{ accessToken: string }> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: rawRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!tokenRecord.user.activo) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const accessToken = this.generateAccessToken(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.rol,
      (tokenRecord.user as any).sucursalId ?? null,
    );

    return { accessToken };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) return;
    await this.prisma.refreshToken.deleteMany({
      where: { token: rawRefreshToken },
    });
  }

  private generateAccessToken(userId: number, email: string, rol: string, sucursalId: number | null): string {
    return this.jwtService.sign({ sub: userId, email, rol, sucursalId });
  }

  private async generateAndStoreRefreshToken(userId: number): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }
}
