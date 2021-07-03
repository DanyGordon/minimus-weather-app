import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

import { AuthenticationService } from '../services/authentication.service';

@Controller('auth')
export class AuthenticationController {

  constructor(private readonly authService: AuthenticationService) { }
  
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) response: Response): Promise<{ status: string, uid: string }> {
    const result = await this.authService.login(req.user);
    response.cookie('jwt_token', result.access_token, {
      expires: new Date(Date.now() + 16 * 3600000),
      domain: 'localhost.com',
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
    });
    response.setHeader('withCredentials', 'true');
    return { status: 'Success', uid: result.id };
  }

  @Get('verify')
  async isValidToken(@Req() request: Request): Promise<{ uid?: string, status: boolean }> {
    return await this.authService.checkingJWT(request.cookies['jwt_token'] || request.headers.cookies);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response): Promise<{ status: string, success: boolean }> {
    response.clearCookie('jwt_token');
    return { status: 'Success', success: true };
  }

}