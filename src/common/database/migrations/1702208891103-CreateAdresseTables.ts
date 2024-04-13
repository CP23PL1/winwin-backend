import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdresseTables1702208891103 implements MigrationInterface {
  name = 'CreateAdresseTables1702208891103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "province" ("id" SERIAL NOT NULL, "nameTH" character varying NOT NULL, "nameEN" character varying NOT NULL, CONSTRAINT "PK_4f461cb46f57e806516b7073659" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_district" ("id" SERIAL NOT NULL, "nameTH" character varying NOT NULL, "nameEN" character varying NOT NULL, "districtId" integer, CONSTRAINT "PK_3feea0f1a7cdea813373a32e653" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "district" ("id" SERIAL NOT NULL, "nameTH" character varying NOT NULL, "nameEN" character varying NOT NULL, "provinceId" integer, CONSTRAINT "PK_ee5cb6fd5223164bb87ea693f1e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD "addressLine1" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ADD "addressLine2" character varying`);
    await queryRunner.query(`ALTER TABLE "service_spot" ADD "subDistrictId" integer`);
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(
      `CREATE INDEX "IDX_5de6541077900c7155b8254cfd" ON "service_spot" ("subDistrictId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "FK_5de6541077900c7155b8254cfdd" FOREIGN KEY ("subDistrictId") REFERENCES "sub_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_district" ADD CONSTRAINT "FK_8af6e624022d3c72f61e2cff631" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "district" ADD CONSTRAINT "FK_23a21b38208367a242b1dd3a424" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "district" DROP CONSTRAINT "FK_23a21b38208367a242b1dd3a424"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_district" DROP CONSTRAINT "FK_8af6e624022d3c72f61e2cff631"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "FK_5de6541077900c7155b8254cfdd"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_5de6541077900c7155b8254cfd"`);
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "subDistrictId"`);
    await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "addressLine2"`);
    await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "addressLine1"`);
    await queryRunner.query(`DROP TABLE "district"`);
    await queryRunner.query(`DROP TABLE "sub_district"`);
    await queryRunner.query(`DROP TABLE "province"`);
  }
}
