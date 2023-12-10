import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district.entity';
import { ServiceSpot } from 'src/service-spots/entities/service-spot.entity';

@Entity()
export class SubDistrict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameTH: string;

  @Column()
  nameEN: string;

  @ManyToOne(() => District, (district) => district.subDistricts)
  @Index()
  district: District;

  @OneToMany(() => ServiceSpot, (serviceSpot) => serviceSpot.subDistrict)
  serviceSpots: ServiceSpot[];
}
