import { SubDistrict } from 'src/addresses/entities/sub-district.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ unique: true })
  placeId: string;

  @Column({
    default: false,
  })
  approved: boolean;

  @OneToOne(() => Driver, {
    nullable: false,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  serviceSpotOwner: Driver;

  @Column()
  serviceSpotOwnerUid: string;

  @OneToMany(() => Driver, (driver) => driver.serviceSpot)
  drivers: Driver[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
