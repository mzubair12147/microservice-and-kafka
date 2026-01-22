import {
    Body,
    Controller,
    Get,
    Headers,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/register')
    async register(@Body() body: RegisterDto) {
        return await this.authService.register(body);
    }

    @Post('/register')
    async login(@Body() body: LoginDto) {
        return await this.authService.login(body);
    }

    @Get('profile')
    async getProfile(@Headers("authorization") authorization: string) {
        return await this.authService.getProfile(authorization);
    }
}
