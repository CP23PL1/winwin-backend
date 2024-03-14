import { Driver } from 'src/drivers/entities/driver.entity';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DriveRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity()
export class DriveRequest {
  @PrimaryGeneratedColumn('increment')
  id: number;

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
  origin: Coordinate;

  @Column({ type: 'jsonb' })
  destination: Coordinate;

  @Column({
    type: 'enum',
    enum: DriveRequestStatus,
    enumName: 'drive_request_status',
    default: DriveRequestStatus.PENDING,
  })
  status: DriveRequestStatus;

  @Column()
  refCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
