import { SubDistrict } from 'src/addresses/entities/sub-district.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';
import { DriverHasServiceSpot } from './service-spot-has-driver.entity';

@Entity()
export class ServiceSpot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @ManyToOne(() => SubDistrict, (subDistrict) => subDistrict.serviceSpots)
  @Index()
  subDistrict: SubDistrict;

  @Column()
  subDistrictId: number;

  @Column({ type: 'geometry' })
  @Index({ spatial: true })
  coords: Point;

  @Column({
    default: false,
  })
  approved: boolean;

  @Column({ unique: true })
  serviceSpotOwnerId: number;

  @OneToMany(() => DriverHasServiceSpot, (serviceSpotHasDriver) => serviceSpotHasDriver.serviceSpot)
  drivers: DriverHasServiceSpot[];

  @OneToMany(() => DriveRequest, (driveRequest) => driveRequest.driver)
  driveRequests: DriveRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
