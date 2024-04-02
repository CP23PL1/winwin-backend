import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeFeedbackDefaultValues1712085425883 implements MigrationInterface {
    name = 'ChangeFeedbackDefaultValues1712085425883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "driver_rating" DROP CONSTRAINT "UQ_2e3527f7c70dcc7bb2b0dceeb83"`);
        await queryRunner.query(`ALTER TYPE "public"."driver_rating_category_enum" RENAME TO "driver_rating_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."feedback_category_enum" AS ENUM('manner', 'driving', 'vehicle', 'service')`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ALTER COLUMN "category" TYPE "public"."feedback_category_enum" USING "category"::"text"::"public"."feedback_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."driver_rating_category_enum_old"`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ALTER COLUMN "totalFeedbacks" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ADD CONSTRAINT "UQ_2e3527f7c70dcc7bb2b0dceeb83" UNIQUE ("driverId", "category")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver_rating" DROP CONSTRAINT "UQ_2e3527f7c70dcc7bb2b0dceeb83"`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ALTER COLUMN "totalFeedbacks" SET DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."driver_rating_category_enum_old" AS ENUM('manner', 'driving', 'vehicle', 'service')`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ALTER COLUMN "category" TYPE "public"."driver_rating_category_enum_old" USING "category"::"text"::"public"."driver_rating_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."driver_rating_category_enum_old" RENAME TO "driver_rating_category_enum"`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ADD CONSTRAINT "UQ_2e3527f7c70dcc7bb2b0dceeb83" UNIQUE ("category", "driverId")`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
    }

}
