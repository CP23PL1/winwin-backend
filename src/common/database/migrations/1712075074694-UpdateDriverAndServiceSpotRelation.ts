import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDriverAndServiceSpotRelation1712075074694 implements MigrationInterface {
  name = 'UpdateDriverAndServiceSpotRelation1712075074694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_05b4bd09b8a0d5bf669c644d12"`);
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f" UNIQUE ("serviceSpotOwnerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f" FOREIGN KEY ("serviceSpotOwnerId") REFERENCES "driver"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_05b4bd09b8a0d5bf669c644d12f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05b4bd09b8a0d5bf669c644d12" ON "service_spot" ("serviceSpotOwnerId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "FK_05b4bd09b8a0d5bf669c644d12f" FOREIGN KEY ("serviceSpotOwnerId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
