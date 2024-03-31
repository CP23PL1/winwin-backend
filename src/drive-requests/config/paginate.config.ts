import { PaginateConfig } from 'nestjs-paginate';
import { DriveRequest } from '../entities/drive-request.entity';

export const driveRequestPaginateConfig: PaginateConfig<DriveRequest> = {
  sortableColumns: ['id', 'status', 'createdAt'],
  defaultSortBy: [['createdAt', 'DESC']],
  defaultLimit: 10,
  maxLimit: 20,
};
