import { PickType } from '@nestjs/swagger';
import { ServiceSpotInviteDto } from './service-spot-invite.dto';

export class JoinServiceSpot extends PickType(ServiceSpotInviteDto, ['code']) {}
