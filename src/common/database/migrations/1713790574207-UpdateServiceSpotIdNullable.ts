import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServiceSpotIdNullable1713790574207 implements MigrationInterface {
  name = 'UpdateServiceSpotIdNullable1713790574207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "drive_request_feedback" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "drive_request_feedback" ADD "rating" integer NOT NULL DEFAULT '5'`,
    );
    await queryRunner.query(`ALTER TABLE "driver_rating" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "driver_rating" ADD "rating" integer NOT NULL DEFAULT '5'`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(
      `ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`,
    );
    await queryRunner.query(`ALTER TABLE "driver" ALTER COLUMN "serviceSpotId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "driver" DROP CONSTRAINT "FK_359c9d0b559243519d9b84e39a5"`,
    );
    await queryRunner.query(`ALTER TABLE "driver" ALTER COLUMN "serviceSpotId" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "driver" ADD CONSTRAINT "FK_359c9d0b559243519d9b84e39a5" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(`ALTER TABLE "driver_rating" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "driver_rating" ADD "rating" numeric(3,2) NOT NULL DEFAULT '5'`,
    );
    await queryRunner.query(`ALTER TABLE "drive_request_feedback" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "drive_request_feedback" ADD "rating" numeric(1,0) NOT NULL DEFAULT '5'`,
    );
  }
}
