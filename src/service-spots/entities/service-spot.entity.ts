import { Driver } from 'src/drivers/entities/driver.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

  @Column({ type: 'geometry' })
  @Index({ spatial: true })
  coords: Point;

  @Column({ unique: true })
  placeId: string;

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
