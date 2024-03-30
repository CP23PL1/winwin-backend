import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/authorization/dto/user-info.dto';

export const AUTH0_ROLES_KEY = 'auth0-roles';
export const Auth0Roles = (...roles: Role[]) => SetMetadata(AUTH0_ROLES_KEY, roles);
