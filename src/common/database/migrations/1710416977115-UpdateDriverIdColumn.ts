import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDriverIdColumn1710416977115 implements MigrationInterface {
    name = 'UpdateDriverIdColumn1710416977115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drive_request" DROP CONSTRAINT "FK_54b6d3ee422423b47b236e7b400"`);
        await queryRunner.query(`ALTER TABLE "drive_request" ALTER COLUMN "driverId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD CONSTRAINT "FK_54b6d3ee422423b47b236e7b400" FOREIGN KEY ("driverId") REFERENCES "driver_has_service_spot"("driverId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drive_request" DROP CONSTRAINT "FK_54b6d3ee422423b47b236e7b400"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "drive_request" ALTER COLUMN "driverId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "drive_request" ADD CONSTRAINT "FK_54b6d3ee422423b47b236e7b400" FOREIGN KEY ("driverId") REFERENCES "driver_has_service_spot"("driverId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
