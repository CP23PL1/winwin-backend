import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceSpot } from './service-spot.entity';

@Entity()
export class ServiceSpotHasDriver {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ServiceSpot, (serviceSpot) => serviceSpot.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  serviceSpot: ServiceSpot;

  @Column({
    unique: true,
  })
  driverId: number;
}
