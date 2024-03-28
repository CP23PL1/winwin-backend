import { Driver } from 'src/drivers/entities/driver.entity';
import { Waypoint } from 'src/shared/dtos/place.dto';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { DriveRequestFeedback } from './drive-request-feedback.entity';

export enum DriveRequestStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class DriveRequest {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.driveRequests, { eager: true, onDelete: 'CASCADE' })
  @Index()
  user: User;

  @Column()
  driverId: string;

  @ManyToOne(() => Driver, (driver) => driver.driveRequests, { eager: true, onDelete: 'CASCADE' })
  @Index()
  driver: Driver;

  @Column({ type: 'jsonb' })
  origin: Waypoint;

  @Column({ type: 'jsonb' })
  destination: Waypoint;

  @Column()
  distanceMeters: number;

  @Column()
  paidAmount: number;

  @Column({
    type: 'enum',
    enum: DriveRequestStatus,
    enumName: 'drive_request_status',
  })
  status: DriveRequestStatus;

  @OneToMany(() => DriveRequestFeedback, (feedback) => feedback.driveRequest)
  feedback: DriveRequestFeedback[];

  @CreateDateColumn()
  createdAt: Date;
}
