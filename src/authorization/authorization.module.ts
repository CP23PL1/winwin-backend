import { Module } from '@nestjs/common';
import { Auth0JwtStrategy } from './auth0-jwt.strategy';

@Module({
  providers: [Auth0JwtStrategy],
})
export class AuthorizationModule {}
