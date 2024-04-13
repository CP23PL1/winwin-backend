import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDriveRequestStatus1711372368267 implements MigrationInterface {
  name = 'UpdateDriveRequestStatus1711372368267';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."drive_request_status" RENAME TO "drive_request_status_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."drive_request_status" AS ENUM('pending', 'on_going', 'arrived', 'picked_up', 'completed', 'cancelled')`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "drive_request" ALTER COLUMN "status" TYPE "public"."drive_request_status" USING "status"::"text"::"public"."drive_request_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_request" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."drive_request_status_old"`);
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."drive_request_status_old" AS ENUM('pending', 'accepted', 'picked_up', 'rejected', 'cancelled', 'completed')`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "drive_request" ALTER COLUMN "status" TYPE "public"."drive_request_status_old" USING "status"::"text"::"public"."drive_request_status_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drive_request" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."drive_request_status"`);
    await queryRunner.query(
      `ALTER TYPE "public"."drive_request_status_old" RENAME TO "drive_request_status"`,
    );
  }
}
