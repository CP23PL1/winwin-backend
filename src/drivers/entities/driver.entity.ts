import { ServiceSpot } from 'src/service-spots/entities/service-spot.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Driver {
  @PrimaryColumn()
  uid: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
  })
  phoneNumber: string;

  @Column()
  dateOfBirth: Date;

  @Column({
    unique: true,
  })
  nationalId: string;

  @Column({
    default: false,
  })
  approved: boolean;

  @ManyToOne(() => ServiceSpot, (serviceSpot) => serviceSpot.drivers, {
    onDelete: 'SET NULL',
  })
  serviceSpot: ServiceSpot;

  @Column({ nullable: true })
  serviceSpotId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
