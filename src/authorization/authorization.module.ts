import { Module } from '@nestjs/common';
import { Auth0JwtService } from './providers/auth0/auth0-jwt.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [Auth0JwtService],
  exports: [Auth0JwtService],
})
export class AuthorizationModule {}
