import { Body, Controller, HttpCode, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) { return this.auth.register(dto, res); }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) { return this.auth.login(dto, res); }

  @HttpCode(200)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) { return this.auth.logout(res); }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(200)
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto); }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Patch('reset-password/:token')
  reset(@Param('token') token: string, @Body() dto: ResetPasswordDto) { return this.auth.resetPassword(token, dto); }
}
