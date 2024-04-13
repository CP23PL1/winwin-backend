import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServiceSpotHasDrivers1708094577427 implements MigrationInterface {
    name = 'CreateServiceSpotHasDrivers1708094577427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_spot_has_driver" ("id" SERIAL NOT NULL, "driverId" integer NOT NULL, "serviceSpotId" integer, CONSTRAINT "UQ_9d66f1586b9e1aa1a2e1e46bdec" UNIQUE ("driverId"), CONSTRAINT "PK_3827a8bdab4fa9776e4d9de5248" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "service_spot_has_driver" ADD CONSTRAINT "FK_004c35a32e1c0226c576b58bee3" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot_has_driver" DROP CONSTRAINT "FK_004c35a32e1c0226c576b58bee3"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`DROP TABLE "service_spot_has_driver"`);
    }

}
