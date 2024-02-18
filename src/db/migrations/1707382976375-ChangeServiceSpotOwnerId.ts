import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeServiceSpotOwnerId1707382976375 implements MigrationInterface {
  name = 'ChangeServiceSpotOwnerId1707382976375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" RENAME COLUMN "serviceSpotOwnerUid" TO "serviceSpotOwnerId"`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" RENAME COLUMN "serviceSpotOwnerId" TO "serviceSpotOwnerUid"`,
    );
  }
}
