import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePlaceId1708087206789 implements MigrationInterface {
  name = 'RemovePlaceId1708087206789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "UQ_17f7d7199780065e94630b86c0e"`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" DROP COLUMN "placeId"`);
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ADD "placeId" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "service_spot" ADD CONSTRAINT "UQ_17f7d7199780065e94630b86c0e" UNIQUE ("placeId")`,
    );
  }
}
