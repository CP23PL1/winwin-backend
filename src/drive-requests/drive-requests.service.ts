import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { DriversService } from 'src/drivers/drivers.service';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { CreateDriveRequestFeedbackDto } from './dto/create-drive-request-feedback.dto';
import { DriveRequestFeedback } from './entities/drive-request-feedback.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DriverRating } from 'src/drivers/entities/driver-rating.entity';

@Injectable()
export class DriveRequestsService {
  private readonly logger = new Logger(DriveRequestsService.name);

  constructor(
    @InjectRepository(DriveRequest)
    private driveRequestRepository: Repository<DriveRequest>,
    @InjectRepository(DriveRequestFeedback)
    private driveRequestFeedbackRepository: Repository<DriveRequestFeedback>,
    private driversService: DriversService,
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

  async findOne(id: string) {
    const driveRequest = await this.driveRequestRepository.findOne({ where: { id } });
    const driver = await this.driversService.findOne(driveRequest.driverId);
    return {
      ...driveRequest,
      driver,
    };
  }

  async exists(id: string) {
    return this.driveRequestRepository.count({ where: { id } }).then((count) => count > 0);
  }

  async createFeedback(id: string, data: CreateDriveRequestFeedbackDto) {
    const mappedFeedback = data.category.map((category) => ({
      driveRequest: {
        id: id,
      },
      category,
      rating: data.rating,
    }));
    await this.driveRequestFeedbackRepository.save(mappedFeedback);
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

  @Cron(CronExpression.EVERY_12_HOURS)
  async computeFeedback() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    this.logger.debug('Computing feedback ...');

    try {
      const queryBuilder = queryRunner.manager.createQueryBuilder();
      const computedDriverRating = await queryBuilder
        .from(DriveRequestFeedback, 'feedback')
        .leftJoinAndSelect('feedback.driveRequest', 'driveRequest')
        .select('driveRequest.driverId', 'driverId')
        .addSelect('feedback.category', 'category')
        .addSelect('CAST(AVG(feedback.rating)::NUMERIC(3,2) AS FLOAT)', 'rating')
        .groupBy('driveRequest.driverId, feedback.category')
        .getRawMany<Pick<DriverRating, 'driverId' | 'category' | 'rating'>>();

      const driverRating = this.dataSource.getRepository(DriverRating);
      await driverRating.save(computedDriverRating, { chunk: 1000 });

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to compute feedback, rolling back transaction');
    } finally {
      await queryRunner.release();
      this.logger.debug('Feedback computed');
    }
  }
}
