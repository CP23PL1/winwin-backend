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
  driveRequest: DriveRequest;

  @Column()
  @Index()
  driveRequestId: DriveRequest['id'];

  @Column({
    default: 5,
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
