import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneNumberColumnToDriver1701254542190 implements MigrationInterface {
    name = 'AddPhoneNumberColumnToDriver1701254542190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver" ADD "phoneNumber" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "phoneNumber"`);
    }

}
