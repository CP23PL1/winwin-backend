import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCreateServiceSpotHasDriver1708095159098 implements MigrationInterface {
    name = 'UpdateCreateServiceSpotHasDriver1708095159098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot_has_driver" DROP CONSTRAINT "FK_004c35a32e1c0226c576b58bee3"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "service_spot_has_driver" ADD CONSTRAINT "FK_004c35a32e1c0226c576b58bee3" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot_has_driver" DROP CONSTRAINT "FK_004c35a32e1c0226c576b58bee3"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "service_spot_has_driver" ADD CONSTRAINT "FK_004c35a32e1c0226c576b58bee3" FOREIGN KEY ("serviceSpotId") REFERENCES "service_spot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
