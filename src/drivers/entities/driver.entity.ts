import { ServiceSpot } from 'src/service-spots/entities/service-spot.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

const enumVersion = 1;

export enum DriverRole {
  Owner = 'owner',
  Member = 'member',
}

@Entity()
export class Driver {
  @PrimaryColumn()
  uid: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column({
    default: false,
  })
  approved: boolean;

  @Column({
    type: 'enum',
    enumName: `EDriverRole_${enumVersion}`,
    nullable: false,
    enum: DriverRole,
  })
  role: DriverRole;

  @ManyToOne(() => ServiceSpot, (serviceSpot) => serviceSpot.drivers, {
    onDelete: 'CASCADE',
  })
  serviceSpot: ServiceSpot;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
