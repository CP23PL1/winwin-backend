import { DriverHasServiceSpot } from 'src/service-spots/entities/service-spot-has-driver.entity';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
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
  @Index()
  userId: number;

  @ManyToOne(() => User, (user) => user.driveRequests, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column()
  @Index()
  driverId: number;

  @ManyToOne(
    () => DriverHasServiceSpot,
    (driverHasServiceSpot) => driverHasServiceSpot.driveRequests,
    { eager: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'driverId' })
  driver: DriverHasServiceSpot;

  @Column({ type: 'jsonb' })
  origin: Coordinate;

  @Column({ type: 'jsonb' })
  destination: Coordinate;

  @Column({
    type: 'enum',
    enum: DriveRequestStatus,
    enumName: 'drive_request_status',
  })
  status: DriveRequestStatus;

  @Column()
  refCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
