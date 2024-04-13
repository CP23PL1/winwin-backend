import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDriveRequestEntity1711460400924 implements MigrationInterface {
  name = 'UpdateDriveRequestEntity1711460400924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "refCode"`);
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "drive_request" ADD "distanceMeters" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "drive_request" ADD "paidAmount" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "drive_request" DROP CONSTRAINT "PK_07ab586b9fb2a58f8ebd9f817d3"`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "drive_request" ADD "id" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "drive_request" ADD CONSTRAINT "PK_07ab586b9fb2a58f8ebd9f817d3" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."drive_request_status" RENAME TO "drive_request_status_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."drive_request_status" AS ENUM('completed', 'cancelled')`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "drive_request" ALTER COLUMN "status" TYPE "public"."drive_request_status" USING "status"::"text"::"public"."drive_request_status"`,
    );
    await queryRunner.query(`DROP TYPE "public"."drive_request_status_old"`);
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."drive_request_status_old" AS ENUM('pending', 'on_going', 'arrived', 'picked_up', 'completed', 'cancelled')`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "drive_request" DROP CONSTRAINT "PK_07ab586b9fb2a58f8ebd9f817d3"`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "drive_request" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "drive_request" ADD CONSTRAINT "PK_07ab586b9fb2a58f8ebd9f817d3" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "paidAmount"`);
    await queryRunner.query(`ALTER TABLE "drive_request" DROP COLUMN "distanceMeters"`);
    await queryRunner.query(
      `ALTER TABLE "drive_request" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request" ADD "refCode" character varying NOT NULL`);
  }
}
