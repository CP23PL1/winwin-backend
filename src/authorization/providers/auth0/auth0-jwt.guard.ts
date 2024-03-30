import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../../decorators/public.decorator';
import { Auth0JwtService } from './auth0-jwt.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class Auth0JwtGuard implements CanActivate {
  private readonly logger = new Logger(Auth0JwtGuard.name);

  constructor(
    private reflector: Reflector,
    private auth0JwtService: Auth0JwtService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

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
      const valid = await this.auth0JwtService.verify(token);
      if (!valid) {
        throw new UnauthorizedException();
      }
      const decoded = this.auth0JwtService.decode(token);
      const cachedUserInfo = await this.cacheManager.get(decoded.sub);
      if (cachedUserInfo) {
        this.logger.debug('User info retrieved from cache');
        request.user = cachedUserInfo;
      } else {
        const user = await this.auth0JwtService.getUserInfo(token);
        request.user = user;
        await this.cacheManager.set(decoded.sub, user, 3600);
      }
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
