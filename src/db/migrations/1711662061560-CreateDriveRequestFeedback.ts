import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDriveRequestFeedback1711662061560 implements MigrationInterface {
    name = 'CreateDriveRequestFeedback1711662061560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."drive_request_feedback_category_enum" AS ENUM('manner', 'driving', 'vehicle', 'service')`);
        await queryRunner.query(`CREATE TABLE "drive_request_feedback" ("id" SERIAL NOT NULL, "rating" numeric(1,0) NOT NULL DEFAULT '5', "category" "public"."drive_request_feedback_category_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "driveRequestId" character varying, CONSTRAINT "PK_ca4778b6cef7d2c938f0d75d3e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7a110922168a64cb68306cbeec" ON "drive_request_feedback" ("driveRequestId") `);
        await queryRunner.query(`CREATE TYPE "public"."driver_rating_category_enum" AS ENUM('manner', 'driving', 'vehicle', 'service')`);
        await queryRunner.query(`CREATE TABLE "driver_rating" ("id" SERIAL NOT NULL, "rating" numeric(3,2) NOT NULL DEFAULT '5', "category" "public"."driver_rating_category_enum" NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "driverId" character varying, CONSTRAINT "PK_aefd5a86afc24e97c6ebf2ce97a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0de99cb3d068b0d42bfd652086" ON "driver_rating" ("driverId") `);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "drive_request_feedback" ADD CONSTRAINT "FK_7a110922168a64cb68306cbeec5" FOREIGN KEY ("driveRequestId") REFERENCES "drive_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ADD CONSTRAINT "FK_0de99cb3d068b0d42bfd6520864" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver_rating" DROP CONSTRAINT "FK_0de99cb3d068b0d42bfd6520864"`);
        await queryRunner.query(`ALTER TABLE "drive_request_feedback" DROP CONSTRAINT "FK_7a110922168a64cb68306cbeec5"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0de99cb3d068b0d42bfd652086"`);
        await queryRunner.query(`DROP TABLE "driver_rating"`);
        await queryRunner.query(`DROP TYPE "public"."driver_rating_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a110922168a64cb68306cbeec"`);
        await queryRunner.query(`DROP TABLE "drive_request_feedback"`);
        await queryRunner.query(`DROP TYPE "public"."drive_request_feedback_category_enum"`);
    }

}
