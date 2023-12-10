import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Province } from './province.entity';
import { SubDistrict } from './sub-district.entity';

@Entity()
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameTH: string;

  @Column()
  nameEN: string;

  @OneToMany(() => SubDistrict, (subDistrict) => subDistrict.district, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  subDistricts: SubDistrict[];

  @ManyToOne(() => Province, (province) => province.districts)
  @Index()
  province: Province;
}
