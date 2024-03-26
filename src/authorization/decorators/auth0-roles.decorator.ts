import { Reflector } from '@nestjs/core';
import { Role } from 'src/authorization/dto/user-info.dto';

export const Auth0Roles = Reflector.createDecorator<Role[]>();
