import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { District } from './district.entity';

@Entity()
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameTH: string;

  @Column()
  nameEN: string;

  @OneToMany(() => District, (district) => district.province, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  districts: District[];
}
