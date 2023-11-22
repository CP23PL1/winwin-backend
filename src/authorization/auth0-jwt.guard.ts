import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC } from './public.decorator';
import { AUTH0_STRATEGY_NAME } from './auth0-jwt.strategy';

@Injectable()
export class Auth0JwtGuard extends AuthGuard(AUTH0_STRATEGY_NAME) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    // If the route is public, we can return true immediately
    if (isPublic) return true;

    return super.canActivate(context);
  }
}
