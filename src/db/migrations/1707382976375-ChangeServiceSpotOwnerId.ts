import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeServiceSpotOwnerId1707382976375 implements MigrationInterface {
  name = 'ChangeServiceSpotOwnerId1707382976375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" RENAME COLUMN "serviceSpotOwnerUid" TO "serviceSpotOwnerId"`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerId"`);
    await queryRunner.query(`ALTER TABLE "service_spot" ADD "serviceSpotOwnerId" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f" UNIQUE ("serviceSpotOwnerId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f"`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "serviceSpotOwnerId"`);
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD "serviceSpotOwnerId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" RENAME COLUMN "serviceSpotOwnerId" TO "serviceSpotOwnerUid"`,
    );
  }
}
