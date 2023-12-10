import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Province } from './province.entity';
import { SubDistrict } from './sub-district.entity';

@Entity()
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nameTH: string;

  @Column({ unique: true })
  nameEN: string;

  @OneToMany(() => SubDistrict, (subDistrict) => subDistrict.district, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  subDistricts: SubDistrict[];

  @ManyToOne(() => Province, (province) => province.districts)
  province: Province;
}
