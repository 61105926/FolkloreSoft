"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const users_service_js_1 = require("../users/users.service.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    usersService;
    jwtService;
    prisma;
    constructor(usersService, jwtService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = this.generateAccessToken(user.id, user.email, user.rol, user.sucursalId ?? null);
        const refreshToken = await this.generateAndStoreRefreshToken(user.id);
        return { accessToken, refreshToken };
    }
    async refresh(rawRefreshToken) {
        if (!rawRefreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not provided');
        }
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: rawRefreshToken },
            include: { user: true },
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (tokenRecord.expiresAt < new Date()) {
            await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const accessToken = this.generateAccessToken(tokenRecord.user.id, tokenRecord.user.email, tokenRecord.user.rol, tokenRecord.user.sucursalId ?? null);
        return { accessToken };
    }
    async logout(rawRefreshToken) {
        if (!rawRefreshToken)
            return;
        await this.prisma.refreshToken.deleteMany({
            where: { token: rawRefreshToken },
        });
    }
    generateAccessToken(userId, email, rol, sucursalId) {
        return this.jwtService.sign({ sub: userId, email, rol, sucursalId });
    }
    async generateAndStoreRefreshToken(userId) {
        const token = (0, crypto_1.randomBytes)(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: { token, userId, expiresAt },
        });
        return token;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_js_1.UsersService,
        jwt_1.JwtService,
        prisma_service_js_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map