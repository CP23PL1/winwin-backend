import {
  FeedbackCategory,
  feedbackCategoties,
} from 'src/drive-requests/entities/drive-request-feedback.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';

@Entity()
export class DriverRating {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @Index()
  driverId: string;

  @ManyToOne(() => Driver, (driver) => driver.ratings, {
    onDelete: 'CASCADE',
  })
  driver: Driver;

  @Column({
    type: 'numeric',
    default: 5,
    precision: 3,
    scale: 2,
  })
  rating: number;

  @Column({
    type: 'enum',
    enum: feedbackCategoties,
  })
  category: FeedbackCategory;

  @UpdateDateColumn()
  updatedAt: Date;
}
