import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceSpotOwner1702304462650 implements MigrationInterface {
  name = 'AddServiceSpotOwner1702304462650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD "serviceSpotOwnerUid" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_8559f83d04890fc46edd3685ed2" UNIQUE ("serviceSpotOwnerUid")`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "FK_8559f83d04890fc46edd3685ed2" FOREIGN KEY ("serviceSpotOwnerUid") REFERENCES "driver"("uid") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "FK_8559f83d04890fc46edd3685ed2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_8559f83d04890fc46edd3685ed2"`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerUid"`);
  }
}
