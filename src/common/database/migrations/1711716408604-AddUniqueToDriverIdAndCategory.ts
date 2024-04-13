import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueToDriverIdAndCategory1711716408604 implements MigrationInterface {
    name = 'AddUniqueToDriverIdAndCategory1711716408604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0de99cb3d068b0d42bfd652086"`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ADD "totalFeedbacks" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "driver_rating" DROP CONSTRAINT "FK_0de99cb3d068b0d42bfd6520864"`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ALTER COLUMN "driverId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ADD CONSTRAINT "UQ_2e3527f7c70dcc7bb2b0dceeb83" UNIQUE ("driverId", "category")`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ADD CONSTRAINT "FK_0de99cb3d068b0d42bfd6520864" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver_rating" DROP CONSTRAINT "FK_0de99cb3d068b0d42bfd6520864"`);
        await queryRunner.query(`ALTER TABLE "driver_rating" DROP CONSTRAINT "UQ_2e3527f7c70dcc7bb2b0dceeb83"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ALTER COLUMN "driverId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "driver_rating" ADD CONSTRAINT "FK_0de99cb3d068b0d42bfd6520864" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver_rating" DROP COLUMN "totalFeedbacks"`);
        await queryRunner.query(`CREATE INDEX "IDX_0de99cb3d068b0d42bfd652086" ON "driver_rating" ("driverId") `);
    }

}
