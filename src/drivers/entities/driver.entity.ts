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
import { ServiceSpot } from '../../service-spots/entities/service-spot.entity';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';

@Entity()
export class Driver {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @ManyToOne(() => ServiceSpot, (serviceSpot) => serviceSpot.serviceSpotOwner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @Index()
  serviceSpot: ServiceSpot;

  @OneToMany(() => DriveRequest, (driveRequest) => driveRequest.driver)
  driveRequests: DriveRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
