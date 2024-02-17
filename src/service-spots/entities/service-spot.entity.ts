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
import { ServiceSpotHasDriver } from './service-spot-has-driver.entity';

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

  @OneToMany(() => ServiceSpotHasDriver, (serviceSpotHasDriver) => serviceSpotHasDriver.serviceSpot)
  serviceSpotHasDrivers: ServiceSpotHasDriver[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
