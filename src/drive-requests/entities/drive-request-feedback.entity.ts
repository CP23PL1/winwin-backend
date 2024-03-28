import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DriveRequest } from './drive-request.entity';

export const feedbackCategoties = ['manner', 'driving', 'vehicle', 'service'] as const;
export type FeedbackCategory = (typeof feedbackCategoties)[number];

@Entity()
export class DriveRequestFeedback {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => DriveRequest, (driveRequest) => driveRequest.feedback, {
    onDelete: 'CASCADE',
  })
  @Index()
  driveRequest: DriveRequest;

  @Column({
    type: 'numeric',
    default: 5,
    precision: 1,
    scale: 0,
  })
  rating: number;

  @Column({
    type: 'enum',
    enum: feedbackCategoties,
  })
  category: FeedbackCategory;

  @CreateDateColumn()
  createdAt: Date;
}
