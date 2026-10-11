import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { RegisterDto } from './dto/register/register.js';
import { LoginDto } from './dto/login/login.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { JwtPayload } from './jwt-payload.interface.js';
import { ChangePasswordDto } from './dto/change-password/change-password.js';

@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) { }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authSvc.register(dto)
  };

  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authSvc.login(dto)
  };


  @ApiBearerAuth()
  @Patch('changePassword')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.authSvc.changePassword(user, dto);
  };


  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authSvc.me(user.sub);
  };
}
