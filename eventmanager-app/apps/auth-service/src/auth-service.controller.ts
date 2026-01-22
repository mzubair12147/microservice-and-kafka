import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { LoginDto, RegisterDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Post('register')
  async registerUser(@Body() body: RegisterDto){
    return await this.authServiceService.register(body.email,body.name, body.password);
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    return await this.authServiceService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  async profile(@Request() req: {user: {userId: string}} ){
    console.log(req.user.userId);
    return await this.authServiceService.getProfile(req.user.userId);
  }
}
