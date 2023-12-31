import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDriverTable1701916206203 implements MigrationInterface {
  name = 'UpdateDriverTable1701916206203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "driver" ADD "dateOfBirth" TIMESTAMP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "driver" ADD "nationalId" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "driver" ADD CONSTRAINT "UQ_3f25ccaaf960c1725d5887c8acd" UNIQUE ("nationalId")`,
    );
    await queryRunner.query(`ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry`);
    await queryRunner.query(
      `ALTER TABLE "driver" ADD CONSTRAINT "UQ_f248be80b08997f667b0404c910" UNIQUE ("phoneNumber")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "driver" DROP CONSTRAINT "UQ_f248be80b08997f667b0404c910"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_spot" ALTER COLUMN "coords" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver" DROP CONSTRAINT "UQ_3f25ccaaf960c1725d5887c8acd"`,
    );
    await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "nationalId"`);
    await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "dateOfBirth"`);
  }
}
