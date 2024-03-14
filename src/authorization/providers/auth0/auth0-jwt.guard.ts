import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../../decorators/public.decorator';
import { Auth0JwtService } from './auth0-jwt.service';
import { Socket } from 'socket.io';

@Injectable()
export class Auth0JwtGuard implements CanActivate {
  constructor(private reflector: Reflector, private auth0JwtService: Auth0JwtService) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, we can return true immediately
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    if (!request.headers?.authorization) {
      throw new UnauthorizedException('You must provide a valid bearer token');
    }

    const [type, token] = request.headers?.authorization?.split(' ');

    if (type.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('You must provide a valid bearer token');
    }

    if (!token) {
      throw new UnauthorizedException(
        'You must provide a valid JWT token in the authorization header',
      );
    }

    try {
      await this.auth0JwtService.verify(token);
      const user = await this.auth0JwtService.getUserInfo(token);
      request.user = user;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
