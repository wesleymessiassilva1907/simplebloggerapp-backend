import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ThrottleGuard } from '@/common/guards/throttle.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(new ThrottleGuard(5, 60000))
  @ApiOperation({ summary: 'User login' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register-initial-tenant-admin')
  @UseGuards(new ThrottleGuard(5, 60000))
  @ApiOperation({ summary: 'Register a new tenant with admin user' })
  async registerTenantAdmin(@Body() dto: RegisterTenantDto) {
    return this.authService.registerInitialTenantAdmin(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.sub);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user.sub);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
