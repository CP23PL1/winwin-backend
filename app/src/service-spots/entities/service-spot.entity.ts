import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
