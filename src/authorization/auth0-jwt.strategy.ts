import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  azp: string;
  gty: string;
};

export const AUTH0_STRATEGY_NAME = 'auth0-jwt';

@Injectable()
export class Auth0JwtStrategy extends PassportStrategy(Strategy, AUTH0_STRATEGY_NAME) {
  constructor(configService: ConfigService) {
    const AUTH0_DOMAIN = configService.get<string>('AUTH0_DOMAIN');
    const AUTH0_AUDIENCE = configService.get<string>('AUTH0_AUDIENCE');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `${AUTH0_DOMAIN}.well-known/jwks.json`,
        jwksRequestsPerMinute: 5,
        cache: true,
        rateLimit: true,
      }),
      audience: AUTH0_AUDIENCE,
      issuer: AUTH0_DOMAIN,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
