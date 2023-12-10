import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district.entity';

@Entity()
export class SubDistrict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nameTH: string;

  @Column({ unique: true })
  nameEN: string;

  @ManyToOne(() => District, (district) => district.subDistricts)
  district: District;
}
