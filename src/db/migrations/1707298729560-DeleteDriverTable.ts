import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteDriverTable1707298729560 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop Constraint
    await queryRunner.query(
      `ALTER TABLE "service_spot" DROP CONSTRAINT "FK_8559f83d04890fc46edd3685ed2"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "driver"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
