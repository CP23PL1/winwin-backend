import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDriveRequestEntity1710407517972 implements MigrationInterface {
  name = 'UpdateDriveRequestEntity1710407517972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drive_request" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" ALTER COLUMN "status" DROP DEFAULT`);
  }
}
