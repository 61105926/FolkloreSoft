import type { Response, Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<{
        accessToken: string;
    }>;
    refresh(req: Request): Promise<{
        accessToken: string;
    }>;
    logout(req: Request, res: Response): Promise<void>;
}
