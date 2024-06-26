import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { AuditingSubscriber } from 'typeorm-auditing';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  subscribers: [AuditingSubscriber, 'dist/**/*.subscriber.js'],
  migrations: ['dist/common/database/migrations/*.js'],
  migrationsRun: true,
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
