import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Get()
  getHello(): string {
    return this.authServiceService.getHello();
  }

  @Post('register')
  async registerUser(@Body("email") email: string){
    return await this.authServiceService.simulateRegistration(email);
  }
}
