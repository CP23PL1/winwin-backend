import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Driver } from '../entities/driver.entity';
import { DriverRating } from '../entities/driver-rating.entity';

@EventSubscriber()
export class DriverSubscriber implements EntitySubscriberInterface<Driver> {
  listenTo() {
    return Driver;
  }

  async afterInsert(event: InsertEvent<Driver>) {
    const { feedbackCategoties } = await import(
      '../../drive-requests/entities/drive-request-feedback.entity'
    );

    const driverRatings = feedbackCategoties.map((category) => {
      const rating = new DriverRating();
      rating.driverId = event.entity.id;
      rating.category = category;
      rating.rating = 5;
      rating.totalFeedbacks = 1;
      return rating;
    });

    await event.manager.getRepository(DriverRating).save(driverRatings);
  }
}
