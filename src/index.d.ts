import { UserInfoDto } from './authorization/dto/user-info.dto';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserInfoDto;
  }
}
