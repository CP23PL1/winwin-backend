import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceSpot } from './service-spot.entity';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';

@Entity()
export class DriverHasServiceSpot {
  @PrimaryColumn()
  driverId: number;

  @ManyToOne(() => ServiceSpot, (serviceSpot) => serviceSpot.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
