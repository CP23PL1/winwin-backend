import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';
import { DriverRating } from './driver-rating.entity';
import { ServiceSpot } from 'src/service-spots/entities/service-spot.entity';

export enum DriverRole {
  MEMBER = 'member',
  OWNER = 'owner',
}

@Entity()
export class Driver {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: DriverRole,
    default: DriverRole.MEMBER,
  })
  role: DriverRole;

  @ManyToOne(() => ServiceSpot, (serviceSpot) => serviceSpot.drivers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Index()
  serviceSpot: ServiceSpot;

  @Column()
  serviceSpotId: ServiceSpot['id'];

  @OneToMany(() => DriveRequest, (driveRequest) => driveRequest.driver)
  driveRequests: DriveRequest[];

  @OneToMany(() => DriverRating, (rating) => rating.driver)
  ratings: DriverRating[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
