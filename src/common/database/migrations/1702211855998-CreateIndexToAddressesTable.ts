import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIndexToAddressesTable1702211855998 implements MigrationInterface {
    name = 'CreateIndexToAddressesTable1702211855998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
        await queryRunner.query(`CREATE INDEX "IDX_8af6e624022d3c72f61e2cff63" ON "sub_district" ("districtId") `);
        await queryRunner.query(`CREATE INDEX "IDX_23a21b38208367a242b1dd3a42" ON "district" ("provinceId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_23a21b38208367a242b1dd3a42"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8af6e624022d3c72f61e2cff63"`);
        await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`);
    }

}
