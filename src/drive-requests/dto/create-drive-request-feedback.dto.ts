import { IsIn, IsNotEmpty, IsPositive, Max, Min } from 'class-validator';
import { FeedbackCategory, feedbackCategoties } from '../entities/drive-request-feedback.entity';

export class CreateDriveRequestFeedbackDto {
  @IsPositive()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsNotEmpty()
  @IsIn(feedbackCategoties)
  category: FeedbackCategory;
}
