import { Socket } from 'socket.io';
import { Auth0JwtService } from './auth0-jwt.service';

export const auth0JwtSocketIoMiddleware = (auth0JwtService: Auth0JwtService) => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Unauthorized'));
    }
    const valid = await auth0JwtService.verify(token);
    if (!valid) {
      return next(new Error('Unauthorized'));
    }
    socket.data.user = await auth0JwtService.getUserInfo(token);
    socket.data.decodedToken = auth0JwtService.decode(token);
    return next();
  };
};
