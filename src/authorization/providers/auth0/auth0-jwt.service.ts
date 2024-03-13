import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import JwksRsa, { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { UserInfoDto } from 'src/authorization/dto/user-info.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtPayload } from 'src/authorization/dto/jwt-payload.dto';

@Injectable()
export class Auth0JwtService {
  private readonly logger = new Logger(Auth0JwtService.name);
  private client: JwksClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    const jwksUri = `${AUTH0_DOMAIN}.well-known/jwks.json`;
    this.client = new JwksClient({
      jwksUri,
      jwksRequestsPerMinute: 5,
      cache: true,
      rateLimit: true,
    });
  }

  async verify(token: string): Promise<boolean> {
    const { header } = jwt.decode(token, { complete: true });
    let key: JwksRsa.SigningKey | null = null;
    try {
      this.logger.debug(`Verifying token with kid: ${header.kid}`);
      key = await this.client.getSigningKey(header.kid);
    } catch (error: any) {
      this.logger.error(
        'An error occurred verifying the bearer token with the associated public key',
      );
      this.logger.error(error.stack);
      return false;
    }
    const publicKey = key.getPublicKey();

    try {
      jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    } catch (error: any) {
      this.logger.error(
        'An error occurred verifying the bearer token with the associated public key',
      );
      this.logger.error(error.stack);
      throw new ForbiddenException(error.message);
    }

    return true;
  }

  decode(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload;
  }

  async getUserInfo(token: string): Promise<UserInfoDto> {
    const url = `${this.configService.get<string>('AUTH0_DOMAIN')}userinfo`;
    const { data } = await firstValueFrom(
      this.httpService
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new ForbiddenException(error.response.data);
          }),
        ),
    );
    const [connection, user_id] = data.sub.split('|');
    return {
      user_id,
      connection,
      phone_number: data.phone_number,
      'cp23pl1/roles': data['cp23pl1/roles'],
    };
  }
}
