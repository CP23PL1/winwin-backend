import { WsAck } from './ws-ack.dto';

export class WsErrorAck extends WsAck {
  constructor(message: string) {
    super(message, undefined, false);
  }
}
