import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { AUTH0_ROLES_KEY } from 'src/authorization/decorators/auth0-roles.decorator';
import { IS_PUBLIC } from 'src/authorization/decorators/public.decorator';
import { Role } from 'src/authorization/dto/user-info.dto';

@Injectable()
export class Auth0RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);

    return true;

    // if (isPublic) return true;

    // const requiredRoles = this.reflector.getAllAndOverride<Role[]>(AUTH0_ROLES_KEY, [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);
    // if (!requiredRoles) {
    //   return true;
    // }
    // const request = context.switchToHttp().getRequest<FastifyRequest>();
    // const user = request.user;

    // if (!user) {
    //   return false;
    // }

    // return this.matchRoles(requiredRoles, user['cp23pl1/roles']);
  }

  private matchRoles(roles: string[], userRoles: string[]): boolean {
    return roles.some((role) => userRoles.includes(role));
  }
}
