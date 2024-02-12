import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteDriverTable1707298729560 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "driver"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
