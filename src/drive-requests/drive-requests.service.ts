import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { DataSource, DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { CreateDriveRequestFeedbackDto } from './dto/create-drive-request-feedback.dto';
import { DriveRequestFeedback } from './entities/drive-request-feedback.entity';
import { DriverRating } from 'src/drivers/entities/driver-rating.entity';

@Injectable()
export class DriveRequestsService {
  private readonly logger = new Logger(DriveRequestsService.name);

  constructor(
    @InjectRepository(DriveRequest)
    private driveRequestRepository: Repository<DriveRequest>,
    @InjectRepository(DriveRequestFeedback)
    private driveRequestFeedbackRepository: Repository<DriveRequestFeedback>,
    private dataSource: DataSource,
  ) {}

  async create(data: DeepPartial<DriveRequest>) {
    const newDriveRequest = await this.driveRequestRepository.save(data);
    return this.findOne(newDriveRequest.id);
  }

  findAllDriveRequestsByDriverId(driverId: string, query: PaginateQuery) {
    return paginate(query, this.driveRequestRepository, {
      sortableColumns: ['id', 'status', 'createdAt'],
      where: { driverId },
    });
  }

  async findOne(id: string, options?: FindOneOptions<DriveRequest>) {
    const driveRequest = await this.driveRequestRepository.findOne({
      ...(options || {}),
      where: { id },
    });
    if (!driveRequest) {
      return null;
    }
    return driveRequest;
  }

  async findOneOwned(id: string, userId: string) {
    const driveRequest = await this.driveRequestRepository
      .createQueryBuilder('driveRequest')
      .where(
        'driveRequest.id = :id AND (driveRequest.driverId = :userId OR driveRequest.userId = :userId)',
        { id, userId },
      )
      .getOne();

    if (!driveRequest) {
      return null;
    }
    return driveRequest;
  }

  async exists(id: string) {
    return this.driveRequestRepository.count({ where: { id } }).then((count) => count > 0);
  }

  async createFeedback(
    driveRequest: DriveRequest,
    createDriveRequestFeedbackDto: CreateDriveRequestFeedbackDto[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const queryBuilder = queryRunner.connection.createQueryBuilder();
      const newFeedbacks = createDriveRequestFeedbackDto.map((feedback) => ({
        driveRequestId: driveRequest.id,
        ...feedback,
      }));
      await queryBuilder.insert().into(DriveRequestFeedback).values(newFeedbacks).execute();

      const driverRatingRepo = queryRunner.manager.getRepository(DriverRating);
      const driverRatings = await driverRatingRepo.find({
        where: { driverId: driveRequest.driverId },
      });
      const updatedDriverRatings = driverRatings.map((driverRating) => {
        const feedback = createDriveRequestFeedbackDto.find(
          (feedback) => feedback.category === driverRating.category,
        );
        if (feedback) {
          driverRating.rating = driverRating.rating + feedback.rating;
          driverRating.totalFeedbacks += 1;
        }
        return driverRating;
      });
      await driverRatingRepo.save(updatedDriverRatings);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  calculatePriceByDistanceMeters(distanceMeters: number) {
    if (distanceMeters <= 0) {
      throw new Error('Distance must be greater than 0');
    }
    let price = 0;
    const distanceKm = Math.floor(distanceMeters / 1000);
    if (distanceKm <= 1.1) {
      price = 15;
    } else if (distanceKm <= 1.5) {
      price = 20;
    } else if (distanceKm <= 2) {
      price = 25;
    } else if (distanceKm <= 5) {
      price = (distanceKm - 2) * 5 + 25;
    } else if (distanceKm <= 10) {
      price = (distanceKm - 5) * 10 + 40;
    } else {
      price = 90;
    }
    return price;
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async computeFeedback() {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   this.logger.debug('Computing feedback ...');

  //   try {
  //     const queryBuilder = queryRunner.connection.createQueryBuilder();
  //     const computedDriverRating = await queryBuilder
  //       .from(DriveRequestFeedback, 'feedback')
  //       .leftJoinAndSelect('feedback.driveRequest', 'driveRequest')
  //       .select('driveRequest.driverId', 'driverId')
  //       .addSelect('feedback.category', 'category')
  //       .addSelect('CAST(COUNT(feedback.id) AS INT)', 'totalFeedbacks')
  //       .addSelect(
  //         'CAST((SUM(feedback.rating) / COUNT(feedback.id))::NUMERIC(3,2) AS FLOAT)',
  //         'rating',
  //       )
  //       .groupBy('driveRequest.driverId, feedback.category')
  //       .where("feedback.createdAt >= NOW() - INTERVAL '1' day")
  //       .getRawMany<Pick<DriverRating, 'driverId' | 'category' | 'rating' | 'totalFeedbacks'>>();
  //     console.log(computedDriverRating);
  //     await queryBuilder
  //       .insert()
  //       .into(DriverRating)
  //       .values(
  //         computedDriverRating.map((driveRequest) => ({
  //           driverId: driveRequest.driverId,
  //           category: driveRequest.category,
  //           rating: driveRequest.rating,
  //         })),
  //       )
  //       .orIgnore()
  //       .execute();
  //     const promises = [];
  //     for (const driverRating of computedDriverRating) {
  //       const exe = queryBuilder
  //         .update(DriverRating)
  //         .where('driverId = :driverId AND category = :category', driverRating)
  //         .set({
  //           rating: () =>
  //             `(rating + ${driverRating.rating}) / (totalFeedbacks + ${driverRating.totalFeedbacks})`,
  //           totalFeedbacks: () => `totalFeedbacks + ${driverRating.totalFeedbacks}`,
  //         })
  //         .execute();
  //       promises.push(exe);
  //     }
  //     await Promise.all(promises);
  //     await queryRunner.commitTransaction();
  //     this.logger.debug('Feedback computed');
  //   } catch (error: any) {
  //     await queryRunner.rollbackTransaction();
  //     console.error(error);
  //     this.logger.error('Failed to compute feedback, rolling back transaction');
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
