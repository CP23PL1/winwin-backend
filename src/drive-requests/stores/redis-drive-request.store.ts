import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { DriveRequestSession, DriveRequestSessionStatus } from './dto/drive-request-session.dto';
import { DriveRequestChatDto } from './dto/drive-request-chat.dto';

@Injectable()
export class RedisDriveRequestStore {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  exists(sid: string) {
    return this.redis.exists(`drive-request:${sid}`);
  }

  saveMessage(sid: string, message: DriveRequestChatDto) {
    return this.redis.rpush(`drive-request:${sid}:messages`, JSON.stringify(message));
  }

  async findMessages(sid: string) {
    return this.redis
      .lrange(`drive-request:${sid}:messages`, 0, -1)
      .then((messages) => messages.map((message) => JSON.parse(message)));
  }

  async saveDriveRequest(sid: string, data: Partial<DriveRequestSession>) {
    const serializedData = this.serialize(data);
    const ttl = 86400; // 1 day
    await this.redis
      .multi()
      .hset(`drive-request:${sid}`, serializedData)
      .expire(`drive-request:${sid}`, ttl)
      .exec();
  }

  removeDriveRequest(sid: string) {
    return this.redis
      .multi()
      .del(`drive-request:${sid}`)
      .del(`drive-request:${sid}:messages`)
      .exec();
  }

  async findDriveRequest(sid: string): Promise<DriveRequestSession> {
    return this.redis
      .hmget(
        `drive-request:${sid}`,
        'id',
        'userId',
        'driverId',
        'origin',
        'destination',
        'polyline',
        'duration',
        'distanceMeters',
        'status',
        'createdAt',
        'priceByDistance',
        'total',
        'serviceCharge',
      )
      .then(this.deserialize);
  }

  private serialize(data: Partial<DriveRequestSession>) {
    const map = new Map<string, string>();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        map.set(key, JSON.stringify(value));
      } else {
        map.set(key, value.toString());
      }
    });
    return map;
  }

  private deserialize([
    id,
    userId,
    driverId,
    origin,
    destination,
    polyline,
    duration,
    distanceMeters,
    status,
    createdAt,
    priceByDistance,
    total,
    serviceCharge,
  ]: string[]) {
    return {
      id,
      userId,
      driverId,
      origin: JSON.parse(origin) as DriveRequestSession['origin'],
      destination: JSON.parse(destination) as DriveRequestSession['destination'],
      polyline: JSON.parse(polyline) as DriveRequestSession['polyline'],
      duration,
      distanceMeters: +distanceMeters,
      status: status as DriveRequestSession['status'],
      createdAt,
      priceByDistance: +priceByDistance,
      total: +total,
      serviceCharge: +serviceCharge,
    };
  }

  canTransitionTo(currentStatus: DriveRequestSessionStatus, nextStatus: DriveRequestSessionStatus) {
    const validNextStatuses = this.getDriveRequestSessionStateMachine(currentStatus);
    return validNextStatuses.includes(nextStatus);
  }

  getDriveRequestSessionStateMachine(currentStatus: DriveRequestSessionStatus) {
    switch (currentStatus) {
      case DriveRequestSessionStatus.PENDING:
        return [DriveRequestSessionStatus.ON_GOING];
      case DriveRequestSessionStatus.ON_GOING:
        return [DriveRequestSessionStatus.ARRIVED, DriveRequestSessionStatus.CANCELLED];
      case DriveRequestSessionStatus.ARRIVED:
        return [DriveRequestSessionStatus.PICKED_UP, DriveRequestSessionStatus.CANCELLED];
      case DriveRequestSessionStatus.PICKED_UP:
        return [DriveRequestSessionStatus.COMPLETED];
      default:
        return [];
    }
  }
}
