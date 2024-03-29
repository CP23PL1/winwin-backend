import {
  FeedbackCategory,
  feedbackCategoties,
} from 'src/drive-requests/entities/drive-request-feedback.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';

@Entity()
@Unique(['driverId', 'category'])
export class DriverRating {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
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

  @Column({
    default: 0,
  })
  totalFeedbacks: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
