import { SubDistrict } from 'src/addresses/entities/sub-district.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
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

  @Column()
  subDistrictId: number;

  @ManyToOne(() => SubDistrict, (subDistrict) => subDistrict.serviceSpots)
  @Index()
  subDistrict: SubDistrict;

  @Column({ type: 'geometry' })
  @Index({ spatial: true })
  coords: Point;

  @Column({
    default: false,
  })
  approved: boolean;

  @OneToMany(() => Driver, (driver) => driver.serviceSpot)
  drivers: Driver[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
